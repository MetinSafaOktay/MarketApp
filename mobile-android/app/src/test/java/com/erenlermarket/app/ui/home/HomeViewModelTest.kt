package com.erenlermarket.app.ui.home

import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.Announcement
import com.erenlermarket.app.domain.model.Page
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.model.ProductQuery
import com.erenlermarket.app.domain.model.StoreProfile
import com.erenlermarket.app.domain.repository.CatalogRepository
import com.erenlermarket.app.domain.repository.StorefrontRepository
import com.erenlermarket.app.util.MainDispatcherRule
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.math.BigDecimal

@OptIn(ExperimentalCoroutinesApi::class)
class HomeViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val storefront = mockk<StorefrontRepository>()
    private val catalog = mockk<CatalogRepository>()

    private fun product(id: String) = Product(
        id = id,
        categoryId = "c1",
        name = "Ürün $id",
        sku = id,
        description = null,
        price = BigDecimal.TEN,
        originalPrice = null,
        isNewArrival = false,
        stockQuantity = 5,
        imageUrls = emptyList(),
    )

    private fun page(items: List<Product>) =
        Page(items = items, page = 1, pageSize = 10, total = items.size, totalPages = 1)

    private val store = StoreProfile(
        name = "Erenler Market",
        city = "Afyonkarahisar",
        tagline = null,
        description = null,
        phone = null,
        address = null,
        logoUrl = null,
        coverImageUrl = null,
    )

    @Test
    fun `builds only the rails that have products`() = runTest {
        coEvery { storefront.storeProfile() } returns store
        coEvery { storefront.announcements() } returns listOf(
            Announcement("a1", "Duyuru", "içerik", null),
        )
        coEvery { catalog.products(match { it.onlyDiscounted }) } returns page(listOf(product("d1")))
        coEvery { catalog.products(match { it.onlyNew }) } returns page(emptyList())
        coEvery { catalog.products(match { !it.onlyDiscounted && !it.onlyNew }) } returns
            page(listOf(product("l1"), product("l2")))

        val vm = HomeViewModel(storefront, catalog)
        advanceUntilIdle()

        val ready = vm.state.value as HomeUiState.Ready
        assertEquals(listOf("discounted", "latest"), ready.rails.map { it.id })
        assertEquals(1, ready.announcements.size)
    }

    @Test
    fun `store failure still renders when a rail loads`() = runTest {
        coEvery { storefront.storeProfile() } throws ApiException(ApiException.Kind.NETWORK, "yok")
        coEvery { storefront.announcements() } returns emptyList()
        coEvery { catalog.products(any()) } returns page(listOf(product("x")))

        val vm = HomeViewModel(storefront, catalog)
        advanceUntilIdle()

        val ready = vm.state.value as HomeUiState.Ready
        assertEquals(null, ready.store)
        assertTrue(ready.rails.isNotEmpty())
    }

    @Test
    fun `everything failing yields an error state`() = runTest {
        coEvery { storefront.storeProfile() } throws ApiException(ApiException.Kind.NETWORK, "yok")
        coEvery { storefront.announcements() } returns emptyList()
        coEvery { catalog.products(any()) } throws ApiException(ApiException.Kind.NETWORK, "yok")

        val vm = HomeViewModel(storefront, catalog)
        advanceUntilIdle()

        assertTrue(vm.state.value is HomeUiState.Error)
    }
}
