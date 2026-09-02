package com.erenlermarket.app.domain.repository

import com.erenlermarket.app.domain.model.AppNotification
import com.erenlermarket.app.domain.model.Message
import com.erenlermarket.app.domain.model.SettingsUpdate
import com.erenlermarket.app.domain.model.UserSettings

interface MessagingRepository {
    suspend fun messages(): List<Message>
    suspend fun send(content: String): Message
}

interface NotificationsRepository {
    suspend fun notifications(): List<AppNotification>
    suspend fun markRead(id: String)
    suspend fun markAllRead()
}

interface SettingsRepository {
    suspend fun settings(): UserSettings
    suspend fun update(update: SettingsUpdate): UserSettings
}
