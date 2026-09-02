package com.erenlermarket.app.ui.productdetail

import androidx.lifecycle.SavedStateHandle
import com.erenlermarket.app.data.local.LocalCatalogStore
import com.erenlermarket.app.data.session.CartStore
import com.erenlermarket.app.domain.repository.CatalogRepository
import com.erenlermarket.app.util.MainDispatcherRule
import com.erenlermarket.app.util.testProduct
import io.mockk.Runs
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.just
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class ProductDetailViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val catalog = mockk<CatalogRepository>()
    private val cart = mockk<CartStore>(relaxed = true)
    private val local = mockk<LocalCatalogStore>(relaxed = true)

    private fun viewModel() = ProductDetailViewModel(
        catalog,
        cart,
        local,
        SavedStateHandle(mapOf("productId" to "p1", "name" to "Çay")),
    )

    @Test
    fun `loads the product, records the view and fetches similar`() = runTest {
        val product = testProduct("p1")
        coEvery { catalog.product("p1") } returns product
        coEvery { local.recordView(product) } just Runs
        coEvery { catalog.similarProducts("p1") } returns listOf(testProduct("p2"))

        val vm = viewModel()
        advanceUntilIdle()

        val ready = vm.state.value as ProductDetailUiState.Ready
        assertEquals("p1", ready.product.id)
        assertEquals(listOf("p2"), ready.similar.map { it.id })
        coVerify { local.recordView(product) }
    }

    @Test
    fun `add to cart delegates to the cart store`() = runTest {
        val product = testProduct("p1")
        coEvery { catalog.product("p1") } returns product
        coEvery { catalog.similarProducts(any()) } returns emptyList()

        val vm = viewModel()
        advanceUntilIdle()
        vm.addToCart()
        advanceUntilIdle()

        coVerify { cart.add(product) }
    }
}
