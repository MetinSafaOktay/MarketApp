package com.erenlermarket.app.ui.navigation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.session.SessionManager
import com.erenlermarket.app.data.session.SessionState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RootViewModel @Inject constructor(
    session: SessionManager,
) : ViewModel() {

    val sessionState: StateFlow<SessionState> = session.state

    init {
        viewModelScope.launch { session.restore() }
    }
}
