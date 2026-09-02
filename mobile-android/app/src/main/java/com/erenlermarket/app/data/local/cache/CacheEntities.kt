package com.erenlermarket.app.data.local.cache

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Önbelleğe alınmış ürün. `bucket` ayraç: "recent", "rail:discounted",
 * "rail:new", "rail:latest", "category:<id>".
 */
@Entity(tableName = "cached_products", primaryKeys = ["bucket", "id"])
data class CachedProductEntity(
    val bucket: String,
    val id: String,
    val categoryId: String,
    val name: String,
    val sku: String,
    val description: String?,
    val price: String,
    val originalPrice: String?,
    val isNewArrival: Boolean,
    val stockQuantity: Int,
    val imageUrl: String?,
    val position: Int,
    val cachedAt: Long,
)

@Entity(tableName = "cached_categories")
data class CachedCategoryEntity(
    @PrimaryKey val id: String,
    val name: String,
    val imageUrl: String?,
    val displayOrder: Int,
)
