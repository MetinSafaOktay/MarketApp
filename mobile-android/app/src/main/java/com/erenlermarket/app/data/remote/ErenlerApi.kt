package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.remote.dto.AnnouncementDto
import com.erenlermarket.app.data.remote.dto.CategoryDto
import com.erenlermarket.app.data.remote.dto.ProductPageDto
import com.erenlermarket.app.data.remote.dto.ProductDto
import com.erenlermarket.app.data.remote.dto.StoreProfileDto
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.QueryMap

interface ErenlerApi {

    @GET("products")
    suspend fun products(@QueryMap params: Map<String, String>): ProductPageDto

    @GET("products/{id}")
    suspend fun product(@Path("id") id: String): ProductDto

    @GET("products/{id}/similar")
    suspend fun similarProducts(@Path("id") id: String): List<ProductDto>

    @GET("categories")
    suspend fun categories(): List<CategoryDto>

    @GET("store")
    suspend fun store(): StoreProfileDto

    @GET("announcements")
    suspend fun announcements(): List<AnnouncementDto>
}
