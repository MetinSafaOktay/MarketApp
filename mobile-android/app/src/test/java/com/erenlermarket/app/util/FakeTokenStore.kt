package com.erenlermarket.app.util

import com.erenlermarket.app.data.local.TokenStore
import com.erenlermarket.app.domain.model.AuthTokens

/** Bellek içi TokenStore (DataStore yerine testler için). */
class FakeTokenStore(initial: AuthTokens? = null) : TokenStore {
    var stored: AuthTokens? = initial
        private set

    var clearCount: Int = 0
        private set

    override suspend fun tokens(): AuthTokens? = stored

    override suspend fun save(tokens: AuthTokens) {
        stored = tokens
    }

    override suspend fun clear() {
        stored = null
        clearCount++
    }
}
