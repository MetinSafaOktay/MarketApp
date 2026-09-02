package com.erenlermarket.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// Backend kullanıcı alanlarını snake_case, token'ları camelCase döndürür.

@Serializable
data class UserDto(
    val id: String,
    val email: String? = null,
    val phone: String? = null,
    @SerialName("profile_name") val profileName: String,
    @SerialName("first_name") val firstName: String,
    @SerialName("last_name") val lastName: String,
    @SerialName("profile_photo_url") val profilePhotoUrl: String? = null,
    val bio: String? = null,
    @SerialName("is_private") val isPrivate: Boolean = false,
    val role: String = "customer",
)

@Serializable
data class AuthResponseDto(
    val user: UserDto,
    val accessToken: String,
    val refreshToken: String,
)

@Serializable
data class TokensDto(
    val accessToken: String,
    val refreshToken: String,
)

@Serializable
data class LoginRequest(
    val email: String? = null,
    val phone: String? = null,
    val password: String,
)

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String,
    @SerialName("profile_name") val profileName: String,
    @SerialName("first_name") val firstName: String,
    @SerialName("last_name") val lastName: String,
)

@Serializable
data class RefreshRequest(
    val refreshToken: String,
)
