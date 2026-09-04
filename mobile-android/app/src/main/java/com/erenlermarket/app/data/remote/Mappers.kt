package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.remote.dto.AnnouncementDto
import com.erenlermarket.app.data.remote.dto.CategoryDto
import com.erenlermarket.app.data.remote.dto.ProductPageDto
import com.erenlermarket.app.data.remote.dto.ProductDto
import com.erenlermarket.app.data.remote.dto.StoreProfileDto
import com.erenlermarket.app.domain.model.Announcement
import com.erenlermarket.app.domain.model.Page
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.model.ProductCategory
import com.erenlermarket.app.domain.model.StoreProfile
import java.math.BigDecimal

private fun String?.toDecimalOrNull(): BigDecimal? =
    this?.let { runCatching { BigDecimal(it) }.getOrNull() }

fun ProductDto.toDomain(): Product = Product(
    id = id,
    categoryId = categoryId,
    name = name,
    sku = sku,
    description = description?.takeIf { it.isNotBlank() },
    price = price.toDecimalOrNull() ?: BigDecimal.ZERO,
    originalPrice = originalPrice.toDecimalOrNull(),
    isNewArrival = isNewArrival,
    stockQuantity = stockQuantity,
    imageUrls = productImages.orEmpty().map { it.imageUrl },
)

fun ProductPageDto.toDomain(): Page<Product> = Page(
    items = data.map { it.toDomain() },
    page = meta.page,
    pageSize = meta.pageSize,
    total = meta.total,
    totalPages = meta.totalPages,
)

fun CategoryDto.toDomain(): ProductCategory = ProductCategory(
    id = id,
    name = name,
    imageUrl = imageUrl,
    displayOrder = displayOrder,
)

fun StoreProfileDto.toDomain(): StoreProfile = StoreProfile(
    name = name,
    city = city?.takeIf { it.isNotBlank() },
    tagline = tagline?.takeIf { it.isNotBlank() },
    description = description?.takeIf { it.isNotBlank() },
    phone = phone?.takeIf { it.isNotBlank() },
    address = address?.takeIf { it.isNotBlank() },
    logoUrl = logoUrl,
    coverImageUrl = coverImageUrl,
    latitude = latitude,
    longitude = longitude,
    deliveryRadiusKm = deliveryRadiusKm,
)

fun AnnouncementDto.toDomain(): Announcement = Announcement(
    id = id,
    title = title,
    content = content,
    imageUrl = imageUrl,
)
