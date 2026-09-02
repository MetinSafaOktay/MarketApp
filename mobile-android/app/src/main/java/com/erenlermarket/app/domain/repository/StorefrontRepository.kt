package com.erenlermarket.app.domain.repository

import com.erenlermarket.app.domain.model.Announcement
import com.erenlermarket.app.domain.model.StoreProfile

interface StorefrontRepository {
    suspend fun storeProfile(): StoreProfile
    suspend fun announcements(): List<Announcement>
}
