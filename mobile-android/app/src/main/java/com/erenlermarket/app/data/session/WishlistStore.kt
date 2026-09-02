package com.erenlermarket.app.data.session

import com.erenlermarket.app.di.AppScope
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.repository.WishlistRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import javax.inject.Inject
import javax.inject.Singleton

/** İstek listesi durumu. Oturum kapanınca temizlenir. */
@Singleton
class WishlistStore @Inject constructor(
    private val repository: WishlistRepository,
    session: SessionManager,
    @AppScope private val scope: CoroutineScope,
) {

    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products: StateFlow<List<Product>> = _products.asStateFlow()

    val ids: StateFlow<Set<String>> = _products
        .map { list -> list.mapTo(HashSet()) { it.id } }
        .stateIn(scope, SharingStarted.Eagerly, emptySet())

    private val _signedIn = MutableStateFlow(false)
    val signedIn: StateFlow<Boolean> = _signedIn.asStateFlow()

    private val mutex = Mutex()

    init {
        scope.launch {
            session.state.collect { state ->
                _signedIn.value = state is SessionState.SignedIn
                if (state is SessionState.SignedIn) refresh() else _products.value = emptyList()
            }
        }
    }

    suspend fun refresh() {
        runCatching { repository.wishlist() }.onSuccess { _products.value = it }
    }

    suspend fun toggle(productId: String) = mutex.withLock {
        val wasOn = _products.value.any { it.id == productId }
        if (wasOn) {
            _products.value = _products.value.filterNot { it.id == productId }
            runCatching { repository.remove(productId) }
        } else {
            runCatching { repository.add(productId) }
        }
        refresh()
    }
}
