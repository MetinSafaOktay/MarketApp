package com.erenlermarket.app.domain.repository

import com.erenlermarket.app.domain.model.AuthSession
import com.erenlermarket.app.domain.model.RegisterInput
import com.erenlermarket.app.domain.model.User

interface AuthRepository {
    /** identifier `@` içeriyorsa e-posta, aksi halde telefon olarak gönderilir. */
    suspend fun login(identifier: String, password: String): AuthSession
    suspend fun register(input: RegisterInput): AuthSession
    suspend fun currentUser(): User
    suspend fun logout(refreshToken: String)
}
