package com.erenlermarket.app.data

import com.erenlermarket.app.data.remote.dto.MessageDto
import com.erenlermarket.app.data.remote.dto.NotificationDto
import com.erenlermarket.app.data.remote.dto.UserSettingsDto
import com.erenlermarket.app.data.remote.toDomain
import com.erenlermarket.app.domain.model.MessageSender
import com.erenlermarket.app.domain.model.unreadCount
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Test

class InboxMappersTest {

    private val json = Json { ignoreUnknownKeys = true; explicitNulls = false; coerceInputValues = true }

    @Test
    fun `message maps sender_type`() {
        val fromStore = MessageDto("m1", "store", "Merhaba", isRead = false, createdAt = null).toDomain()
        val fromUser = MessageDto("m2", "user", "Selam", isRead = true, createdAt = null).toDomain()

        assertEquals(MessageSender.STORE, fromStore.sender)
        assertEquals(MessageSender.USER, fromUser.sender)
    }

    @Test
    fun `unknown sender defaults to store`() {
        assertEquals(MessageSender.STORE, MessageSender.from("robot"))
    }

    @Test
    fun `notification decodes snake_case and blank body becomes null`() {
        val body = """
            {"id":"n1","type":"order_status_update","title":"Hazırlanıyor","body":"   ",
             "is_read":false,"related_order_id":"o1","created_at":"2026-09-02T10:00:00Z"}
        """.trimIndent()

        val notification = json.decodeFromString(NotificationDto.serializer(), body).toDomain()

        assertEquals("o1", notification.relatedOrderId)
        assertNull(notification.body)
        assertFalse(notification.isRead)
        assertEquals(1, listOf(notification).unreadCount)
    }

    @Test
    fun `settings decode with defaults`() {
        val settings = json.decodeFromString(UserSettingsDto.serializer(), "{}").toDomain()

        assertEquals("tr", settings.language)
        assertEquals(true, settings.pushNotificationsEnabled)
    }
}
