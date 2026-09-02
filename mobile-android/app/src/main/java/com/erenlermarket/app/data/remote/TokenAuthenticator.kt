package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.local.TokenStore
import com.erenlermarket.app.data.remote.dto.RefreshRequest
import com.erenlermarket.app.data.session.SessionManager
import dagger.Lazy
import kotlinx.coroutines.runBlocking
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import javax.inject.Inject
import javax.inject.Singleton

private const val HEADER = "Authorization"
private const val PREFIX = "Bearer "
private const val MAX_ATTEMPTS = 2

/**
 * 401'de yenileme token'ıyla yeni erişim token'ı alıp isteği tekrarlar.
 * `SessionManager` bağımlılığı Dagger döngüsünü kırmak için `Lazy`.
 */
@Singleton
class TokenAuthenticator @Inject constructor(
    private val tokenStore: TokenStore,
    private val refreshApi: TokenRefreshApi,
    private val session: Lazy<SessionManager>,
) : Authenticator {

    override fun authenticate(route: Route?, response: Response): Request? {
        if (response.attemptCount() >= MAX_ATTEMPTS) return null

        val failedToken = response.request.header(HEADER)?.removePrefix(PREFIX)

        synchronized(this) {
            val current = runBlocking { tokenStore.tokens() } ?: return null

            // Başka bir istek zaten yenilemiş: yeni token'la tekrar dene.
            if (failedToken != null && current.accessToken != failedToken) {
                return response.request.withToken(current.accessToken)
            }

            val refreshed = runBlocking {
                runCatching { refreshApi.refresh(RefreshRequest(current.refreshToken)) }.getOrNull()
            }
            if (refreshed == null) {
                session.get().onRefreshFailed()
                return null
            }

            runBlocking { tokenStore.save(refreshed.toAuthTokens()) }
            session.get().onTokensRefreshed(refreshed.accessToken)
            return response.request.withToken(refreshed.accessToken)
        }
    }

    private fun Request.withToken(token: String): Request =
        newBuilder().header(HEADER, PREFIX + token).build()

    private fun Response.attemptCount(): Int {
        var count = 1
        var prior = priorResponse
        while (prior != null) {
            count++
            prior = prior.priorResponse
        }
        return count
    }
}
