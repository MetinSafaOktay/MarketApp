package com.erenlermarket.app.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.data.session.SessionManager
import com.erenlermarket.app.data.session.SessionState
import com.erenlermarket.app.domain.model.ProfileUpdate
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class EditProfileUiState(
    val profileName: String = "",
    val bio: String = "",
    val saving: Boolean = false,
    val error: String? = null,
    val initialised: Boolean = false,
) {
    val canSave: Boolean get() = profileName.isNotBlank() && !saving
}

@HiltViewModel
class EditProfileViewModel @Inject constructor(
    private val session: SessionManager,
) : ViewModel() {

    private val _state = MutableStateFlow(EditProfileUiState())
    val state: StateFlow<EditProfileUiState> = _state.asStateFlow()

    init {
        (session.state.value as? SessionState.SignedIn)?.user?.let { user ->
            _state.update {
                it.copy(profileName = user.profileName, bio = user.bio.orEmpty(), initialised = true)
            }
        }
    }

    fun onProfileNameChange(value: String) = _state.update { it.copy(profileName = value, error = null) }
    fun onBioChange(value: String) = _state.update { it.copy(bio = value, error = null) }

    fun save(onSaved: () -> Unit) {
        val current = _state.value
        if (!current.canSave) return
        _state.update { it.copy(saving = true, error = null) }
        viewModelScope.launch {
            try {
                session.updateProfile(
                    ProfileUpdate(profileName = current.profileName, bio = current.bio),
                )
                onSaved()
            } catch (error: ApiException) {
                _state.update { it.copy(saving = false, error = error.message) }
            }
        }
    }
}
