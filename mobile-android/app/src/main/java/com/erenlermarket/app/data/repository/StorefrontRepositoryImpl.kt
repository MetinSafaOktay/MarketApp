package com.erenlermarket.app.data.repository

import com.erenlermarket.app.data.remote.ErenlerApi
import com.erenlermarket.app.data.remote.apiCall
import com.erenlermarket.app.data.remote.toDomain
import com.erenlermarket.app.domain.model.Announcement
import com.erenlermarket.app.domain.model.StoreProfile
import com.erenlermarket.app.domain.repository.StorefrontRepository
import javax.inject.Inject

class StorefrontRepositoryImpl @Inject constructor(
    private val api: ErenlerApi,
) : StorefrontRepository {

    override suspend fun storeProfile(): StoreProfile = apiCall { api.store().toDomain() }

    override suspend fun announcements(): List<Announcement> = apiCall {
        api.announcements().map { it.toDomain() }
    }
}
