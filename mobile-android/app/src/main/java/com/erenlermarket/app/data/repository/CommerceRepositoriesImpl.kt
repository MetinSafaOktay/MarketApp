package com.erenlermarket.app.data.repository

import com.erenlermarket.app.data.remote.CommerceApi
import com.erenlermarket.app.data.remote.apiCall
import com.erenlermarket.app.data.remote.dto.AddCartItemRequest
import com.erenlermarket.app.data.remote.dto.CancelOrderRequest
import com.erenlermarket.app.data.remote.dto.CheckoutPreviewRequest
import com.erenlermarket.app.data.remote.dto.CreateOrderRequest
import com.erenlermarket.app.data.remote.dto.OrderItemRequest
import com.erenlermarket.app.data.remote.dto.ProductRefRequest
import com.erenlermarket.app.data.remote.dto.UpdateCartItemRequest
import com.erenlermarket.app.data.remote.toDomain
import com.erenlermarket.app.data.remote.toRequest
import com.erenlermarket.app.domain.model.Address
import com.erenlermarket.app.domain.model.CartItem
import com.erenlermarket.app.domain.model.CheckoutPreview
import com.erenlermarket.app.domain.model.NewAddress
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.PlaceOrderInput
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.repository.AddressRepository
import com.erenlermarket.app.domain.repository.CartRepository
import com.erenlermarket.app.domain.repository.OrderRepository
import com.erenlermarket.app.domain.repository.WishlistRepository
import javax.inject.Inject

class CartRepositoryImpl @Inject constructor(
    private val api: CommerceApi,
) : CartRepository {

    override suspend fun cart(): List<CartItem> = apiCall { api.cart().map { it.toDomain() } }

    override suspend fun addItem(productId: String, quantity: Int) = apiCall {
        api.addCartItem(AddCartItemRequest(productId, quantity))
    }

    override suspend fun updateQuantity(productId: String, quantity: Int) = apiCall {
        api.updateCartItem(productId, UpdateCartItemRequest(quantity))
    }

    override suspend fun removeItem(productId: String) = apiCall { api.removeCartItem(productId) }

    override suspend fun clear() = apiCall { api.clearCart() }

    override suspend fun checkoutPreview(
        couponCode: String?,
        addressId: String?,
    ): CheckoutPreview = apiCall {
        api.checkoutPreview(
            CheckoutPreviewRequest(
                couponCode = couponCode?.trim()?.ifBlank { null },
                addressId = addressId,
            ),
        ).toDomain()
    }
}

class WishlistRepositoryImpl @Inject constructor(
    private val api: CommerceApi,
) : WishlistRepository {

    override suspend fun wishlist(): List<Product> = apiCall {
        api.wishlist().map { it.products.toDomain() }
    }

    override suspend fun add(productId: String) = apiCall {
        api.addWishlistItem(ProductRefRequest(productId))
    }

    override suspend fun remove(productId: String) = apiCall { api.removeWishlistItem(productId) }
}

class AddressRepositoryImpl @Inject constructor(
    private val api: CommerceApi,
) : AddressRepository {

    override suspend fun addresses(): List<Address> = apiCall {
        api.addresses().map { it.toDomain() }
    }

    override suspend fun create(address: NewAddress): Address = apiCall {
        api.createAddress(address.toRequest()).toDomain()
    }

    override suspend fun delete(id: String) = apiCall { api.deleteAddress(id) }
}

class OrderRepositoryImpl @Inject constructor(
    private val api: CommerceApi,
) : OrderRepository {

    override suspend fun orders(): List<Order> = apiCall { api.orders().map { it.toDomain() } }

    override suspend fun order(id: String): Order = apiCall { api.order(id).toDomain() }

    override suspend fun place(input: PlaceOrderInput): Order = apiCall {
        api.createOrder(
            CreateOrderRequest(
                addressId = input.addressId,
                items = input.items.map { OrderItemRequest(it.productId, it.quantity) },
                couponCode = input.couponCode?.trim()?.ifBlank { null },
                paymentMethod = input.paymentMethod.apiValue,
            ),
        ).toDomain()
    }

    override suspend fun cancel(id: String, reason: String?): Order = apiCall {
        api.cancelOrder(id, CancelOrderRequest(reason?.trim()?.ifBlank { null })).toDomain()
    }
}
