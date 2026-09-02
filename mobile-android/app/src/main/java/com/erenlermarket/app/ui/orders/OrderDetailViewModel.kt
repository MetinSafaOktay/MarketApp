package com.erenlermarket.app.ui.orders

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.repository.OrderRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OrderDetailUiState(
    val order: Order? = null,
    val loading: Boolean = true,
    val error: String? = null,
    val cancelling: Boolean = false,
)

@HiltViewModel
class OrderDetailViewModel @Inject constructor(
    private val repository: OrderRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val orderId: String = checkNotNull(savedStateHandle["orderId"])

    private val _state = MutableStateFlow(OrderDetailUiState())
    val state: StateFlow<OrderDetailUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.update { it.copy(loading = true, error = null) }
        viewModelScope.launch {
            try {
                _state.update { it.copy(loading = false, order = repository.order(orderId)) }
            } catch (error: ApiException) {
                _state.update { it.copy(loading = false, error = error.message) }
            }
        }
    }

    fun cancel() {
        if (_state.value.cancelling) return
        _state.update { it.copy(cancelling = true, error = null) }
        viewModelScope.launch {
            try {
                val updated = repository.cancel(orderId, null)
                _state.update { it.copy(cancelling = false, order = updated) }
            } catch (error: ApiException) {
                _state.update { it.copy(cancelling = false, error = error.message) }
            }
        }
    }
}
