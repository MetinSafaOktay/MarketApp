package com.erenlermarket.app.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class MessageDto(
    val id: String,
    @SerialName("sender_type") val senderType: String,
    val content: String,
    @SerialName("is_read") val isRead: Boolean = false,
    @SerialName("created_at") val createdAt: String? = null,
)

@Serializable
data class SendMessageRequest(
    val content: String,
)

@Serializable
data class NotificationDto(
    val id: String,
    val type: String,
    val title: String,
    val body: String? = null,
    @SerialName("is_read") val isRead: Boolean = false,
    @SerialName("related_order_id") val relatedOrderId: String? = null,
    @SerialName("created_at") val createdAt: String? = null,
)

@Serializable
data class UserSettingsDto(
    val language: String = "tr",
    val theme: String = "dark",
    @SerialName("push_notifications_enabled") val pushNotificationsEnabled: Boolean = true,
    @SerialName("order_notifications_enabled") val orderNotificationsEnabled: Boolean = true,
)

@Serializable
data class SettingsUpdateRequest(
    @SerialName("push_notifications_enabled") val pushNotificationsEnabled: Boolean? = null,
    @SerialName("order_notifications_enabled") val orderNotificationsEnabled: Boolean? = null,
)

@Serializable
data class UpdateProfileRequest(
    @SerialName("profile_name") val profileName: String? = null,
    val bio: String? = null,
)
