package com.erenlermarket.app.domain.repository

import com.erenlermarket.app.domain.model.AdminConversation
import com.erenlermarket.app.domain.model.LowStockProduct
import com.erenlermarket.app.domain.model.Message
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.OrderStatus

/** Mobil uygulamadaki admin ekranlarının veri kaynağı. */
interface AdminRepository {
    suspend fun orders(status: OrderStatus?): List<Order>
    suspend fun order(id: String): Order
    suspend fun updateOrderStatus(id: String, status: OrderStatus, note: String?): Order

    suspend fun conversations(): List<AdminConversation>
    suspend fun conversationMessages(id: String): List<Message>
    suspend fun reply(conversationId: String, content: String): Message

    suspend fun lowStock(): List<LowStockProduct>
}
