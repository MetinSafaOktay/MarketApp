package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.remote.dto.AddCartItemRequest
import com.erenlermarket.app.data.remote.dto.AddressDto
import com.erenlermarket.app.data.remote.dto.AddressRequest
import com.erenlermarket.app.data.remote.dto.CancelOrderRequest
import com.erenlermarket.app.data.remote.dto.CartItemDto
import com.erenlermarket.app.data.remote.dto.CheckoutPreviewDto
import com.erenlermarket.app.data.remote.dto.CheckoutPreviewRequest
import com.erenlermarket.app.data.remote.dto.CreateOrderRequest
import com.erenlermarket.app.data.remote.dto.OrderDto
import com.erenlermarket.app.data.remote.dto.ProductRefRequest
import com.erenlermarket.app.data.remote.dto.ProductWrapperDto
import com.erenlermarket.app.data.remote.dto.UpdateCartItemRequest
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

interface CommerceApi {

    // Sepet
    @GET("cart")
    suspend fun cart(): List<CartItemDto>

    @POST("cart/items")
    suspend fun addCartItem(@Body body: AddCartItemRequest)

    @PATCH("cart/items/{productId}")
    suspend fun updateCartItem(@Path("productId") productId: String, @Body body: UpdateCartItemRequest)

    @DELETE("cart/items/{productId}")
    suspend fun removeCartItem(@Path("productId") productId: String)

    @DELETE("cart")
    suspend fun clearCart()

    @POST("cart/checkout-preview")
    suspend fun checkoutPreview(@Body body: CheckoutPreviewRequest): CheckoutPreviewDto

    // İstek listesi
    @GET("wishlist")
    suspend fun wishlist(): List<ProductWrapperDto>

    @POST("wishlist/items")
    suspend fun addWishlistItem(@Body body: ProductRefRequest)

    @DELETE("wishlist/items/{productId}")
    suspend fun removeWishlistItem(@Path("productId") productId: String)

    // Adresler
    @GET("addresses")
    suspend fun addresses(): List<AddressDto>

    @POST("addresses")
    suspend fun createAddress(@Body body: AddressRequest): AddressDto

    @DELETE("addresses/{id}")
    suspend fun deleteAddress(@Path("id") id: String)

    // Siparişler
    @GET("orders")
    suspend fun orders(): List<OrderDto>

    @GET("orders/{id}")
    suspend fun order(@Path("id") id: String): OrderDto

    @POST("orders")
    suspend fun createOrder(@Body body: CreateOrderRequest): OrderDto

    @PATCH("orders/{id}/cancel")
    suspend fun cancelOrder(@Path("id") id: String, @Body body: CancelOrderRequest): OrderDto
}
