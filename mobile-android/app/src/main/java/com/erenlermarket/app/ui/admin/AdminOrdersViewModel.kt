package com.erenlermarket.app.ui.admin

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

/** null = tümü; aksi hâlde tek bir duruma göre süzülür. */
enum class OrderFilter(val label: String, val status: OrderStatus?) {
    ACTIVE("Aktif", null), // özel: teslim/iptal hariç (istemci tarafı süzer)
    PREPARING("Hazırlanıyor", OrderStatus.PREPARING),
    OUT_FOR_DELIVERY("Yolda", OrderStatus.OUT_FOR_DELIVERY),
    DELIVERED("Teslim", OrderStatus.DELIVERED),
    ALL("Tümü", null),
}

data class AdminOrdersUiState(
    val orders: List<Order> = emptyList(),
    val filter: OrderFilter = OrderFilter.ACTIVE,
    val loading: Boolean = true,
    val error: String? = null,
)

@HiltViewModel
class AdminOrdersViewModel @Inject constructor(
    private val repository: AdminRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(AdminOrdersUiState())
    val state: StateFlow<AdminOrdersUiState> = _state.asStateFlow()

    init { load(OrderFilter.ACTIVE) }

    fun load(filter: OrderFilter = _state.value.filter) {
        _state.update { it.copy(loading = true, error = null, filter = filter) }
        fetch(filter, showLoading = true)
    }

    /** Ekrana dönünce sessiz tazele. */
    fun refresh() = fetch(_state.value.filter, showLoading = false)

    private fun fetch(filter: OrderFilter, showLoading: Boolean) {
        viewModelScope.launch {
            try {
                val rows = repository.orders(filter.status)
                    .let { list ->
                        when (filter) {
                            OrderFilter.ACTIVE -> list.filter { it.status.isActive }
                            else -> list
                        }
                    }
                _state.update { it.copy(loading = false, orders = rows, error = null) }
            } catch (e: ApiException) {
                _state.update {
                    it.copy(loading = false, error = if (showLoading) e.message else it.error)
                }
            }
        }
    }
}
