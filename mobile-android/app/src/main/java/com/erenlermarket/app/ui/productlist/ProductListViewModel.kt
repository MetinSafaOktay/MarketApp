package com.erenlermarket.app.ui.productlist

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.model.ProductQuery
import com.erenlermarket.app.domain.model.ProductSort
import com.erenlermarket.app.domain.repository.CatalogRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class ListPhase { Loading, Loaded, Empty, Error }

data class ProductListUiState(
    val title: String = "Ürünler",
    val products: List<Product> = emptyList(),
    val query: ProductQuery = ProductQuery(),
    val totalPages: Int = 1,
    val phase: ListPhase = ListPhase.Loading,
    val loadingMore: Boolean = false,
    val showControls: Boolean = false,
    val search: String = "",
) {
    val canLoadMore: Boolean get() = query.page < totalPages
}

@HiltViewModel
class ProductListViewModel @Inject constructor(
    private val catalog: CatalogRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val _state = MutableStateFlow(initialState(savedStateHandle))
    val state: StateFlow<ProductListUiState> = _state.asStateFlow()

    private var searchJob: Job? = null

    init { reload() }

    fun reload() {
        _state.update {
            it.copy(
                query = it.query.copy(page = 1),
                phase = if (it.products.isEmpty()) ListPhase.Loading else it.phase,
            )
        }
        viewModelScope.launch {
            try {
                val page = catalog.products(_state.value.query.copy(page = 1))
                _state.update {
                    it.copy(
                        products = page.items,
                        totalPages = page.totalPages,
                        phase = if (page.items.isEmpty()) ListPhase.Empty else ListPhase.Loaded,
                    )
                }
            } catch (_: ApiException) {
                _state.update {
                    if (it.products.isEmpty()) it.copy(phase = ListPhase.Error) else it
                }
            }
        }
    }

    fun loadMoreIfNeeded(index: Int) {
        val current = _state.value
        if (current.loadingMore || !current.canLoadMore || current.phase != ListPhase.Loaded ||
            index < current.products.size - 4
        ) {
            return
        }
        val nextPage = current.query.page + 1
        _state.update { it.copy(loadingMore = true, query = it.query.copy(page = nextPage)) }
        viewModelScope.launch {
            try {
                val page = catalog.products(_state.value.query)
                val known = current.products.mapTo(HashSet()) { it.id }
                _state.update {
                    it.copy(
                        products = it.products + page.items.filter { p -> p.id !in known },
                        totalPages = page.totalPages,
                        loadingMore = false,
                    )
                }
            } catch (_: ApiException) {
                _state.update {
                    it.copy(loadingMore = false, query = it.query.copy(page = nextPage - 1))
                }
            }
        }
    }

    fun onSearchChange(value: String) {
        _state.update { it.copy(search = value) }
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(350)
            val normalized = value.trim().ifBlank { null }
            if (normalized != _state.value.query.search) {
                _state.update { it.copy(query = it.query.copy(search = normalized, page = 1)) }
                reload()
            }
        }
    }

    fun applyFilters(sort: ProductSort, onlyDiscounted: Boolean, onlyNew: Boolean, inStock: Boolean) {
        _state.update {
            it.copy(
                query = it.query.copy(
                    sort = sort,
                    onlyDiscounted = onlyDiscounted,
                    onlyNew = onlyNew,
                    inStock = inStock,
                    page = 1,
                ),
            )
        }
        reload()
    }

    private fun initialState(handle: SavedStateHandle): ProductListUiState {
        val categoryId: String? = handle["categoryId"]
        val onlyDiscounted: Boolean = handle["onlyDiscounted"] ?: false
        val onlyNew: Boolean = handle["onlyNew"] ?: false
        return ProductListUiState(
            title = handle["title"] ?: "Ürünler",
            showControls = categoryId == null && !onlyDiscounted && !onlyNew,
            query = ProductQuery(
                categoryId = categoryId,
                onlyDiscounted = onlyDiscounted,
                onlyNew = onlyNew,
            ),
        )
    }
}
