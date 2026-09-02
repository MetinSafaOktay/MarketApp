package com.erenlermarket.app.di

import com.erenlermarket.app.BuildConfig
import com.erenlermarket.app.data.remote.AuthInterceptor
import com.erenlermarket.app.data.remote.ErenlerApi
import com.erenlermarket.app.data.remote.LanguageInterceptor
import com.erenlermarket.app.data.remote.TokenProvider
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

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

    /** A1: oturum yok. A3'te gerçek oturum deposuyla değiştirilecek. */
    @Provides
    @Singleton
    fun tokenProvider(): TokenProvider = object : TokenProvider {
        override fun accessToken(): String? = null
    }

    @Provides
    @Singleton
    fun okHttpClient(tokenProvider: TokenProvider): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(LanguageInterceptor())
        .addInterceptor(AuthInterceptor(tokenProvider))
        .apply {
            if (BuildConfig.DEBUG) {
                addInterceptor(
                    HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC },
                )
            }
        }
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
}
