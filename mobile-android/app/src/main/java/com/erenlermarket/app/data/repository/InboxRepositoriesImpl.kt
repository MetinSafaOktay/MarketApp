package com.erenlermarket.app.data.repository

import com.erenlermarket.app.data.remote.InboxApi
import com.erenlermarket.app.data.remote.apiCall
import com.erenlermarket.app.data.remote.dto.SendMessageRequest
import com.erenlermarket.app.data.remote.dto.SettingsUpdateRequest
import com.erenlermarket.app.data.remote.toDomain
import com.erenlermarket.app.domain.model.AppNotification
import com.erenlermarket.app.domain.model.Message
import com.erenlermarket.app.domain.model.SettingsUpdate
import com.erenlermarket.app.domain.model.UserSettings
import com.erenlermarket.app.domain.repository.MessagingRepository
import com.erenlermarket.app.domain.repository.NotificationsRepository
import com.erenlermarket.app.domain.repository.SettingsRepository
import javax.inject.Inject

class MessagingRepositoryImpl @Inject constructor(
    private val api: InboxApi,
) : MessagingRepository {

    override suspend fun messages(): List<Message> = apiCall { api.messages().map { it.toDomain() } }

    override suspend fun send(content: String): Message = apiCall {
        api.sendMessage(SendMessageRequest(content.trim())).toDomain()
    }
}

class NotificationsRepositoryImpl @Inject constructor(
    private val api: InboxApi,
) : NotificationsRepository {

    override suspend fun notifications(): List<AppNotification> = apiCall {
        api.notifications().map { it.toDomain() }
    }

    override suspend fun markRead(id: String) = apiCall { api.markNotificationRead(id) }

    override suspend fun markAllRead() = apiCall { api.markAllNotificationsRead() }
}

class SettingsRepositoryImpl @Inject constructor(
    private val api: InboxApi,
) : SettingsRepository {

    override suspend fun settings(): UserSettings = apiCall { api.settings().toDomain() }

    override suspend fun update(update: SettingsUpdate): UserSettings = apiCall {
        api.updateSettings(
            SettingsUpdateRequest(
                pushNotificationsEnabled = update.pushNotificationsEnabled,
                orderNotificationsEnabled = update.orderNotificationsEnabled,
            ),
        ).toDomain()
    }
}
