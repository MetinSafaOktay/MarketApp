package com.erenlermarket.app.di

import com.erenlermarket.app.data.repository.AddressRepositoryImpl
import com.erenlermarket.app.data.repository.CartRepositoryImpl
import com.erenlermarket.app.data.repository.CatalogRepositoryImpl
import com.erenlermarket.app.data.repository.MessagingRepositoryImpl
import com.erenlermarket.app.data.repository.NotificationsRepositoryImpl
import com.erenlermarket.app.data.repository.OrderRepositoryImpl
import com.erenlermarket.app.data.repository.SettingsRepositoryImpl
import com.erenlermarket.app.data.repository.StorefrontRepositoryImpl
import com.erenlermarket.app.data.repository.WishlistRepositoryImpl
import com.erenlermarket.app.domain.repository.AddressRepository
import com.erenlermarket.app.domain.repository.CartRepository
import com.erenlermarket.app.domain.repository.CatalogRepository
import com.erenlermarket.app.domain.repository.MessagingRepository
import com.erenlermarket.app.domain.repository.NotificationsRepository
import com.erenlermarket.app.domain.repository.OrderRepository
import com.erenlermarket.app.domain.repository.SettingsRepository
import com.erenlermarket.app.domain.repository.StorefrontRepository
import com.erenlermarket.app.domain.repository.WishlistRepository
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

    @Binds
    @Singleton
    fun cartRepository(impl: CartRepositoryImpl): CartRepository

    @Binds
    @Singleton
    fun wishlistRepository(impl: WishlistRepositoryImpl): WishlistRepository

    @Binds
    @Singleton
    fun addressRepository(impl: AddressRepositoryImpl): AddressRepository

    @Binds
    @Singleton
    fun orderRepository(impl: OrderRepositoryImpl): OrderRepository

    @Binds
    @Singleton
    fun messagingRepository(impl: MessagingRepositoryImpl): MessagingRepository

    @Binds
    @Singleton
    fun notificationsRepository(impl: NotificationsRepositoryImpl): NotificationsRepository

    @Binds
    @Singleton
    fun settingsRepository(impl: SettingsRepositoryImpl): SettingsRepository
}
