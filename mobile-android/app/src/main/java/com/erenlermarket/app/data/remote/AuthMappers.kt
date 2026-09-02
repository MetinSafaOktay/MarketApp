package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.remote.dto.AuthResponseDto
import com.erenlermarket.app.data.remote.dto.RegisterRequest
import com.erenlermarket.app.data.remote.dto.TokensDto
import com.erenlermarket.app.data.remote.dto.UserDto
import com.erenlermarket.app.domain.model.AuthSession
import com.erenlermarket.app.domain.model.AuthTokens
import com.erenlermarket.app.domain.model.RegisterInput
import com.erenlermarket.app.domain.model.User
import com.erenlermarket.app.domain.model.UserRole

fun UserDto.toDomain(): User = User(
    id = id,
    email = email?.takeIf { it.isNotBlank() },
    phone = phone?.takeIf { it.isNotBlank() },
    profileName = profileName,
    firstName = firstName,
    lastName = lastName,
    photoUrl = profilePhotoUrl?.takeIf { it.isNotBlank() },
    bio = bio?.takeIf { it.isNotBlank() },
    isPrivate = isPrivate,
    role = if (role.equals("admin", ignoreCase = true)) UserRole.ADMIN else UserRole.CUSTOMER,
)

fun AuthResponseDto.toDomain(): AuthSession = AuthSession(
    user = user.toDomain(),
    tokens = AuthTokens(accessToken = accessToken, refreshToken = refreshToken),
)

fun TokensDto.toAuthTokens(): AuthTokens =
    AuthTokens(accessToken = accessToken, refreshToken = refreshToken)

fun RegisterInput.toRequest(): RegisterRequest = RegisterRequest(
    email = email.trim(),
    password = password,
    profileName = profileName.trim(),
    firstName = firstName.trim(),
    lastName = lastName.trim(),
)
