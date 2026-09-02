package com.erenlermarket.app.data.session

import com.erenlermarket.app.di.AppScope
import com.erenlermarket.app.domain.model.CartItem
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.model.totalQuantity
import com.erenlermarket.app.domain.repository.CartRepository
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

/**
 * Sepetin tek doğruluk kaynağı. Sunucuda tutulur; burada önbelleğe alınıp
 * iyimser güncellenir. Oturum kapanınca temizlenir.
 */
@Singleton
class CartStore @Inject constructor(
    private val repository: CartRepository,
    session: SessionManager,
    @AppScope private val scope: CoroutineScope,
) {

    private val _items = MutableStateFlow<List<CartItem>>(emptyList())
    val items: StateFlow<List<CartItem>> = _items.asStateFlow()

    val count: StateFlow<Int> = _items
        .map { it.totalQuantity }
        .stateIn(scope, SharingStarted.Eagerly, 0)

    private val mutex = Mutex()

    init {
        scope.launch {
            session.state.collect { state ->
                if (state is SessionState.SignedIn) refresh() else _items.value = emptyList()
            }
        }
    }

    suspend fun refresh() {
        runCatching { repository.cart() }.onSuccess { _items.value = it }
    }

    suspend fun add(product: Product, quantity: Int = 1) = mutex.withLock {
        val existing = _items.value.firstOrNull { it.product.id == product.id }
        _items.value = if (existing != null) {
            _items.value.map {
                if (it.product.id == product.id) it.copy(quantity = it.quantity + quantity) else it
            }
        } else {
            _items.value + CartItem(id = product.id, product = product, quantity = quantity)
        }
        runCatching { repository.addItem(product.id, quantity) }
        refresh()
    }

    suspend fun setQuantity(productId: String, quantity: Int) = mutex.withLock {
        if (quantity <= 0) {
            removeInternal(productId)
            return@withLock
        }
        _items.value = _items.value.map {
            if (it.product.id == productId) it.copy(quantity = quantity) else it
        }
        runCatching { repository.updateQuantity(productId, quantity) }
        refresh()
    }

    suspend fun remove(productId: String) = mutex.withLock { removeInternal(productId) }

    suspend fun clear() = mutex.withLock {
        _items.value = emptyList()
        runCatching { repository.clear() }
    }

    private suspend fun removeInternal(productId: String) {
        _items.value = _items.value.filterNot { it.product.id == productId }
        runCatching { repository.removeItem(productId) }
        refresh()
    }
}
