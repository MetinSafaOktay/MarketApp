package com.erenlermarket.app.data.repository

import com.erenlermarket.app.data.remote.AuthApi
import com.erenlermarket.app.data.remote.dto.AuthResponseDto
import com.erenlermarket.app.data.remote.dto.LoginRequest
import com.erenlermarket.app.data.remote.dto.RegisterRequest
import com.erenlermarket.app.data.remote.dto.UserDto
import com.erenlermarket.app.domain.model.RegisterInput
import io.mockk.coEvery
import io.mockk.mockk
import io.mockk.slot
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class AuthRepositoryImplTest {

    private val api = mockk<AuthApi>()
    private val repository = AuthRepositoryImpl(api)

    private val response = AuthResponseDto(
        user = UserDto(
            id = "u1",
            email = "a@b.com",
            profileName = "a",
            firstName = "A",
            lastName = "B",
        ),
        accessToken = "acc",
        refreshToken = "ref",
    )

    @Test
    fun `login with an email sends the email field`() = runTest {
        val body = slot<LoginRequest>()
        coEvery { api.login(capture(body)) } returns response

        repository.login("  a@b.com ", "secret")

        assertEquals("a@b.com", body.captured.email)
        assertNull(body.captured.phone)
    }

    @Test
    fun `login without an at-sign sends the phone field`() = runTest {
        val body = slot<LoginRequest>()
        coEvery { api.login(capture(body)) } returns response

        repository.login("05551112233", "secret")

        assertEquals("05551112233", body.captured.phone)
        assertNull(body.captured.email)
    }

    @Test
    fun `register maps the domain input to the request`() = runTest {
        val body = slot<RegisterRequest>()
        coEvery { api.register(capture(body)) } returns response

        repository.register(
            RegisterInput(
                email = "a@b.com",
                password = "secret12",
                profileName = "a",
                firstName = "A",
                lastName = "B",
            ),
        )

        assertEquals("a@b.com", body.captured.email)
        assertEquals("a", body.captured.profileName)
    }

    @Test
    fun `currentUser maps the me response`() = runTest {
        coEvery { api.me() } returns response.user

        assertEquals("u1", repository.currentUser().id)
    }
}
