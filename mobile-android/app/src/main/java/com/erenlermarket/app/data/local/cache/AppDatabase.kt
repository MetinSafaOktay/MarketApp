package com.erenlermarket.app.data.local.cache

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(
    entities = [CachedProductEntity::class, CachedCategoryEntity::class],
    version = 1,
    exportSchema = false,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun catalogCacheDao(): CatalogCacheDao
}
