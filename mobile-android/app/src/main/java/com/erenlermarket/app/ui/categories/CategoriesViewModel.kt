package com.erenlermarket.app.ui.categories

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.ProductCategory
import com.erenlermarket.app.domain.repository.CatalogRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface CategoriesUiState {
    data object Loading : CategoriesUiState
    data class Ready(val categories: List<ProductCategory>) : CategoriesUiState
    data class Error(val message: String) : CategoriesUiState
}

@HiltViewModel
class CategoriesViewModel @Inject constructor(
    private val catalog: CatalogRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<CategoriesUiState>(CategoriesUiState.Loading)
    val state: StateFlow<CategoriesUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.value = CategoriesUiState.Loading
        viewModelScope.launch {
            _state.value = try {
                CategoriesUiState.Ready(catalog.categories())
            } catch (error: ApiException) {
                CategoriesUiState.Error(error.message)
            }
        }
    }
}
