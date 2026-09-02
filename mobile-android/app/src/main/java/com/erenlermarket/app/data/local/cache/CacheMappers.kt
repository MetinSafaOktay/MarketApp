package com.erenlermarket.app.data.local.cache

import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.model.ProductCategory
import java.math.BigDecimal

fun CachedProductEntity.toDomain(): Product = Product(
    id = id,
    categoryId = categoryId,
    name = name,
    sku = sku,
    description = description,
    price = price.toBigDecimalOrNull() ?: BigDecimal.ZERO,
    originalPrice = originalPrice?.toBigDecimalOrNull(),
    isNewArrival = isNewArrival,
    stockQuantity = stockQuantity,
    imageUrls = listOfNotNull(imageUrl),
)

fun Product.toCacheEntity(bucket: String, position: Int): CachedProductEntity = CachedProductEntity(
    bucket = bucket,
    id = id,
    categoryId = categoryId,
    name = name,
    sku = sku,
    description = description,
    price = price.toPlainString(),
    originalPrice = originalPrice?.toPlainString(),
    isNewArrival = isNewArrival,
    stockQuantity = stockQuantity,
    imageUrl = imageUrls.firstOrNull(),
    position = position,
    cachedAt = System.currentTimeMillis(),
)

fun CachedCategoryEntity.toDomain(): ProductCategory = ProductCategory(
    id = id,
    name = name,
    imageUrl = imageUrl,
    displayOrder = displayOrder,
)

fun ProductCategory.toCacheEntity(): CachedCategoryEntity = CachedCategoryEntity(
    id = id,
    name = name,
    imageUrl = imageUrl,
    displayOrder = displayOrder,
)
