package com.erenlermarket.app.data.session

import com.erenlermarket.app.di.AppScope
import com.erenlermarket.app.domain.model.AppNotification
import com.erenlermarket.app.domain.model.unreadCount
import com.erenlermarket.app.domain.repository.NotificationsRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

/** Bildirim durumu — zil rozeti için. Oturum kapanınca temizlenir. */
@Singleton
class NotificationsStore @Inject constructor(
    private val repository: NotificationsRepository,
    session: SessionManager,
    @AppScope private val scope: CoroutineScope,
) {

    private val _items = MutableStateFlow<List<AppNotification>>(emptyList())
    val items: StateFlow<List<AppNotification>> = _items.asStateFlow()

    val unreadCount: StateFlow<Int> = _items
        .map { it.unreadCount }
        .stateIn(scope, SharingStarted.Eagerly, 0)

    init {
        scope.launch {
            session.state.collect { state ->
                if (state is SessionState.SignedIn) refresh() else _items.value = emptyList()
            }
        }
    }

    suspend fun refresh() {
        runCatching { repository.notifications() }.onSuccess { _items.value = it }
    }

    suspend fun markRead(id: String) {
        _items.value = _items.value.map { if (it.id == id) it.copy(isRead = true) else it }
        runCatching { repository.markRead(id) }
    }

    suspend fun markAllRead() {
        _items.value = _items.value.map { it.copy(isRead = true) }
        runCatching { repository.markAllRead() }
    }
}
