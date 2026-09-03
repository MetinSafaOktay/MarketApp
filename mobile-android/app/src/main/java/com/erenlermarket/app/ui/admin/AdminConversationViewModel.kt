package com.erenlermarket.app.ui.admin

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.Message
import com.erenlermarket.app.domain.repository.AdminRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Admin bir müşteriyle konuşma ekranı — 5 sn'de bir poll (müşteri ekranıyla aynı). */
const val ADMIN_CONVERSATION_POLL_MS = 5_000L

data class AdminConversationUiState(
    val customerName: String = "",
    val messages: List<Message> = emptyList(),
    val draft: String = "",
    val loading: Boolean = true,
    val sending: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class AdminConversationViewModel @Inject constructor(
    private val repository: AdminRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val conversationId: String = checkNotNull(savedStateHandle["conversationId"])
    private val name: String = savedStateHandle.get<String>("name").orEmpty()

    private val _state = MutableStateFlow(AdminConversationUiState(customerName = name))
    val state: StateFlow<AdminConversationUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.update { it.copy(loading = true, error = null) }
        viewModelScope.launch {
            try {
                _state.update {
                    it.copy(loading = false, messages = repository.conversationMessages(conversationId))
                }
            } catch (e: ApiException) {
                _state.update { it.copy(loading = false, error = e.message) }
            }
        }
    }

    suspend fun poll() {
        runCatching { repository.conversationMessages(conversationId) }
            .onSuccess { msgs -> _state.update { it.copy(messages = msgs) } }
    }

    fun onDraftChange(value: String) = _state.update { it.copy(draft = value) }

    fun send() {
        val content = _state.value.draft.trim()
        if (content.isEmpty() || _state.value.sending) return
        _state.update { it.copy(sending = true, error = null) }
        viewModelScope.launch {
            try {
                val sent = repository.reply(conversationId, content)
                _state.update { it.copy(sending = false, draft = "", messages = it.messages + sent) }
            } catch (e: ApiException) {
                _state.update { it.copy(sending = false, error = e.message) }
            }
        }
    }
}
