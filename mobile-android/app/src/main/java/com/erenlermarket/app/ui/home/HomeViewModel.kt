package com.erenlermarket.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.local.LocalCatalogStore
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.data.session.SessionManager
import com.erenlermarket.app.domain.model.Announcement
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.model.ProductQuery
import com.erenlermarket.app.domain.model.StoreProfile
import com.erenlermarket.app.domain.repository.CatalogRepository
import com.erenlermarket.app.domain.repository.OrderRepository
import com.erenlermarket.app.domain.repository.StorefrontRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

private const val RECENT_RAIL_ID = "recent"

data class HomeRail(
    val id: String,
    val title: String,
    val products: List<Product>,
    val onlyDiscounted: Boolean = false,
    val onlyNew: Boolean = false,
    val showSeeAll: Boolean = true,
)

private data class RailSpec(val id: String, val title: String, val onlyDiscounted: Boolean, val onlyNew: Boolean)

private val RAIL_SPECS = listOf(
    RailSpec("discounted", "İndirimdekiler", onlyDiscounted = true, onlyNew = false),
    RailSpec("new", "Yeni Gelenler", onlyDiscounted = false, onlyNew = true),
    RailSpec("latest", "Tüm Ürünler", onlyDiscounted = false, onlyNew = false),
)

sealed interface HomeUiState {
    data object Loading : HomeUiState
    data class Ready(
        val store: StoreProfile?,
        val announcements: List<Announcement>,
        val rails: List<HomeRail>,
        val isOffline: Boolean = false,
        /** Süren sipariş (varsa) — üstte takip kartı gösterilir. */
        val activeOrder: Order? = null,
    ) : HomeUiState
    data class Error(val message: String) : HomeUiState
}

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val storefront: StorefrontRepository,
    private val catalog: CatalogRepository,
    private val localCatalog: LocalCatalogStore,
    private val orders: OrderRepository,
    private val session: SessionManager,
) : ViewModel() {

    private val _base = MutableStateFlow<HomeUiState>(HomeUiState.Loading)

    /** Taban durum + canlı "son gezilenler" rafı birleştirilir. */
    val state: StateFlow<HomeUiState> = combine(
        _base,
        localCatalog.recentProducts,
    ) { base, recent ->
        if (base is HomeUiState.Ready) {
            base.copy(rails = withRecentRail(recent, base.rails))
        } else {
            base
        }
    }.stateIn(viewModelScope, SharingStarted.Eagerly, HomeUiState.Loading)

    init { load() }

    fun load() {
        _base.value = HomeUiState.Loading
        viewModelScope.launch {
            try {
                val store = async { runCatching { storefront.storeProfile() }.getOrNull() }
                val announcements =
                    async { runCatching { storefront.announcements() }.getOrDefault(emptyList()) }
                val railResults = RAIL_SPECS.map { spec ->
                    spec to async {
                        runCatching {
                            catalog.products(
                                ProductQuery(
                                    pageSize = 10,
                                    onlyDiscounted = spec.onlyDiscounted,
                                    onlyNew = spec.onlyNew,
                                ),
                            ).items
                        }.getOrDefault(emptyList())
                    }
                }

                val rails = railResults.mapNotNull { (spec, deferred) ->
                    val products = deferred.await()
                    if (products.isEmpty()) {
                        null
                    } else {
                        localCatalog.cacheRail(spec.id, products)
                        spec.toRail(products)
                    }
                }
                val storeValue = store.await()
                val activeOrder = async { fetchActiveOrder() }

                _base.value = if (storeValue == null && rails.isEmpty()) {
                    offlineOrError()
                } else {
                    HomeUiState.Ready(
                        storeValue,
                        announcements.await(),
                        rails,
                        activeOrder = activeOrder.await(),
                    )
                }
            } catch (error: ApiException) {
                _base.value = HomeUiState.Error(error.message)
            }
        }
    }

    /**
     * Ekrana geri dönünce süren siparişi sessizce tazele — durum değişince
     * ana ekrandaki takip kartı da güncellensin.
     */
    fun refreshActiveOrder() {
        if (_base.value !is HomeUiState.Ready) return
        viewModelScope.launch {
            val fresh = fetchActiveOrder()
            _base.update { current ->
                if (current is HomeUiState.Ready) current.copy(activeOrder = fresh) else current
            }
        }
    }

    /** En güncel süren sipariş (teslim/iptal değil). Oturum yoksa null. */
    private suspend fun fetchActiveOrder(): Order? {
        if (session.currentUser == null) return null
        return runCatching { orders.orders() }.getOrNull()
            ?.firstOrNull { it.status.isActive }
    }

    private suspend fun offlineOrError(): HomeUiState {
        val cachedRails = RAIL_SPECS.mapNotNull { spec ->
            localCatalog.cachedRail(spec.id).takeIf { it.isNotEmpty() }?.let { spec.toRail(it) }
        }
        return if (cachedRails.isEmpty() && localCatalog.recentProducts.value.isEmpty()) {
            HomeUiState.Error("İçerik yüklenemedi. Bağlantını kontrol et.")
        } else {
            HomeUiState.Ready(store = null, announcements = emptyList(), rails = cachedRails, isOffline = true)
        }
    }

    private fun withRecentRail(recent: List<Product>, rails: List<HomeRail>): List<HomeRail> =
        if (recent.isEmpty()) {
            rails
        } else {
            buildList {
                add(HomeRail(RECENT_RAIL_ID, "Son Gezdiklerin", recent, showSeeAll = false))
                addAll(rails)
            }
        }

    private fun RailSpec.toRail(products: List<Product>) = HomeRail(
        id = id,
        title = title,
        products = products,
        onlyDiscounted = onlyDiscounted,
        onlyNew = onlyNew,
    )
}
