package com.erenlermarket.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.data.session.SessionManager
import com.erenlermarket.app.domain.model.RegisterInput
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class AuthMode { LOGIN, REGISTER }

data class AuthUiState(
    val mode: AuthMode = AuthMode.LOGIN,
    val identifier: String = "",
    val password: String = "",
    val profileName: String = "",
    val firstName: String = "",
    val lastName: String = "",
    val submitting: Boolean = false,
    val error: String? = null,
) {
    private val identifierValid: Boolean
        get() = identifier.isNotBlank()

    private val passwordValid: Boolean
        get() = password.length >= if (mode == AuthMode.REGISTER) MIN_PASSWORD else 1

    val canSubmit: Boolean
        get() = !submitting && identifierValid && passwordValid && when (mode) {
            AuthMode.LOGIN -> true
            AuthMode.REGISTER ->
                identifier.contains('@') &&
                    profileName.isNotBlank() &&
                    firstName.isNotBlank() &&
                    lastName.isNotBlank()
        }

    companion object {
        const val MIN_PASSWORD = 8
    }
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val session: SessionManager,
) : ViewModel() {

    private val _state = MutableStateFlow(AuthUiState())
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    fun onIdentifierChange(value: String) = _state.update { it.copy(identifier = value, error = null) }
    fun onPasswordChange(value: String) = _state.update { it.copy(password = value, error = null) }
    fun onProfileNameChange(value: String) = _state.update { it.copy(profileName = value, error = null) }
    fun onFirstNameChange(value: String) = _state.update { it.copy(firstName = value, error = null) }
    fun onLastNameChange(value: String) = _state.update { it.copy(lastName = value, error = null) }

    fun toggleMode() = _state.update {
        val next = if (it.mode == AuthMode.LOGIN) AuthMode.REGISTER else AuthMode.LOGIN
        it.copy(mode = next, error = null)
    }

    fun submit(onSuccess: () -> Unit) {
        val current = _state.value
        if (!current.canSubmit) return
        _state.update { it.copy(submitting = true, error = null) }
        viewModelScope.launch {
            try {
                when (current.mode) {
                    AuthMode.LOGIN -> session.login(current.identifier, current.password)
                    AuthMode.REGISTER -> session.register(
                        RegisterInput(
                            email = current.identifier,
                            password = current.password,
                            profileName = current.profileName,
                            firstName = current.firstName,
                            lastName = current.lastName,
                        ),
                    )
                }
                _state.update { it.copy(submitting = false) }
                onSuccess()
            } catch (error: ApiException) {
                _state.update { it.copy(submitting = false, error = error.message) }
            }
        }
    }
}
