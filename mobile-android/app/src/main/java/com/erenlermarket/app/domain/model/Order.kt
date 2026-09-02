package com.erenlermarket.app.domain.model

import java.math.BigDecimal

enum class OrderStatus(val apiValue: String) {
    PENDING("pending"),
    CONFIRMED("confirmed"),
    PREPARING("preparing"),
    OUT_FOR_DELIVERY("out_for_delivery"),
    DELIVERED("delivered"),
    CANCELLED("cancelled"),
    ;

    val displayName: String
        get() = when (this) {
            PENDING -> "Sipariş alındı"
            CONFIRMED -> "Onaylandı"
            PREPARING -> "Hazırlanıyor"
            OUT_FOR_DELIVERY -> "Yolda"
            DELIVERED -> "Teslim edildi"
            CANCELLED -> "İptal edildi"
        }

    /** Müşteri yalnızca hazırlığa başlanmadan iptal edebilir. */
    val isCancellableByCustomer: Boolean get() = this == PENDING || this == CONFIRMED

    companion object {
        fun from(value: String?): OrderStatus =
            entries.firstOrNull { it.apiValue == value } ?: PENDING

        /** Zaman çizelgesinde gösterilen normal akış. */
        val deliveryFlow = listOf(PENDING, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED)
    }
}

enum class PaymentMethod(val apiValue: String) {
    CASH_ON_DELIVERY("cash_on_delivery"),
    CARD("card"),
    ;

    val displayName: String
        get() = when (this) {
            CASH_ON_DELIVERY -> "Kapıda nakit"
            CARD -> "Kapıda kart"
        }

    companion object {
        fun from(value: String?): PaymentMethod =
            entries.firstOrNull { it.apiValue == value } ?: CASH_ON_DELIVERY
    }
}

data class OrderLine(
    val id: String,
    val productId: String,
    val name: String,
    val quantity: Int,
    val unitPrice: BigDecimal,
    val lineSubtotal: BigDecimal,
)

data class OrderEvent(
    val id: String,
    val status: OrderStatus,
    val note: String?,
    val createdAt: String?,
)

data class Order(
    val id: String,
    val status: OrderStatus,
    val paymentMethod: PaymentMethod,
    val subtotal: BigDecimal,
    val discountAmount: BigDecimal,
    val totalAmount: BigDecimal,
    val createdAt: String?,
    val lines: List<OrderLine>,
    val statusHistory: List<OrderEvent>,
    val address: Address?,
) {
    val itemCount: Int get() = lines.sumOf { it.quantity }

    /** Kısa referans (id'nin ilk bloğu). */
    val reference: String get() = id.take(8).uppercase()
}

/** Sipariş oluşturma girdisi. */
data class PlaceOrderInput(
    val addressId: String,
    val items: List<Item>,
    val couponCode: String?,
    val paymentMethod: PaymentMethod,
) {
    data class Item(val productId: String, val quantity: Int)
}
