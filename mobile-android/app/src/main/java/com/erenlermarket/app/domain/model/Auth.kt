package com.erenlermarket.app.domain.model

/** Kayıt formu girdisi. */
data class RegisterInput(
    val email: String,
    val password: String,
    val profileName: String,
    val firstName: String,
    val lastName: String,
)

/** Erişim + (dönen) yenileme token çifti. */
data class AuthTokens(
    val accessToken: String,
    val refreshToken: String,
)

/** Giriş/kayıt sonucu: kullanıcı + token'lar. */
data class AuthSession(
    val user: User,
    val tokens: AuthTokens,
)
