package com.erenlermarket.app.ui.notifications

import androidx.lifecycle.ViewModel
import com.erenlermarket.app.data.session.NotificationsStore
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject

@HiltViewModel
class NotificationsBadgeViewModel @Inject constructor(
    store: NotificationsStore,
) : ViewModel() {
    val unreadCount: StateFlow<Int> = store.unreadCount
}
