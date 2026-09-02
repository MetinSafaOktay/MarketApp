package com.erenlermarket.app.data.session

import com.erenlermarket.app.domain.model.AppNotification
import com.erenlermarket.app.domain.repository.NotificationsRepository
import com.erenlermarket.app.util.testUser
import io.mockk.Runs
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class NotificationsStoreTest {

    private val repository = mockk<NotificationsRepository>(relaxed = true)

    private fun note(id: String, read: Boolean) =
        AppNotification(id, "announcement", "Başlık $id", null, read, null, null)

    private fun store(signedIn: Boolean, scheduler: kotlinx.coroutines.test.TestCoroutineScheduler): NotificationsStore {
        val session = mockk<SessionManager>()
        every { session.state } returns MutableStateFlow(
            if (signedIn) SessionState.SignedIn(testUser()) else SessionState.SignedOut,
        )
        return NotificationsStore(repository, session, CoroutineScope(StandardTestDispatcher(scheduler)))
    }

    @Test
    fun `refreshes on sign-in and counts unread`() = runTest {
        coEvery { repository.notifications() } returns listOf(note("1", false), note("2", true))

        val s = store(signedIn = true, testScheduler)
        advanceUntilIdle()

        assertEquals(1, s.unreadCount.value)
    }

    @Test
    fun `markAllRead is optimistic`() = runTest {
        coEvery { repository.notifications() } returns listOf(note("1", false), note("2", false))
        coEvery { repository.markAllRead() } just Runs

        val s = store(signedIn = true, testScheduler)
        advanceUntilIdle()
        s.markAllRead()
        advanceUntilIdle()

        assertEquals(0, s.unreadCount.value)
        coVerify { repository.markAllRead() }
    }

    @Test
    fun `signed out store is empty`() = runTest {
        val s = store(signedIn = false, testScheduler)
        advanceUntilIdle()

        assertEquals(0, s.unreadCount.value)
        assertEquals(emptyList<AppNotification>(), s.items.value)
    }
}
