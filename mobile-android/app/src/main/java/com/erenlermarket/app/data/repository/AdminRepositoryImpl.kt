package com.erenlermarket.app.data.repository

import com.erenlermarket.app.data.remote.AdminApi
import com.erenlermarket.app.data.remote.apiCall
import com.erenlermarket.app.data.remote.dto.SendMessageRequest
import com.erenlermarket.app.data.remote.dto.UpdateOrderStatusRequest
import com.erenlermarket.app.data.remote.toDomain
import com.erenlermarket.app.domain.model.AdminConversation
import com.erenlermarket.app.domain.model.LowStockProduct
import com.erenlermarket.app.domain.model.Message
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.OrderStatus
import com.erenlermarket.app.domain.repository.AdminRepository
import javax.inject.Inject

class AdminRepositoryImpl @Inject constructor(
    private val api: AdminApi,
) : AdminRepository {

    override suspend fun orders(status: OrderStatus?): List<Order> = apiCall {
        api.orders(status?.apiValue).map { it.toDomain() }
    }

    override suspend fun order(id: String): Order = apiCall { api.order(id).toDomain() }

    override suspend fun updateOrderStatus(
        id: String,
        status: OrderStatus,
        note: String?,
    ): Order = apiCall {
        api.updateOrderStatus(
            id,
            UpdateOrderStatusRequest(status.apiValue, note?.trim()?.ifBlank { null }),
        ).toDomain()
    }

    override suspend fun conversations(): List<AdminConversation> = apiCall {
        api.conversations().map { it.toDomain() }
    }

    override suspend fun conversationMessages(id: String): List<Message> = apiCall {
        api.conversationMessages(id).map { it.toDomain() }
    }

    override suspend fun reply(conversationId: String, content: String): Message = apiCall {
        api.reply(conversationId, SendMessageRequest(content.trim())).toDomain()
    }

    override suspend fun lowStock(): List<LowStockProduct> = apiCall {
        api.lowStock().map { it.toDomain() }
    }
}
