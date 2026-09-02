package com.erenlermarket.app.di

import com.erenlermarket.app.data.local.DataStoreTokenStore
import com.erenlermarket.app.data.local.TokenStore
import com.erenlermarket.app.data.remote.TokenAuthenticator
import com.erenlermarket.app.data.remote.TokenProvider
import com.erenlermarket.app.data.repository.AuthRepositoryImpl
import com.erenlermarket.app.data.session.SessionManager
import com.erenlermarket.app.domain.repository.AuthRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.Authenticator
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
interface AuthModule {

    @Binds
    @Singleton
    fun authRepository(impl: AuthRepositoryImpl): AuthRepository

    @Binds
    @Singleton
    fun tokenStore(impl: DataStoreTokenStore): TokenStore

    @Binds
    @Singleton
    fun tokenProvider(impl: SessionManager): TokenProvider

    @Binds
    @Singleton
    fun authenticator(impl: TokenAuthenticator): Authenticator
}
