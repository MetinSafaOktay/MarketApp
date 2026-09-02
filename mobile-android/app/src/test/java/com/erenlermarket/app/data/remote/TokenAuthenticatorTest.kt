package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.remote.dto.RefreshRequest
import com.erenlermarket.app.data.remote.dto.TokensDto
import com.erenlermarket.app.data.session.SessionManager
import com.erenlermarket.app.domain.model.AuthTokens
import com.erenlermarket.app.util.FakeTokenStore
import io.mockk.coEvery
import io.mockk.mockk
import io.mockk.verify
import okhttp3.Protocol
import okhttp3.Request
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class TokenAuthenticatorTest {

    private val refreshApi = mockk<TokenRefreshApi>()
    private val session = mockk<SessionManager>(relaxed = true)
    private val lazySession = dagger.Lazy { session }

    private fun authenticator(store: FakeTokenStore) =
        TokenAuthenticator(store, refreshApi, lazySession)

    private fun response401(bearer: String? = "old", priorCount: Int = 0): Response {
        val request = Request.Builder()
            .url("http://localhost:3000/products")
            .apply { if (bearer != null) header("Authorization", "Bearer $bearer") }
            .build()
        var builder = Response.Builder()
            .request(request)
            .protocol(Protocol.HTTP_1_1)
            .code(401)
            .message("Unauthorized")
            .body("".toResponseBody(null))
        repeat(priorCount) {
            builder = builder.priorResponse(
                Response.Builder()
                    .request(request)
                    .protocol(Protocol.HTTP_1_1)
                    .code(401)
                    .message("Unauthorized")
                    .build(),
            )
        }
        return builder.build()
    }

    @Test
    fun `refreshes and retries with the new access token`() {
        coEvery { refreshApi.refresh(RefreshRequest("ref")) } returns TokensDto("newAcc", "newRef")
        val store = FakeTokenStore(AuthTokens("old", "ref"))

        val retried = authenticator(store).authenticate(null, response401())

        assertEquals("Bearer newAcc", retried?.header("Authorization"))
        assertEquals(AuthTokens("newAcc", "newRef"), store.stored)
        verify { session.onTokensRefreshed("newAcc") }
    }

    @Test
    fun `clears the session when refresh fails`() {
        coEvery { refreshApi.refresh(any()) } throws RuntimeException("401")
        val store = FakeTokenStore(AuthTokens("old", "ref"))

        val retried = authenticator(store).authenticate(null, response401())

        assertNull(retried)
        verify { session.onRefreshFailed() }
    }

    @Test
    fun `gives up when there are no stored tokens`() {
        val retried = authenticator(FakeTokenStore()).authenticate(null, response401())

        assertNull(retried)
    }

    @Test
    fun `reuses a token another request already refreshed`() {
        val store = FakeTokenStore(AuthTokens("fresh", "ref"))

        val retried = authenticator(store).authenticate(null, response401(bearer = "stale"))

        assertEquals("Bearer fresh", retried?.header("Authorization"))
        verify(exactly = 0) { session.onTokensRefreshed(any()) }
    }

    @Test
    fun `stops after too many attempts`() {
        val store = FakeTokenStore(AuthTokens("old", "ref"))

        val retried = authenticator(store).authenticate(null, response401(priorCount = 2))

        assertNull(retried)
    }
}
