package com.erenlermarket.app.data.local.cache

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Dao
interface CatalogCacheDao {

    @Query("SELECT * FROM cached_products WHERE bucket = :bucket ORDER BY position ASC")
    suspend fun productsInBucket(bucket: String): List<CachedProductEntity>

    @Query("SELECT * FROM cached_products WHERE bucket = 'recent' ORDER BY position ASC LIMIT :limit")
    fun recentProducts(limit: Int): Flow<List<CachedProductEntity>>

    @Query("DELETE FROM cached_products WHERE bucket = :bucket")
    suspend fun clearBucket(bucket: String)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertProducts(items: List<CachedProductEntity>)

    @Transaction
    suspend fun replaceBucket(bucket: String, items: List<CachedProductEntity>) {
        clearBucket(bucket)
        upsertProducts(items)
    }

    @Query("SELECT * FROM cached_categories ORDER BY displayOrder ASC")
    suspend fun categories(): List<CachedCategoryEntity>

    @Query("DELETE FROM cached_categories")
    suspend fun clearCategories()

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertCategories(items: List<CachedCategoryEntity>)

    @Transaction
    suspend fun replaceCategories(items: List<CachedCategoryEntity>) {
        clearCategories()
        upsertCategories(items)
    }
}
