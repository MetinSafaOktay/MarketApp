package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.remote.dto.AuthResponseDto
import com.erenlermarket.app.data.remote.dto.LoginRequest
import com.erenlermarket.app.data.remote.dto.RefreshRequest
import com.erenlermarket.app.data.remote.dto.RegisterRequest
import com.erenlermarket.app.data.remote.dto.TokensDto
import com.erenlermarket.app.data.remote.dto.UserDto
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApi {

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponseDto

    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): AuthResponseDto

    @POST("auth/logout")
    suspend fun logout(@Body body: RefreshRequest)

    @GET("auth/me")
    suspend fun me(): UserDto
}

/**
 * Yalnızca token yenileme. Authenticator'ın döngüye girmemesi için
 * authenticator'ı olmayan ayrı bir OkHttp istemcisi üzerinden çalışır.
 */
interface TokenRefreshApi {

    @POST("auth/refresh")
    suspend fun refresh(@Body body: RefreshRequest): TokensDto
}
