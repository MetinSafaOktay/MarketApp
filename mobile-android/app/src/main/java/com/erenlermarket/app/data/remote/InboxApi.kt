package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.remote.dto.MessageDto
import com.erenlermarket.app.data.remote.dto.NotificationDto
import com.erenlermarket.app.data.remote.dto.SendMessageRequest
import com.erenlermarket.app.data.remote.dto.SettingsUpdateRequest
import com.erenlermarket.app.data.remote.dto.UserSettingsDto
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

interface InboxApi {

    @GET("conversations/me")
    suspend fun messages(): List<MessageDto>

    @POST("conversations/me/messages")
    suspend fun sendMessage(@Body body: SendMessageRequest): MessageDto

    @GET("notifications/me")
    suspend fun notifications(): List<NotificationDto>

    @PATCH("notifications/{id}/read")
    suspend fun markNotificationRead(@Path("id") id: String)

    @PATCH("notifications/me/read-all")
    suspend fun markAllNotificationsRead()

    @GET("users/me/settings")
    suspend fun settings(): UserSettingsDto

    @PATCH("users/me/settings")
    suspend fun updateSettings(@Body body: SettingsUpdateRequest): UserSettingsDto
}
