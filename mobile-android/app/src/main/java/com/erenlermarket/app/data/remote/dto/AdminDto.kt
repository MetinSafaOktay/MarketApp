package com.erenlermarket.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** `GET /admin/orders` siparişe iliştirilen müşteri özeti. */
@Serializable
data class OrderCustomerDto(
    val id: String,
    @SerialName("profile_name") val profileName: String? = null,
    @SerialName("first_name") val firstName: String? = null,
    @SerialName("last_name") val lastName: String? = null,
    val phone: String? = null,
    val email: String? = null,
)

/** `PATCH /orders/{id}/status` gövdesi (admin). */
@Serializable
data class UpdateOrderStatusRequest(
    val status: String,
    val note: String? = null,
)

/** `GET /conversations` — admin gelen kutusu satırı (kullanıcı + son mesaj). */
@Serializable
data class ConversationUserDto(
    val id: String,
    @SerialName("profile_name") val profileName: String? = null,
    @SerialName("profile_photo_url") val profilePhotoUrl: String? = null,
)

@Serializable
data class ConversationDto(
    val id: String,
    val users: ConversationUserDto? = null,
    val messages: List<MessageDto> = emptyList(),
    @SerialName("created_at") val createdAt: String? = null,
)

/** `GET /admin/products/low-stock` — backend adları `?lang` ile düzleştiriyor. */
@Serializable
data class LowStockCategoryDto(
    val name: String? = null,
)

@Serializable
data class LowStockProductDto(
    val id: String,
    val name: String,
    val sku: String,
    @SerialName("stock_quantity") val stockQuantity: Int = 0,
    val categories: LowStockCategoryDto? = null,
)
