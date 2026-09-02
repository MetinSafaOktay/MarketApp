package com.erenlermarket.app.data.session

import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.AuthSession
import com.erenlermarket.app.domain.model.AuthTokens
import com.erenlermarket.app.domain.model.User
import com.erenlermarket.app.domain.model.UserRole
import com.erenlermarket.app.domain.repository.AuthRepository
import com.erenlermarket.app.util.FakeTokenStore
import io.mockk.Runs
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.just
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SessionManagerTest {

    private val authRepository = mockk<AuthRepository>()

    private val user = User(
        id = "u1",
        email = "a@b.com",
        phone = null,
        profileName = "a",
        firstName = "A",
        lastName = "B",
        photoUrl = null,
        bio = null,
        isPrivate = false,
        role = UserRole.CUSTOMER,
    )
    private val tokens = AuthTokens("acc", "ref")

    private fun manager(store: FakeTokenStore) = SessionManager(store, authRepository)

    @Test
    fun `restore without stored tokens is signed out`() = runTest {
        val manager = manager(FakeTokenStore())

        manager.restore()

        assertEquals(SessionState.SignedOut, manager.state.value)
        assertNull(manager.accessToken())
    }

    @Test
    fun `restore with valid tokens loads the user`() = runTest {
        coEvery { authRepository.currentUser() } returns user
        val manager = manager(FakeTokenStore(tokens))

        manager.restore()

        assertEquals(SessionState.SignedIn(user), manager.state.value)
        assertEquals("acc", manager.accessToken())
    }

    @Test
    fun `restore clears the session when the user fetch fails`() = runTest {
        coEvery { authRepository.currentUser() } throws ApiException(ApiException.Kind.UNAUTHORIZED, "x")
        val store = FakeTokenStore(tokens)
        val manager = manager(store)

        manager.restore()

        assertEquals(SessionState.SignedOut, manager.state.value)
        assertNull(store.stored)
        assertNull(manager.accessToken())
    }

    @Test
    fun `login persists tokens and signs in`() = runTest {
        coEvery { authRepository.login("a@b.com", "pw") } returns AuthSession(user, tokens)
        val store = FakeTokenStore()
        val manager = manager(store)

        manager.login("a@b.com", "pw")

        assertEquals(SessionState.SignedIn(user), manager.state.value)
        assertEquals(tokens, store.stored)
        assertEquals("acc", manager.accessToken())
    }

    @Test
    fun `signOut revokes the refresh token and clears state`() = runTest {
        coEvery { authRepository.currentUser() } returns user
        coEvery { authRepository.logout("ref") } just Runs
        val store = FakeTokenStore(tokens)
        val manager = manager(store)
        manager.restore()

        manager.signOut()

        coVerify { authRepository.logout("ref") }
        assertEquals(SessionState.SignedOut, manager.state.value)
        assertNull(store.stored)
    }

    @Test
    fun `onRefreshFailed clears the session`() = runTest {
        coEvery { authRepository.currentUser() } returns user
        val store = FakeTokenStore(tokens)
        val manager = manager(store)
        manager.restore()

        manager.onRefreshFailed()

        assertEquals(SessionState.SignedOut, manager.state.value)
        assertTrue(store.clearCount >= 1)
    }
}
