package com.erenlermarket.app.data.repository

import com.erenlermarket.app.data.remote.ErenlerApi
import com.erenlermarket.app.data.remote.apiCall
import com.erenlermarket.app.data.remote.toDomain
import com.erenlermarket.app.domain.model.Page
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.model.ProductCategory
import com.erenlermarket.app.domain.model.ProductQuery
import com.erenlermarket.app.domain.repository.CatalogRepository
import javax.inject.Inject

class CatalogRepositoryImpl @Inject constructor(
    private val api: ErenlerApi,
) : CatalogRepository {

    override suspend fun products(query: ProductQuery): Page<Product> = apiCall {
        api.products(query.toParams()).toDomain()
    }

    override suspend fun product(id: String): Product = apiCall {
        api.product(id).toDomain()
    }

    override suspend fun similarProducts(id: String): List<Product> = apiCall {
        api.similarProducts(id).map { it.toDomain() }
    }

    override suspend fun categories(): List<ProductCategory> = apiCall {
        api.categories().map { it.toDomain() }.sortedBy { it.displayOrder }
    }

    private fun ProductQuery.toParams(): Map<String, String> = buildMap {
        put("page", page.toString())
        put("pageSize", pageSize.toString())
        put("sort", sort.apiValue)
        categoryId?.let { put("categoryId", it) }
        search?.takeIf { it.isNotBlank() }?.let { put("q", it) }
        if (onlyDiscounted) put("onlyDiscounted", "true")
        if (onlyNew) put("onlyNew", "true")
        if (inStock) put("inStock", "true")
    }
}
