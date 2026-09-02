package com.erenlermarket.app.ui.navigation

import android.net.Uri

object Routes {
    const val HOME = "home"
    const val STORE = "store"
    const val CATEGORIES = "categories"

    const val PRODUCT = "product/{productId}?name={name}"
    fun product(id: String, name: String): String =
        "product/$id?name=${Uri.encode(name)}"

    const val PRODUCT_LIST =
        "products?title={title}&categoryId={categoryId}&onlyDiscounted={onlyDiscounted}&onlyNew={onlyNew}"

    fun productList(
        title: String,
        categoryId: String? = null,
        onlyDiscounted: Boolean = false,
        onlyNew: Boolean = false,
    ): String = buildString {
        append("products?title=").append(Uri.encode(title))
        categoryId?.let { append("&categoryId=").append(it) }
        append("&onlyDiscounted=").append(onlyDiscounted)
        append("&onlyNew=").append(onlyNew)
    }

    val topLevel = setOf(HOME, STORE, CATEGORIES)
}
