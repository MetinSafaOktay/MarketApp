package com.erenlermarket.app.ui.messages

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.Message
import com.erenlermarket.app.domain.repository.MessagingRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Ekran bunu bir döngüde çağırır (5 sn'de bir poll). */
const val MESSAGES_POLL_INTERVAL_MS = 5_000L

data class MessagesUiState(
    val messages: List<Message> = emptyList(),
    val loading: Boolean = true,
    val error: String? = null,
    val draft: String = "",
    val sending: Boolean = false,
)

@HiltViewModel
class MessagesViewModel @Inject constructor(
    private val repository: MessagingRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(MessagesUiState())
    val state: StateFlow<MessagesUiState> = _state.asStateFlow()

    init { load() }

    /** Poll: yükleme göstergesi olmadan sessizce tazeler. */
    suspend fun poll() {
        runCatching { repository.messages() }.onSuccess { messages ->
            _state.update { it.copy(messages = messages) }
        }
    }

    fun load() {
        _state.update { it.copy(loading = true, error = null) }
        viewModelScope.launch {
            try {
                _state.update { it.copy(loading = false, messages = repository.messages()) }
            } catch (error: ApiException) {
                _state.update { it.copy(loading = false, error = error.message) }
            }
        }
    }

    fun onDraftChange(value: String) = _state.update { it.copy(draft = value) }

    fun send() {
        val content = _state.value.draft.trim()
        if (content.isEmpty() || _state.value.sending) return
        _state.update { it.copy(sending = true) }
        viewModelScope.launch {
            try {
                val sent = repository.send(content)
                _state.update {
                    it.copy(sending = false, draft = "", messages = it.messages + sent)
                }
            } catch (error: ApiException) {
                _state.update { it.copy(sending = false, error = error.message) }
            }
        }
    }
}
