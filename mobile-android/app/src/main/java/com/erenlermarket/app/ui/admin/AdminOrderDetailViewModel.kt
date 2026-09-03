package com.erenlermarket.app.ui.admin

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.OrderStatus
import com.erenlermarket.app.domain.repository.AdminRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AdminOrderDetailUiState(
    val order: Order? = null,
    val loading: Boolean = true,
    val updating: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class AdminOrderDetailViewModel @Inject constructor(
    private val repository: AdminRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val orderId: String = checkNotNull(savedStateHandle["orderId"])

    private val _state = MutableStateFlow(AdminOrderDetailUiState())
    val state: StateFlow<AdminOrderDetailUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.update { it.copy(loading = true, error = null) }
        viewModelScope.launch {
            try {
                _state.update { it.copy(loading = false, order = repository.order(orderId)) }
            } catch (e: ApiException) {
                _state.update { it.copy(loading = false, error = e.message) }
            }
        }
    }

    fun updateStatus(status: OrderStatus, note: String?) {
        if (_state.value.updating) return
        _state.update { it.copy(updating = true, error = null) }
        viewModelScope.launch {
            try {
                val updated = repository.updateOrderStatus(orderId, status, note)
                _state.update { it.copy(updating = false, order = updated) }
            } catch (e: ApiException) {
                _state.update { it.copy(updating = false, error = e.message) }
            }
        }
    }
}
