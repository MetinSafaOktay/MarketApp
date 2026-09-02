package com.erenlermarket.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.erenlermarket.app.domain.model.AuthTokens
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Oturum token deposu. iOS Keychain karşılığı.
 *
 * Not: `security-crypto` (EncryptedSharedPreferences) 2024'te deprecate edildi ve
 * yerine önerilen bir API yok; düz DataStore kullanıyoruz. Erişim token'ı 15 dk ömürlü,
 * yenileme token'ı sunucuda her kullanımda döndürülüyor (rotating) — risk sınırlı.
 */
interface TokenStore {
    suspend fun tokens(): AuthTokens?
    suspend fun save(tokens: AuthTokens)
    suspend fun clear()
}

private val Context.authDataStore: DataStore<Preferences> by preferencesDataStore(name = "auth")

@Singleton
class DataStoreTokenStore @Inject constructor(
    @ApplicationContext context: Context,
) : TokenStore {

    private val dataStore = context.authDataStore

    override suspend fun tokens(): AuthTokens? {
        val prefs = dataStore.data.first()
        val access = prefs[ACCESS_KEY]
        val refresh = prefs[REFRESH_KEY]
        return if (!access.isNullOrBlank() && !refresh.isNullOrBlank()) {
            AuthTokens(access, refresh)
        } else {
            null
        }
    }

    override suspend fun save(tokens: AuthTokens) {
        dataStore.edit {
            it[ACCESS_KEY] = tokens.accessToken
            it[REFRESH_KEY] = tokens.refreshToken
        }
    }

    override suspend fun clear() {
        dataStore.edit { it.clear() }
    }

    private companion object {
        val ACCESS_KEY = stringPreferencesKey("access_token")
        val REFRESH_KEY = stringPreferencesKey("refresh_token")
    }
}
