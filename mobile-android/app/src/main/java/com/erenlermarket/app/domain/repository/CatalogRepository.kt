package com.erenlermarket.app.domain.repository

import com.erenlermarket.app.domain.model.Page
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.model.ProductCategory
import com.erenlermarket.app.domain.model.ProductQuery

interface CatalogRepository {
    suspend fun products(query: ProductQuery): Page<Product>
    suspend fun product(id: String): Product
    suspend fun similarProducts(id: String): List<Product>
    suspend fun categories(): List<ProductCategory>
}
