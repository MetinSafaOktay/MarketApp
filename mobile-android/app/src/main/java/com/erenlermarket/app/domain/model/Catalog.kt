package com.erenlermarket.app.domain.model

import java.math.BigDecimal

/** Katalog ürünü. Çevrilebilir alanlar backend tarafından çözülmüş gelir. */
data class Product(
    val id: String,
    val categoryId: String,
    val name: String,
    val sku: String,
    val description: String?,
    val price: BigDecimal,
    val originalPrice: BigDecimal?,
    val isNewArrival: Boolean,
    val stockQuantity: Int,
    val imageUrls: List<String>,
) {
    val isDiscounted: Boolean
        get() = originalPrice != null && originalPrice > price

    val isInStock: Boolean
        get() = stockQuantity > 0

    val discountPercent: Int?
        get() {
            val original = originalPrice ?: return null
            if (original <= BigDecimal.ZERO || original <= price) return null
            val ratio = (original - price).toDouble() / original.toDouble()
            return (ratio * 100).toInt()
        }
}

data class ProductCategory(
    val id: String,
    val name: String,
    val imageUrl: String?,
    val displayOrder: Int,
)

/** Sayfalı liste (backend `{ data, meta }` karşılığı). */
data class Page<T>(
    val items: List<T>,
    val page: Int,
    val pageSize: Int,
    val total: Int,
    val totalPages: Int,
) {
    val hasNextPage: Boolean get() = page < totalPages
}

enum class ProductSort(val apiValue: String) {
    NEWEST("newest"),
    PRICE_ASC("price_asc"),
    PRICE_DESC("price_desc"),
}

data class ProductQuery(
    val page: Int = 1,
    val pageSize: Int = 20,
    val categoryId: String? = null,
    val search: String? = null,
    val sort: ProductSort = ProductSort.NEWEST,
    val onlyDiscounted: Boolean = false,
    val onlyNew: Boolean = false,
    val inStock: Boolean = false,
) {
    val hasActiveFilters: Boolean
        get() = onlyDiscounted || onlyNew || inStock || sort != ProductSort.NEWEST
}
