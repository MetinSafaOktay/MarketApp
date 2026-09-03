package com.erenlermarket.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.math.BigDecimal

// İstek gövdeleri backend snake_case bekliyor; yanıtlar da snake_case.

// --- Sepet ---

@Serializable
data class CartItemDto(
    val id: String,
    val quantity: Int,
    val products: ProductDto,
)

/** Sepet/istek listesi ortak sarmalayıcı (istek listesinde `quantity` yok). */
@Serializable
data class ProductWrapperDto(
    val products: ProductDto,
)

@Serializable
data class AddCartItemRequest(
    @SerialName("product_id") val productId: String,
    val quantity: Int,
)

@Serializable
data class UpdateCartItemRequest(
    val quantity: Int,
)

@Serializable
data class ProductRefRequest(
    @SerialName("product_id") val productId: String,
)

@Serializable
data class CheckoutPreviewRequest(
    @SerialName("coupon_code") val couponCode: String? = null,
)

// --- Checkout preview ---

@Serializable
data class CheckoutLineDto(
    @SerialName("product_id") val productId: String,
    val name: String,
    val quantity: Int,
    @SerialName("unit_price") @Serializable(MoneySerializer::class) val unitPrice: BigDecimal,
    @SerialName("line_total") @Serializable(MoneySerializer::class) val lineTotal: BigDecimal,
    @SerialName("in_stock") val inStock: Boolean,
    @SerialName("stock_quantity") val stockQuantity: Int = 0,
)

@Serializable
data class CheckoutCouponDto(
    val code: String,
    @SerialName("discount_type") val discountType: String,
    @SerialName("discount_value") @Serializable(MoneySerializer::class) val discountValue: BigDecimal,
)

@Serializable
data class CheckoutPreviewDto(
    val items: List<CheckoutLineDto> = emptyList(),
    @Serializable(MoneySerializer::class) val subtotal: BigDecimal,
    @SerialName("discount_amount") @Serializable(MoneySerializer::class) val discountAmount: BigDecimal,
    @Serializable(MoneySerializer::class) val total: BigDecimal,
    val coupon: CheckoutCouponDto? = null,
    @SerialName("coupon_error") val couponError: String? = null,
    @SerialName("has_stock_issues") val hasStockIssues: Boolean = false,
)

// --- Adres ---

@Serializable
data class AddressDto(
    val id: String,
    val label: String,
    @SerialName("full_address") val fullAddress: String,
    val city: String,
    val district: String,
    @SerialName("is_default") val isDefault: Boolean = false,
)

@Serializable
data class AddressRequest(
    val label: String,
    @SerialName("full_address") val fullAddress: String,
    val city: String,
    val district: String,
    @SerialName("is_default") val isDefault: Boolean = false,
)

// --- Sipariş ---

@Serializable
data class OrderItemDto(
    val id: String,
    @SerialName("product_id") val productId: String,
    val quantity: Int,
    @SerialName("unit_price_snapshot") @Serializable(MoneySerializer::class) val unitPriceSnapshot: BigDecimal,
    @Serializable(MoneySerializer::class) val subtotal: BigDecimal,
    val products: ProductDto? = null,
)

@Serializable
data class OrderHistoryDto(
    val id: String,
    val status: String,
    val note: String? = null,
    @SerialName("created_at") val createdAt: String? = null,
)

@Serializable
data class OrderDto(
    val id: String,
    val status: String,
    @SerialName("payment_method") val paymentMethod: String,
    @Serializable(MoneySerializer::class) val subtotal: BigDecimal,
    @SerialName("discount_amount") @Serializable(MoneySerializer::class) val discountAmount: BigDecimal,
    @SerialName("total_amount") @Serializable(MoneySerializer::class) val totalAmount: BigDecimal,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("order_items") val orderItems: List<OrderItemDto> = emptyList(),
    @SerialName("order_status_history") val orderStatusHistory: List<OrderHistoryDto>? = null,
    val addresses: AddressDto? = null,
    // Yalnızca /admin/orders yanıtında dolu — müşteriye açık uçlarda null.
    val users: OrderCustomerDto? = null,
)

@Serializable
data class OrderItemRequest(
    @SerialName("product_id") val productId: String,
    val quantity: Int,
)

@Serializable
data class CreateOrderRequest(
    @SerialName("address_id") val addressId: String,
    val items: List<OrderItemRequest>,
    @SerialName("coupon_code") val couponCode: String? = null,
    @SerialName("payment_method") val paymentMethod: String,
)

@Serializable
data class CancelOrderRequest(
    val reason: String? = null,
)
