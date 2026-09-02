package com.erenlermarket.app.data.remote.dto

import kotlinx.serialization.Serializable

// Anahtarlar JsonNamingStrategy.SnakeCase ile eşlenir (camelCase property -> snake_case JSON).

@Serializable
data class ProductImageDto(val imageUrl: String)

@Serializable
data class ProductDto(
    val id: String,
    val categoryId: String,
    val name: String,
    val sku: String,
    val description: String? = null,
    val price: String,
    val originalPrice: String? = null,
    val isNewArrival: Boolean = false,
    val stockQuantity: Int = 0,
    val productImages: List<ProductImageDto>? = null,
)

@Serializable
data class MetaDto(
    val total: Int,
    val page: Int,
    val pageSize: Int,
    val totalPages: Int,
)

@Serializable
data class PaginatedDto<T>(
    val data: List<T>,
    val meta: MetaDto,
)

@Serializable
data class CategoryDto(
    val id: String,
    val name: String,
    val imageUrl: String? = null,
    val displayOrder: Int = 0,
)

@Serializable
data class StoreProfileDto(
    val name: String,
    val city: String? = null,
    val tagline: String? = null,
    val description: String? = null,
    val phone: String? = null,
    val address: String? = null,
    val logoUrl: String? = null,
    val coverImageUrl: String? = null,
)

@Serializable
data class AnnouncementDto(
    val id: String,
    val title: String,
    val content: String,
    val imageUrl: String? = null,
)
