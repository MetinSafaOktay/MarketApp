package com.erenlermarket.app.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.local.ThemeController
import com.erenlermarket.app.data.local.ThemeMode
import com.erenlermarket.app.data.session.SessionManager
import com.erenlermarket.app.domain.model.SettingsUpdate
import com.erenlermarket.app.domain.repository.SettingsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SettingsUiState(
    val loading: Boolean = true,
    val pushEnabled: Boolean = true,
    val orderEnabled: Boolean = true,
    val savingNotifications: Boolean = false,
    val deleting: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsRepository: SettingsRepository,
    private val themeController: ThemeController,
    private val session: SessionManager,
) : ViewModel() {

    private val _state = MutableStateFlow(SettingsUiState())
    val state: StateFlow<SettingsUiState> = _state.asStateFlow()

    val themeMode: StateFlow<ThemeMode> = themeController.mode

    init { load() }

    fun load() {
        _state.update { it.copy(loading = true, error = null) }
        viewModelScope.launch {
            runCatching { settingsRepository.settings() }
                .onSuccess { settings ->
                    _state.update {
                        it.copy(
                            loading = false,
                            pushEnabled = settings.pushNotificationsEnabled,
                            orderEnabled = settings.orderNotificationsEnabled,
                        )
                    }
                }
                .onFailure { _state.update { it.copy(loading = false) } }
        }
    }

    fun setThemeMode(mode: ThemeMode) = themeController.set(mode)

    fun setPushEnabled(enabled: Boolean) = updateNotifications(
        SettingsUpdate(pushNotificationsEnabled = enabled),
    ) { it.copy(pushEnabled = enabled) }

    fun setOrderEnabled(enabled: Boolean) = updateNotifications(
        SettingsUpdate(orderNotificationsEnabled = enabled),
    ) { it.copy(orderEnabled = enabled) }

    private fun updateNotifications(
        update: SettingsUpdate,
        optimistic: (SettingsUiState) -> SettingsUiState,
    ) {
        _state.update { optimistic(it).copy(savingNotifications = true) }
        viewModelScope.launch {
            runCatching { settingsRepository.update(update) }
                .onSuccess { settings ->
                    _state.update {
                        it.copy(
                            savingNotifications = false,
                            pushEnabled = settings.pushNotificationsEnabled,
                            orderEnabled = settings.orderNotificationsEnabled,
                        )
                    }
                }
                .onFailure { _state.update { it.copy(savingNotifications = false) } }
        }
    }

    fun deleteAccount(onDone: () -> Unit) {
        if (_state.value.deleting) return
        _state.update { it.copy(deleting = true, error = null) }
        viewModelScope.launch {
            try {
                session.deleteAccount()
                onDone()
            } catch (error: Exception) {
                _state.update { it.copy(deleting = false, error = "Hesap silinemedi") }
            }
        }
    }
}
