package com.erenlermarket.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.Announcement
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.model.ProductQuery
import com.erenlermarket.app.domain.model.StoreProfile
import com.erenlermarket.app.domain.repository.CatalogRepository
import com.erenlermarket.app.domain.repository.StorefrontRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeRail(
    val id: String,
    val title: String,
    val products: List<Product>,
    val onlyDiscounted: Boolean = false,
    val onlyNew: Boolean = false,
)

sealed interface HomeUiState {
    data object Loading : HomeUiState
    data class Ready(
        val store: StoreProfile?,
        val announcements: List<Announcement>,
        val rails: List<HomeRail>,
    ) : HomeUiState
    data class Error(val message: String) : HomeUiState
}

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val storefront: StorefrontRepository,
    private val catalog: CatalogRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<HomeUiState>(HomeUiState.Loading)
    val state: StateFlow<HomeUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.value = HomeUiState.Loading
        viewModelScope.launch {
            try {
                val store = async { runCatching { storefront.storeProfile() }.getOrNull() }
                val announcements = async { runCatching { storefront.announcements() }.getOrDefault(emptyList()) }
                val discounted = async { products(ProductQuery(pageSize = 10, onlyDiscounted = true)) }
                val newArrivals = async { products(ProductQuery(pageSize = 10, onlyNew = true)) }
                val latest = async { products(ProductQuery(pageSize = 10)) }

                val rails = buildList {
                    discounted.await().takeIf { it.isNotEmpty() }?.let {
                        add(HomeRail("discounted", "İndirimdekiler", it, onlyDiscounted = true))
                    }
                    newArrivals.await().takeIf { it.isNotEmpty() }?.let {
                        add(HomeRail("new", "Yeni Gelenler", it, onlyNew = true))
                    }
                    latest.await().takeIf { it.isNotEmpty() }?.let {
                        add(HomeRail("latest", "Tüm Ürünler", it))
                    }
                }

                val storeValue = store.await()
                _state.value = if (storeValue == null && rails.isEmpty()) {
                    HomeUiState.Error("İçerik yüklenemedi. Bağlantını kontrol et.")
                } else {
                    HomeUiState.Ready(storeValue, announcements.await(), rails)
                }
            } catch (error: ApiException) {
                _state.value = HomeUiState.Error(error.message)
            }
        }
    }

    private suspend fun products(query: ProductQuery): List<Product> =
        runCatching { catalog.products(query).items }.getOrDefault(emptyList())
}
