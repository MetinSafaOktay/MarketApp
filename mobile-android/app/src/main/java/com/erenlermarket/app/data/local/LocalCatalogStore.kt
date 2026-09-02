package com.erenlermarket.app.data.local

import com.erenlermarket.app.data.local.cache.CatalogCacheDao
import com.erenlermarket.app.data.local.cache.toCacheEntity
import com.erenlermarket.app.data.local.cache.toDomain
import com.erenlermarket.app.di.AppScope
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.model.ProductCategory
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject
import javax.inject.Singleton

private const val RECENT_BUCKET = "recent"
private const val RECENT_LIMIT = 12

/** Son gezilen ürünler + çevrimdışı katalog önbelleği. iOS `LocalCatalogStore` karşılığı. */
@Singleton
class LocalCatalogStore @Inject constructor(
    private val dao: CatalogCacheDao,
    @AppScope scope: CoroutineScope,
) {

    val recentProducts: StateFlow<List<Product>> = dao.recentProducts(RECENT_LIMIT)
        .map { rows -> rows.map { it.toDomain() } }
        .stateIn(scope, SharingStarted.Eagerly, emptyList())

    /** Ürünü "son gezilenler"in başına taşır, listeyi RECENT_LIMIT ile sınırlar. */
    suspend fun recordView(product: Product) {
        val others = dao.productsInBucket(RECENT_BUCKET).filter { it.id != product.id }
        val reordered = buildList {
            add(product.toCacheEntity(RECENT_BUCKET, position = 0))
            others.forEachIndexed { index, entity -> add(entity.copy(position = index + 1)) }
        }.take(RECENT_LIMIT)
        dao.replaceBucket(RECENT_BUCKET, reordered)
    }

    suspend fun cacheRail(railId: String, products: List<Product>) {
        dao.replaceBucket(
            railBucket(railId),
            products.mapIndexed { index, product -> product.toCacheEntity(railBucket(railId), index) },
        )
    }

    suspend fun cachedRail(railId: String): List<Product> =
        dao.productsInBucket(railBucket(railId)).map { it.toDomain() }

    suspend fun cacheCategories(categories: List<ProductCategory>) {
        dao.replaceCategories(categories.map { it.toCacheEntity() })
    }

    suspend fun cachedCategories(): List<ProductCategory> = dao.categories().map { it.toDomain() }

    private fun railBucket(railId: String) = "rail:$railId"
}
