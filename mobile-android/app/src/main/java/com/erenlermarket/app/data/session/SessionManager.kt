package com.erenlermarket.app.data.session

import com.erenlermarket.app.data.local.TokenStore
import com.erenlermarket.app.data.remote.TokenProvider
import com.erenlermarket.app.domain.model.AuthTokens
import com.erenlermarket.app.domain.model.RegisterInput
import com.erenlermarket.app.domain.model.User
import com.erenlermarket.app.domain.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.runBlocking
import javax.inject.Inject
import javax.inject.Singleton

sealed interface SessionState {
    data object Loading : SessionState
    data object SignedOut : SessionState
    data class SignedIn(val user: User) : SessionState
}

/**
 * Oturum durumu + token yaşam döngüsü. `TokenProvider` olarak OkHttp
 * `AuthInterceptor`'a verilir; `TokenAuthenticator` yenileme sonuçlarını buraya bildirir.
 */
@Singleton
class SessionManager @Inject constructor(
    private val tokenStore: TokenStore,
    private val authRepository: AuthRepository,
) : TokenProvider {

    private val _state = MutableStateFlow<SessionState>(SessionState.Loading)
    val state: StateFlow<SessionState> = _state.asStateFlow()

    /** Interceptor'ın senkron okuması için önbelleğe alınmış erişim token'ı. */
    @Volatile
    private var cachedAccessToken: String? = null

    val currentUser: User? get() = (_state.value as? SessionState.SignedIn)?.user

    override fun accessToken(): String? = cachedAccessToken

    /** Açılışta çağrılır: saklı token varsa `/auth/me` ile doğrular. */
    suspend fun restore() {
        val tokens = tokenStore.tokens()
        if (tokens == null) {
            _state.value = SessionState.SignedOut
            return
        }
        cachedAccessToken = tokens.accessToken
        runCatching { authRepository.currentUser() }
            .onSuccess { _state.value = SessionState.SignedIn(it) }
            .onFailure { clearSession() }
    }

    suspend fun login(identifier: String, password: String) {
        val session = authRepository.login(identifier, password)
        persist(session.tokens)
        _state.value = SessionState.SignedIn(session.user)
    }

    suspend fun register(input: RegisterInput) {
        val session = authRepository.register(input)
        persist(session.tokens)
        _state.value = SessionState.SignedIn(session.user)
    }

    suspend fun signOut() {
        tokenStore.tokens()?.refreshToken?.let { authRepository.logout(it) }
        clearSession()
    }

    /** Profil güncellendiğinde oturumdaki kullanıcıyı tazeler (A5). */
    fun updateUser(user: User) {
        if (_state.value is SessionState.SignedIn) {
            _state.value = SessionState.SignedIn(user)
        }
    }

    // TokenAuthenticator geri bildirimleri (OkHttp thread'inden, bloklayan bağlam) ---

    fun onTokensRefreshed(accessToken: String) {
        cachedAccessToken = accessToken
    }

    fun onRefreshFailed() {
        runBlocking { clearSession() }
    }

    private suspend fun persist(tokens: AuthTokens) {
        tokenStore.save(tokens)
        cachedAccessToken = tokens.accessToken
    }

    private suspend fun clearSession() {
        cachedAccessToken = null
        tokenStore.clear()
        _state.value = SessionState.SignedOut
    }
}
