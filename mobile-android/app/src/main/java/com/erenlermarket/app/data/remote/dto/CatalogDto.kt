package com.erenlermarket.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// Backend ürün alanlarını snake_case, `meta` alanını camelCase döndürüyor.
// Global naming strategy tutarsız kaldığı için anahtarlar tek tek @SerialName ile verilir.

@Serializable
data class ProductImageDto(
    @SerialName("image_url") val imageUrl: String,
)

@Serializable
data class ProductDto(
    val id: String,
    @SerialName("category_id") val categoryId: String,
    val name: String,
    val sku: String,
    val description: String? = null,
    val price: String,
    @SerialName("original_price") val originalPrice: String? = null,
    @SerialName("is_new_arrival") val isNewArrival: Boolean = false,
    @SerialName("stock_quantity") val stockQuantity: Int = 0,
    @SerialName("product_images") val productImages: List<ProductImageDto>? = null,
)

@Serializable
data class MetaDto(
    val total: Int,
    val page: Int,
    val pageSize: Int,
    val totalPages: Int,
)

@Serializable
data class ProductPageDto(
    val data: List<ProductDto>,
    val meta: MetaDto,
)

@Serializable
data class CategoryDto(
    val id: String,
    val name: String,
    @SerialName("image_url") val imageUrl: String? = null,
    @SerialName("display_order") val displayOrder: Int = 0,
)

@Serializable
data class StoreProfileDto(
    val name: String,
    val city: String? = null,
    val tagline: String? = null,
    val description: String? = null,
    val phone: String? = null,
    val address: String? = null,
    @SerialName("logo_url") val logoUrl: String? = null,
    @SerialName("cover_image_url") val coverImageUrl: String? = null,
)

@Serializable
data class AnnouncementDto(
    val id: String,
    val title: String,
    val content: String,
    @SerialName("image_url") val imageUrl: String? = null,
)
