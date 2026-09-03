package com.erenlermarket.app.ui.admin

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.LowStockProduct
import com.erenlermarket.app.domain.repository.AdminRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface AdminLowStockUiState {
    data object Loading : AdminLowStockUiState
    data class Ready(val products: List<LowStockProduct>) : AdminLowStockUiState
    data class Error(val message: String) : AdminLowStockUiState
}

@HiltViewModel
class AdminLowStockViewModel @Inject constructor(
    private val repository: AdminRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<AdminLowStockUiState>(AdminLowStockUiState.Loading)
    val state: StateFlow<AdminLowStockUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.value = AdminLowStockUiState.Loading
        viewModelScope.launch {
            _state.value = try {
                AdminLowStockUiState.Ready(repository.lowStock())
            } catch (e: ApiException) {
                AdminLowStockUiState.Error(e.message)
            }
        }
    }
}
