package com.erenlermarket.app.domain.repository

import com.erenlermarket.app.domain.model.Address
import com.erenlermarket.app.domain.model.CartItem
import com.erenlermarket.app.domain.model.CheckoutPreview
import com.erenlermarket.app.domain.model.NewAddress
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.PlaceOrderInput
import com.erenlermarket.app.domain.model.Product

interface CartRepository {
    suspend fun cart(): List<CartItem>
    suspend fun addItem(productId: String, quantity: Int)
    suspend fun updateQuantity(productId: String, quantity: Int)
    suspend fun removeItem(productId: String)
    suspend fun clear()
    suspend fun checkoutPreview(couponCode: String?): CheckoutPreview
}

interface WishlistRepository {
    suspend fun wishlist(): List<Product>
    suspend fun add(productId: String)
    suspend fun remove(productId: String)
}

interface AddressRepository {
    suspend fun addresses(): List<Address>
    suspend fun create(address: NewAddress): Address
    suspend fun delete(id: String)
}

interface OrderRepository {
    suspend fun orders(): List<Order>
    suspend fun order(id: String): Order
    suspend fun place(input: PlaceOrderInput): Order
    suspend fun cancel(id: String, reason: String?): Order
}
