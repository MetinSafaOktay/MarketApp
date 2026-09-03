package com.erenlermarket.app.ui.admin

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.AdminConversation
import com.erenlermarket.app.domain.repository.AdminRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AdminMessagesUiState(
    val conversations: List<AdminConversation> = emptyList(),
    val loading: Boolean = true,
    val error: String? = null,
)

@HiltViewModel
class AdminMessagesViewModel @Inject constructor(
    private val repository: AdminRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(AdminMessagesUiState())
    val state: StateFlow<AdminMessagesUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.update { it.copy(loading = true, error = null) }
        fetch(showLoading = true)
    }

    fun refresh() = fetch(showLoading = false)

    private fun fetch(showLoading: Boolean) {
        viewModelScope.launch {
            try {
                _state.update { it.copy(loading = false, conversations = repository.conversations(), error = null) }
            } catch (e: ApiException) {
                _state.update {
                    it.copy(loading = false, error = if (showLoading) e.message else it.error)
                }
            }
        }
    }
}
