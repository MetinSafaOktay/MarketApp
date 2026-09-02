package com.erenlermarket.app.di

import com.erenlermarket.app.data.repository.CatalogRepositoryImpl
import com.erenlermarket.app.data.repository.StorefrontRepositoryImpl
import com.erenlermarket.app.domain.repository.CatalogRepository
import com.erenlermarket.app.domain.repository.StorefrontRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
interface RepositoryModule {

    @Binds
    @Singleton
    fun catalogRepository(impl: CatalogRepositoryImpl): CatalogRepository

    @Binds
    @Singleton
    fun storefrontRepository(impl: StorefrontRepositoryImpl): StorefrontRepository
}
