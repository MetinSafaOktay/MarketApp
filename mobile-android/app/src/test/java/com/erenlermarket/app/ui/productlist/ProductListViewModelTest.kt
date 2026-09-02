package com.erenlermarket.app.ui.productlist

import androidx.lifecycle.SavedStateHandle
import com.erenlermarket.app.domain.model.Page
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.model.ProductQuery
import com.erenlermarket.app.domain.repository.CatalogRepository
import com.erenlermarket.app.util.MainDispatcherRule
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.math.BigDecimal

@OptIn(ExperimentalCoroutinesApi::class)
class ProductListViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

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

    private fun page(items: List<Product>, page: Int, totalPages: Int) =
        Page(items = items, page = page, pageSize = 20, total = totalPages * 20, totalPages = totalPages)

    private fun viewModel(handle: SavedStateHandle = SavedStateHandle()) =
        ProductListViewModel(catalog, handle)

    @Test
    fun `initial state reads nav args and hides controls for a category`() {
        coEvery { catalog.products(any()) } returns page(emptyList(), 1, 1)

        val state = viewModel(
            SavedStateHandle(mapOf("title" to "Meyve", "categoryId" to "c1")),
        ).state.value

        assertEquals("Meyve", state.title)
        assertEquals("c1", state.query.categoryId)
        assertFalse(state.showControls)
    }

    @Test
    fun `reload loads the first page`() = runTest {
        coEvery { catalog.products(any()) } returns page(listOf(product("1"), product("2")), 1, 2)

        val vm = viewModel()
        advanceUntilIdle()

        assertEquals(2, vm.state.value.products.size)
        assertEquals(ListPhase.Loaded, vm.state.value.phase)
        assertTrue(vm.state.value.canLoadMore)
    }

    @Test
    fun `empty first page yields empty phase`() = runTest {
        coEvery { catalog.products(any()) } returns page(emptyList(), 1, 1)

        val vm = viewModel()
        advanceUntilIdle()

        assertEquals(ListPhase.Empty, vm.state.value.phase)
    }

    @Test
    fun `loadMore appends the next page and drops duplicates`() = runTest {
        coEvery { catalog.products(match { it.page == 1 }) } returns
            page(listOf(product("1"), product("2"), product("3")), 1, 2)
        coEvery { catalog.products(match { it.page == 2 }) } returns
            page(listOf(product("3"), product("4")), 2, 2)

        val vm = viewModel()
        advanceUntilIdle()

        vm.loadMoreIfNeeded(index = 2)
        advanceUntilIdle()

        assertEquals(listOf("1", "2", "3", "4"), vm.state.value.products.map { it.id })
        assertFalse(vm.state.value.loadingMore)
    }

    @Test
    fun `loadMore is a no-op when index is far from the end`() = runTest {
        coEvery { catalog.products(any()) } returns
            page(List(20) { product("p$it") }, 1, 5)

        val vm = viewModel()
        advanceUntilIdle()

        vm.loadMoreIfNeeded(index = 0)
        advanceUntilIdle()

        assertEquals(1, vm.state.value.query.page)
    }
}
