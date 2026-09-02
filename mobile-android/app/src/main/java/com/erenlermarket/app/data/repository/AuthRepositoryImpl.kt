package com.erenlermarket.app.data.repository

import com.erenlermarket.app.data.remote.AuthApi
import com.erenlermarket.app.data.remote.apiCall
import com.erenlermarket.app.data.remote.dto.LoginRequest
import com.erenlermarket.app.data.remote.dto.RefreshRequest
import com.erenlermarket.app.data.remote.dto.UpdateProfileRequest
import com.erenlermarket.app.data.remote.toDomain
import com.erenlermarket.app.data.remote.toRequest
import com.erenlermarket.app.domain.model.AuthSession
import com.erenlermarket.app.domain.model.ProfileUpdate
import com.erenlermarket.app.domain.model.RegisterInput
import com.erenlermarket.app.domain.model.User
import com.erenlermarket.app.domain.repository.AuthRepository
import javax.inject.Inject

class AuthRepositoryImpl @Inject constructor(
    private val api: AuthApi,
) : AuthRepository {

    override suspend fun login(identifier: String, password: String): AuthSession = apiCall {
        val trimmed = identifier.trim()
        val body = if (trimmed.contains('@')) {
            LoginRequest(email = trimmed, password = password)
        } else {
            LoginRequest(phone = trimmed, password = password)
        }
        api.login(body).toDomain()
    }

    override suspend fun register(input: RegisterInput): AuthSession = apiCall {
        api.register(input.toRequest()).toDomain()
    }

    override suspend fun currentUser(): User = apiCall { api.me().toDomain() }

    override suspend fun logout(refreshToken: String) {
        runCatching { api.logout(RefreshRequest(refreshToken)) }
    }

    override suspend fun updateProfile(update: ProfileUpdate) = apiCall {
        api.updateProfile(
            UpdateProfileRequest(
                profileName = update.profileName?.trim()?.ifBlank { null },
                bio = update.bio?.trim(),
            ),
        )
    }

    override suspend fun deleteAccount() = apiCall { api.deleteAccount() }
}
