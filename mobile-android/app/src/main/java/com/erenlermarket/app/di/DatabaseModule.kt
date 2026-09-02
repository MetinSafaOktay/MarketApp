package com.erenlermarket.app.di

import android.content.Context
import androidx.room.Room
import com.erenlermarket.app.data.local.cache.AppDatabase
import com.erenlermarket.app.data.local.cache.CatalogCacheDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun appDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "erenler-cache.db")
            .fallbackToDestructiveMigration()
            .build()

    @Provides
    fun catalogCacheDao(database: AppDatabase): CatalogCacheDao = database.catalogCacheDao()
}
