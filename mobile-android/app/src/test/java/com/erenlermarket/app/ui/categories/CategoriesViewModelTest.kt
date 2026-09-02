package com.erenlermarket.app.ui.categories

import com.erenlermarket.app.data.local.LocalCatalogStore
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.ProductCategory
import com.erenlermarket.app.domain.repository.CatalogRepository
import com.erenlermarket.app.util.MainDispatcherRule
import io.mockk.Runs
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.just
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class CategoriesViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val catalog = mockk<CatalogRepository>()
    private val local = mockk<LocalCatalogStore>(relaxed = true)

    private val categories = listOf(ProductCategory("c1", "Meyve", null, 0))

    @Test
    fun `success caches the categories`() = runTest {
        coEvery { catalog.categories() } returns categories
        coEvery { local.cacheCategories(categories) } just Runs

        val vm = CategoriesViewModel(catalog, local)
        advanceUntilIdle()

        val state = vm.state.value as CategoriesUiState.Ready
        assertEquals(1, state.categories.size)
        assertTrue(!state.isOffline)
        coVerify { local.cacheCategories(categories) }
    }

    @Test
    fun `failure falls back to cache and flags offline`() = runTest {
        coEvery { catalog.categories() } throws ApiException(ApiException.Kind.NETWORK, "yok")
        coEvery { local.cachedCategories() } returns categories

        val vm = CategoriesViewModel(catalog, local)
        advanceUntilIdle()

        val state = vm.state.value as CategoriesUiState.Ready
        assertTrue(state.isOffline)
        assertEquals("c1", state.categories.single().id)
    }

    @Test
    fun `failure with an empty cache is an error`() = runTest {
        coEvery { catalog.categories() } throws ApiException(ApiException.Kind.NETWORK, "yok")
        coEvery { local.cachedCategories() } returns emptyList()

        val vm = CategoriesViewModel(catalog, local)
        advanceUntilIdle()

        assertTrue(vm.state.value is CategoriesUiState.Error)
    }
}
