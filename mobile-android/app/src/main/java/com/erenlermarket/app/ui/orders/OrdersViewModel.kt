package com.erenlermarket.app.ui.orders

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.repository.OrderRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface OrdersUiState {
    data object Loading : OrdersUiState
    data class Ready(val orders: List<Order>) : OrdersUiState
    data class Error(val message: String) : OrdersUiState
}

@HiltViewModel
class OrdersViewModel @Inject constructor(
    private val repository: OrderRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<OrdersUiState>(OrdersUiState.Loading)
    val state: StateFlow<OrdersUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.value = OrdersUiState.Loading
        viewModelScope.launch {
            _state.value = try {
                OrdersUiState.Ready(repository.orders())
            } catch (error: ApiException) {
                OrdersUiState.Error(error.message)
            }
        }
    }
}
