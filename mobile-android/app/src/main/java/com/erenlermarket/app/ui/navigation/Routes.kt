package com.erenlermarket.app.ui.navigation

import android.net.Uri

object Routes {
    const val HOME = "home"
    const val STORE = "store"
    const val CATEGORIES = "categories"

    const val PROFILE = "profile"
    const val AUTH = "auth"
    const val CART = "cart"
    const val CHECKOUT = "checkout"
    const val ORDER_PLACED = "order-placed/{orderId}"
    fun orderPlaced(orderId: String): String = "order-placed/$orderId"
    const val ORDERS = "orders"
    const val ORDER_DETAIL = "orders/{orderId}"
    fun orderDetail(orderId: String): String = "orders/$orderId"
    const val WISHLIST = "wishlist"
    const val MESSAGES = "messages"
    const val NOTIFICATIONS = "notifications"
    const val SETTINGS = "settings"
    const val EDIT_PROFILE = "edit-profile"
    const val ABOUT = "about"

    // --- Admin (yalnızca admin rolündeki kullanıcıya Profil'den açılır) ---
    const val ADMIN = "admin"
    const val ADMIN_ORDERS = "admin/orders"
    const val ADMIN_ORDER_DETAIL = "admin/orders/{orderId}"
    fun adminOrderDetail(orderId: String): String = "admin/orders/$orderId"
    const val ADMIN_MESSAGES = "admin/messages"
    const val ADMIN_CONVERSATION = "admin/conversations/{conversationId}?name={name}"
    fun adminConversation(id: String, name: String): String =
        "admin/conversations/$id?name=${Uri.encode(name)}"
    const val ADMIN_LOW_STOCK = "admin/low-stock"

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
