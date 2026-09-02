package com.erenlermarket.app.data.local

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.erenlermarket.app.data.local.cache.AppDatabase
import com.erenlermarket.app.domain.model.ProductCategory
import com.erenlermarket.app.util.testProduct
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.junit.Assert.assertEquals

@OptIn(ExperimentalCoroutinesApi::class)
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [33])
class LocalCatalogStoreTest {

    private lateinit var db: AppDatabase
    private lateinit var store: LocalCatalogStore

    @Before
    fun setUp() {
        db = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            AppDatabase::class.java,
        ).allowMainThreadQueries().build()
    }

    @After
    fun tearDown() {
        db.close()
    }

    private fun store(scope: CoroutineScope) = LocalCatalogStore(db.catalogCacheDao(), scope)

    @Test
    fun `recordView keeps newest first, dedupes and caps at 12`() = runTest {
        store = store(CoroutineScope(StandardTestDispatcher(testScheduler)))

        repeat(15) { store.recordView(testProduct(id = "p$it")) }
        store.recordView(testProduct(id = "p5")) // revisit

        val recent = db.catalogCacheDao().productsInBucket("recent")
        assertEquals(12, recent.size)
        assertEquals("p5", recent.first().id)
        assertEquals("p14", recent[1].id)
        assertEquals(recent.map { it.position }, (0 until 12).toList())
    }

    @Test
    fun `cacheRail round-trips products`() = runTest {
        store = store(CoroutineScope(StandardTestDispatcher(testScheduler)))
        val products = listOf(testProduct("a"), testProduct("b"), testProduct("c"))

        store.cacheRail("discounted", products)
        store.cacheRail("discounted", listOf(testProduct("x"))) // replace

        assertEquals(listOf("x"), store.cachedRail("discounted").map { it.id })
        assertEquals(emptyList<String>(), store.cachedRail("new").map { it.id })
    }

    @Test
    fun `cacheCategories round-trips sorted by display order`() = runTest {
        store = store(CoroutineScope(StandardTestDispatcher(testScheduler)))

        store.cacheCategories(
            listOf(
                ProductCategory("b", "B", null, 2),
                ProductCategory("a", "A", null, 1),
            ),
        )

        assertEquals(listOf("a", "b"), store.cachedCategories().map { it.id })
    }
}
