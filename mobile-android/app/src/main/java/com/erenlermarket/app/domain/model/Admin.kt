package com.erenlermarket.app.domain.model

/** Admin gelen kutusu satırı: bir müşteri + son mesaj önizlemesi. */
data class AdminConversation(
    val id: String,
    val customerName: String,
    val photoUrl: String?,
    val lastMessage: String?,
    /** Son mesaj müşteriden mi geldi (mağaza yanıtı bekliyor işareti). */
    val awaitingReply: Boolean,
    val createdAt: String?,
)

/** Stoğu azalan ürün — admin uyarı listesi. */
data class LowStockProduct(
    val id: String,
    val name: String,
    val sku: String,
    val stockQuantity: Int,
    val categoryName: String?,
) {
    val isOutOfStock: Boolean get() = stockQuantity <= 0
}
