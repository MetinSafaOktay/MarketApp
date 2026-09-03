package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.remote.dto.ConversationDto
import com.erenlermarket.app.data.remote.dto.LowStockProductDto
import com.erenlermarket.app.data.remote.dto.MessageDto
import com.erenlermarket.app.data.remote.dto.OrderDto
import com.erenlermarket.app.data.remote.dto.SendMessageRequest
import com.erenlermarket.app.data.remote.dto.UpdateOrderStatusRequest
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Yalnızca admin rolüne açık uçlar. Guard backend'de (@Roles('admin')). */
interface AdminApi {

    // --- Siparişler ---
    @GET("admin/orders")
    suspend fun orders(@Query("status") status: String? = null): List<OrderDto>

    @GET("admin/orders/{id}")
    suspend fun order(@Path("id") id: String): OrderDto

    @PATCH("orders/{id}/status")
    suspend fun updateOrderStatus(
        @Path("id") id: String,
        @Body body: UpdateOrderStatusRequest,
    ): OrderDto

    // --- Mesajlaşma (gelen kutusu) ---
    @GET("conversations")
    suspend fun conversations(): List<ConversationDto>

    @GET("conversations/{id}")
    suspend fun conversationMessages(@Path("id") id: String): List<MessageDto>

    @POST("conversations/{id}/messages")
    suspend fun reply(@Path("id") id: String, @Body body: SendMessageRequest): MessageDto

    // --- Stok ---
    @GET("admin/products/low-stock")
    suspend fun lowStock(): List<LowStockProductDto>
}
