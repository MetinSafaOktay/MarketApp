package com.erenlermarket.app.di

import com.erenlermarket.app.BuildConfig
import com.erenlermarket.app.data.remote.AuthApi
import com.erenlermarket.app.data.remote.AuthInterceptor
import com.erenlermarket.app.data.remote.CommerceApi
import com.erenlermarket.app.data.remote.ErenlerApi
import com.erenlermarket.app.data.remote.LanguageInterceptor
import com.erenlermarket.app.data.remote.TokenProvider
import com.erenlermarket.app.data.remote.TokenRefreshApi
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import okhttp3.Authenticator
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit
import javax.inject.Provider
import javax.inject.Qualifier
import javax.inject.Singleton

/** Authenticator/Authorization taşımayan istemci — yalnızca token yenileme için. */
@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class PlainClient

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun json(): Json = Json {
        ignoreUnknownKeys = true
        explicitNulls = false
        coerceInputValues = true
    }

    private fun loggingInterceptor(): HttpLoggingInterceptor =
        HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BASIC
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }

    // --- Token yenileme istemcisi (döngüsüz) ---

    @Provides
    @Singleton
    @PlainClient
    fun plainOkHttpClient(): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(LanguageInterceptor())
        .addInterceptor(loggingInterceptor())
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    @Provides
    @Singleton
    @PlainClient
    fun plainRetrofit(@PlainClient client: OkHttpClient, json: Json): Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    @Provides
    @Singleton
    fun tokenRefreshApi(@PlainClient retrofit: Retrofit): TokenRefreshApi =
        retrofit.create(TokenRefreshApi::class.java)

    // --- Ana istemci ---

    @Provides
    @Singleton
    fun okHttpClient(
        tokenProvider: Provider<TokenProvider>,
        authenticator: Authenticator,
    ): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(LanguageInterceptor())
        .addInterceptor(AuthInterceptor(tokenProvider))
        .addInterceptor(loggingInterceptor())
        .authenticator(authenticator)
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    @Provides
    @Singleton
    fun retrofit(client: OkHttpClient, json: Json): Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    @Provides
    @Singleton
    fun erenlerApi(retrofit: Retrofit): ErenlerApi = retrofit.create(ErenlerApi::class.java)

    @Provides
    @Singleton
    fun authApi(retrofit: Retrofit): AuthApi = retrofit.create(AuthApi::class.java)

    @Provides
    @Singleton
    fun commerceApi(retrofit: Retrofit): CommerceApi = retrofit.create(CommerceApi::class.java)
}
