package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.remote.dto.ConversationDto
import com.erenlermarket.app.data.remote.dto.LowStockProductDto
import com.erenlermarket.app.domain.model.AdminConversation
import com.erenlermarket.app.domain.model.LowStockProduct

fun ConversationDto.toDomain(): AdminConversation {
    val last = messages.firstOrNull()
    return AdminConversation(
        id = id,
        customerName = users?.profileName?.takeIf { it.isNotBlank() } ?: "Müşteri",
        photoUrl = users?.profilePhotoUrl,
        lastMessage = last?.content,
        awaitingReply = last?.senderType == "user" && last.isRead.not(),
        createdAt = last?.createdAt ?: createdAt,
    )
}

fun LowStockProductDto.toDomain(): LowStockProduct = LowStockProduct(
    id = id,
    name = name,
    sku = sku,
    stockQuantity = stockQuantity,
    categoryName = categories?.name?.takeIf { it.isNotBlank() },
)
