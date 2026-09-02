package com.erenlermarket.app.ui.productdetail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.local.LocalCatalogStore
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.data.session.CartStore
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.repository.CatalogRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface ProductDetailUiState {
    data object Loading : ProductDetailUiState
    data class Ready(val product: Product, val similar: List<Product>) : ProductDetailUiState
    data class Error(val message: String) : ProductDetailUiState
}

@HiltViewModel
class ProductDetailViewModel @Inject constructor(
    private val catalog: CatalogRepository,
    private val cart: CartStore,
    private val localCatalog: LocalCatalogStore,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val productId: String = checkNotNull(savedStateHandle["productId"])
    val fallbackName: String = savedStateHandle["name"] ?: ""

    private val _state = MutableStateFlow<ProductDetailUiState>(ProductDetailUiState.Loading)
    val state: StateFlow<ProductDetailUiState> = _state.asStateFlow()

    private val _addedToCart = MutableStateFlow(false)
    val addedToCart: StateFlow<Boolean> = _addedToCart.asStateFlow()

    init { load() }

    fun addToCart() {
        val product = (_state.value as? ProductDetailUiState.Ready)?.product ?: return
        viewModelScope.launch {
            cart.add(product)
            _addedToCart.value = true
        }
    }

    fun consumeAddedToCart() {
        _addedToCart.value = false
    }

    fun load() {
        _state.value = ProductDetailUiState.Loading
        viewModelScope.launch {
            try {
                val product = catalog.product(productId)
                _state.value = ProductDetailUiState.Ready(product, emptyList())
                runCatching { localCatalog.recordView(product) }
                val similar = runCatching { catalog.similarProducts(productId) }.getOrDefault(emptyList())
                _state.update {
                    if (it is ProductDetailUiState.Ready) it.copy(similar = similar) else it
                }
            } catch (error: ApiException) {
                _state.value = ProductDetailUiState.Error(error.message)
            }
        }
    }
}
