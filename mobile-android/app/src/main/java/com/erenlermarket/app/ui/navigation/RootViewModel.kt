package com.erenlermarket.app.ui.navigation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.session.NotificationsStore
import com.erenlermarket.app.data.session.SessionManager
import com.erenlermarket.app.data.session.SessionState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Ekran açıkken bildirimleri bu aralıkta bir yeniden çeker (poll). */
const val NOTIFICATIONS_POLL_INTERVAL_MS = 30_000L

@HiltViewModel
class RootViewModel @Inject constructor(
    private val session: SessionManager,
    private val notificationsStore: NotificationsStore,
) : ViewModel() {

    val sessionState: StateFlow<SessionState> = session.state

    init {
        viewModelScope.launch { session.restore() }
    }

    /**
     * Bildirim listesini sessizce tazeler. Uygulama ön plandayken çağrılır ki
     * sipariş durumu değişince (backend bildirim üretir) zil rozeti kendiliğinden
     * güncellensin — "çık-gir" gerekmesin.
     */
    fun pollNotifications() {
        if (session.currentUser == null) return
        viewModelScope.launch { notificationsStore.refresh() }
    }
}
