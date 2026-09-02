package com.erenlermarket.app.ui.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.session.CartStore
import com.erenlermarket.app.data.session.SessionManager
import com.erenlermarket.app.data.session.SessionState
import com.erenlermarket.app.domain.model.CartItem
import com.erenlermarket.app.domain.model.subtotal
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.SharingStarted
import java.math.BigDecimal
import javax.inject.Inject

data class CartUiState(
    val items: List<CartItem> = emptyList(),
    val subtotal: BigDecimal = BigDecimal.ZERO,
    val loading: Boolean = true,
    val signedIn: Boolean = false,
    val hasStockIssue: Boolean = false,
)

@HiltViewModel
class CartViewModel @Inject constructor(
    private val cart: CartStore,
    session: SessionManager,
) : ViewModel() {

    private val _loading = MutableStateFlow(true)

    val state: StateFlow<CartUiState> = combine(
        cart.items,
        session.state,
        _loading,
    ) { items, sessionState, loading ->
        CartUiState(
            items = items,
            subtotal = items.subtotal,
            loading = loading,
            signedIn = sessionState is SessionState.SignedIn,
            hasStockIssue = items.any { !it.isAvailable },
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), CartUiState())

    init { refresh() }

    fun refresh() {
        _loading.value = true
        viewModelScope.launch {
            cart.refresh()
            _loading.value = false
        }
    }

    fun increase(item: CartItem) {
        viewModelScope.launch { cart.setQuantity(item.product.id, item.quantity + 1) }
    }

    fun decrease(item: CartItem) {
        viewModelScope.launch { cart.setQuantity(item.product.id, item.quantity - 1) }
    }

    fun remove(item: CartItem) {
        viewModelScope.launch { cart.remove(item.product.id) }
    }
}
