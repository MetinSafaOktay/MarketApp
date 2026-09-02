package com.erenlermarket.app.domain.model

data class StoreProfile(
    val name: String,
    val city: String?,
    val tagline: String?,
    val description: String?,
    val phone: String?,
    val address: String?,
    val logoUrl: String?,
    val coverImageUrl: String?,
)

data class Announcement(
    val id: String,
    val title: String,
    val content: String,
    val imageUrl: String?,
)
