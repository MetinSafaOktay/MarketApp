package com.erenlermarket.app.ui.home

import com.erenlermarket.app.data.local.LocalCatalogStore
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.Announcement
import com.erenlermarket.app.domain.model.Page
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.repository.CatalogRepository
import com.erenlermarket.app.domain.repository.StorefrontRepository
import com.erenlermarket.app.util.MainDispatcherRule
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
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
    private val local = mockk<LocalCatalogStore>(relaxed = true)
    private val recent = MutableStateFlow<List<Product>>(emptyList())

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

    private val store = com.erenlermarket.app.domain.model.StoreProfile(
        name = "Erenler Market",
        city = "Afyonkarahisar",
        tagline = null,
        description = null,
        phone = null,
        address = null,
        logoUrl = null,
        coverImageUrl = null,
    )

    private fun viewModel(): HomeViewModel {
        every { local.recentProducts } returns recent
        return HomeViewModel(storefront, catalog, local)
    }

    @Test
    fun `builds only the rails that have products`() = runTest {
        coEvery { storefront.storeProfile() } returns store
        coEvery { storefront.announcements() } returns listOf(Announcement("a1", "Duyuru", "içerik", null))
        coEvery { catalog.products(match { it.onlyDiscounted }) } returns page(listOf(product("d1")))
        coEvery { catalog.products(match { it.onlyNew }) } returns page(emptyList())
        coEvery { catalog.products(match { !it.onlyDiscounted && !it.onlyNew }) } returns
            page(listOf(product("l1"), product("l2")))

        val vm = viewModel()
        advanceUntilIdle()

        val ready = vm.state.value as HomeUiState.Ready
        assertEquals(listOf("discounted", "latest"), ready.rails.map { it.id })
        assertEquals(1, ready.announcements.size)
    }

    @Test
    fun `recently viewed products appear as the first rail`() = runTest {
        coEvery { storefront.storeProfile() } returns store
        coEvery { storefront.announcements() } returns emptyList()
        coEvery { catalog.products(any()) } returns page(listOf(product("l1")))
        recent.value = listOf(product("r1"))

        val vm = viewModel()
        advanceUntilIdle()

        val ready = vm.state.value as HomeUiState.Ready
        assertEquals("recent", ready.rails.first().id)
        assertEquals(false, ready.rails.first().showSeeAll)
    }

    @Test
    fun `everything failing falls back to the cached rails and flags offline`() = runTest {
        coEvery { storefront.storeProfile() } throws ApiException(ApiException.Kind.NETWORK, "yok")
        coEvery { storefront.announcements() } returns emptyList()
        coEvery { catalog.products(any()) } throws ApiException(ApiException.Kind.NETWORK, "yok")
        coEvery { local.cachedRail("discounted") } returns listOf(product("c1"))
        coEvery { local.cachedRail("new") } returns emptyList()
        coEvery { local.cachedRail("latest") } returns emptyList()

        val vm = viewModel()
        advanceUntilIdle()

        val ready = vm.state.value as HomeUiState.Ready
        assertTrue(ready.isOffline)
        assertEquals(listOf("discounted"), ready.rails.map { it.id })
    }

    @Test
    fun `everything failing with an empty cache is an error`() = runTest {
        coEvery { storefront.storeProfile() } throws ApiException(ApiException.Kind.NETWORK, "yok")
        coEvery { storefront.announcements() } returns emptyList()
        coEvery { catalog.products(any()) } throws ApiException(ApiException.Kind.NETWORK, "yok")
        coEvery { local.cachedRail(any()) } returns emptyList()

        val vm = viewModel()
        advanceUntilIdle()

        assertTrue(vm.state.value is HomeUiState.Error)
    }
}
