package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.remote.dto.MessageDto
import com.erenlermarket.app.data.remote.dto.NotificationDto
import com.erenlermarket.app.data.remote.dto.UserSettingsDto
import com.erenlermarket.app.domain.model.AppNotification
import com.erenlermarket.app.domain.model.Message
import com.erenlermarket.app.domain.model.MessageSender
import com.erenlermarket.app.domain.model.UserSettings

fun MessageDto.toDomain(): Message = Message(
    id = id,
    sender = MessageSender.from(senderType),
    content = content,
    isRead = isRead,
    createdAt = createdAt,
)

fun NotificationDto.toDomain(): AppNotification = AppNotification(
    id = id,
    type = type,
    title = title,
    body = body?.takeIf { it.isNotBlank() },
    isRead = isRead,
    relatedOrderId = relatedOrderId,
    createdAt = createdAt,
)

fun UserSettingsDto.toDomain(): UserSettings = UserSettings(
    language = language,
    theme = theme,
    pushNotificationsEnabled = pushNotificationsEnabled,
    orderNotificationsEnabled = orderNotificationsEnabled,
)
