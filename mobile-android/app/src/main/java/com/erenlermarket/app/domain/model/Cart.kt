package com.erenlermarket.app.domain.model

import java.math.BigDecimal

/** Sepet satırı (sunucuda tutulur). */
data class CartItem(
    val id: String,
    val product: Product,
    val quantity: Int,
) {
    val lineTotal: BigDecimal get() = product.price.multiply(BigDecimal(quantity))

    /** İstenen adet stokta var mı? */
    val isAvailable: Boolean get() = product.stockQuantity >= quantity
}

val List<CartItem>.totalQuantity: Int get() = sumOf { it.quantity }

val List<CartItem>.subtotal: BigDecimal
    get() = fold(BigDecimal.ZERO) { acc, item -> acc + item.lineTotal }
