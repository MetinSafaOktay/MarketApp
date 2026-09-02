package com.erenlermarket.app.ui.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.session.NotificationsStore
import com.erenlermarket.app.domain.model.AppNotification
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val store: NotificationsStore,
) : ViewModel() {

    val items: StateFlow<List<AppNotification>> = store.items

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    init { refresh() }

    fun refresh() {
        _loading.value = true
        viewModelScope.launch {
            store.refresh()
            _loading.value = false
        }
    }

    fun markRead(id: String) {
        viewModelScope.launch { store.markRead(id) }
    }

    fun markAllRead() {
        viewModelScope.launch { store.markAllRead() }
    }
}
