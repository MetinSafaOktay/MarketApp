package com.erenlermarket.app.domain.model

import java.math.BigDecimal

enum class DiscountType { PERCENTAGE, FIXED }

data class AppliedCoupon(
    val code: String,
    val discountType: DiscountType,
    val discountValue: BigDecimal,
)

/** `POST /cart/checkout-preview` sonucu. */
data class CheckoutPreview(
    val lines: List<Line>,
    val subtotal: BigDecimal,
    val discountAmount: BigDecimal,
    val total: BigDecimal,
    val coupon: AppliedCoupon?,
    val couponError: String?,
    val hasStockIssues: Boolean,
    val deliveryAreaOk: Boolean = true,
    val deliveryAreaError: String? = null,
) {
    data class Line(
        val productId: String,
        val name: String,
        val quantity: Int,
        val unitPrice: BigDecimal,
        val lineTotal: BigDecimal,
        val inStock: Boolean,
        val stockQuantity: Int,
    )
}
