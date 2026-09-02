package com.erenlermarket.app.data

import com.erenlermarket.app.data.remote.dto.AuthResponseDto
import com.erenlermarket.app.data.remote.dto.UserDto
import com.erenlermarket.app.data.remote.toDomain
import com.erenlermarket.app.data.remote.toRequest
import com.erenlermarket.app.domain.model.RegisterInput
import com.erenlermarket.app.domain.model.UserRole
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class AuthMappersTest {

    private fun userDto(role: String = "customer") = UserDto(
        id = "u1",
        email = "ali@example.com",
        phone = "  ",
        profileName = "ali",
        firstName = "Ali",
        lastName = "Veli",
        role = role,
    )

    @Test
    fun `user dto maps and blanks become null`() {
        val user = userDto().toDomain()

        assertEquals("u1", user.id)
        assertEquals("ali@example.com", user.email)
        assertNull(user.phone)
        assertEquals("Ali Veli", user.fullName)
        assertEquals(UserRole.CUSTOMER, user.role)
    }

    @Test
    fun `admin role maps case-insensitively`() {
        assertEquals(UserRole.ADMIN, userDto(role = "ADMIN").toDomain().role)
    }

    @Test
    fun `contact label falls back to phone then profile name`() {
        val phoneOnly = userDto().copy(email = null, phone = "0555").toDomain()
        assertEquals("0555", phoneOnly.contactLabel)

        val neither = userDto().copy(email = null, phone = null).toDomain()
        assertEquals("ali", neither.contactLabel)
    }

    @Test
    fun `auth response maps user and tokens`() {
        val session = AuthResponseDto(
            user = userDto(),
            accessToken = "acc",
            refreshToken = "ref",
        ).toDomain()

        assertEquals("u1", session.user.id)
        assertEquals("acc", session.tokens.accessToken)
        assertEquals("ref", session.tokens.refreshToken)
    }

    @Test
    fun `register input trims into a snake_case request`() {
        val request = RegisterInput(
            email = " ayse@example.com ",
            password = "secret12",
            profileName = " ayse ",
            firstName = " Ayşe ",
            lastName = " Yıldız ",
        ).toRequest()

        assertEquals("ayse@example.com", request.email)
        assertEquals("ayse", request.profileName)
        assertEquals("Ayşe", request.firstName)
        assertEquals("Yıldız", request.lastName)
    }
}
