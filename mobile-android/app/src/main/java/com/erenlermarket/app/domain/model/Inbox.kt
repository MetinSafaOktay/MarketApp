package com.erenlermarket.app.domain.model

enum class MessageSender(val apiValue: String) {
    USER("user"),
    STORE("store"),
    ;

    companion object {
        fun from(value: String?): MessageSender =
            entries.firstOrNull { it.apiValue == value } ?: STORE
    }
}

data class Message(
    val id: String,
    val sender: MessageSender,
    val content: String,
    val isRead: Boolean,
    val createdAt: String?,
)

data class AppNotification(
    val id: String,
    val type: String,
    val title: String,
    val body: String?,
    val isRead: Boolean,
    val relatedOrderId: String?,
    val createdAt: String?,
)

val List<AppNotification>.unreadCount: Int get() = count { !it.isRead }

data class UserSettings(
    val language: String,
    val theme: String,
    val pushNotificationsEnabled: Boolean,
    val orderNotificationsEnabled: Boolean,
)

/** `PATCH /users/me/settings` — yalnızca değişen alanlar. */
data class SettingsUpdate(
    val pushNotificationsEnabled: Boolean? = null,
    val orderNotificationsEnabled: Boolean? = null,
)

/** `PATCH /users/me` — profil düzenleme. */
data class ProfileUpdate(
    val profileName: String? = null,
    val bio: String? = null,
)
