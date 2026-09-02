package com.erenlermarket.app.ui.settings

import com.erenlermarket.app.data.local.ThemeController
import com.erenlermarket.app.data.local.ThemeMode
import com.erenlermarket.app.data.session.SessionManager
import com.erenlermarket.app.domain.model.SettingsUpdate
import com.erenlermarket.app.domain.model.UserSettings
import com.erenlermarket.app.domain.repository.SettingsRepository
import com.erenlermarket.app.util.MainDispatcherRule
import io.mockk.Runs
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.just
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class SettingsViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val settingsRepository = mockk<SettingsRepository>()
    private val themeController = mockk<ThemeController>(relaxed = true)
    private val session = mockk<SessionManager>()

    private val settings = UserSettings("tr", "dark", pushNotificationsEnabled = true, orderNotificationsEnabled = true)

    private fun viewModel(): SettingsViewModel {
        every { themeController.mode } returns MutableStateFlow(ThemeMode.SYSTEM)
        return SettingsViewModel(settingsRepository, themeController, session)
    }

    @Test
    fun `loads notification preferences`() = runTest {
        coEvery { settingsRepository.settings() } returns settings

        val vm = viewModel()
        advanceUntilIdle()

        assertTrue(vm.state.value.pushEnabled)
        assertFalse(vm.state.value.loading)
    }

    @Test
    fun `toggling a preference is optimistic and persisted`() = runTest {
        coEvery { settingsRepository.settings() } returns settings
        coEvery { settingsRepository.update(SettingsUpdate(pushNotificationsEnabled = false)) } returns
            settings.copy(pushNotificationsEnabled = false)

        val vm = viewModel()
        advanceUntilIdle()
        vm.setPushEnabled(false)

        assertFalse(vm.state.value.pushEnabled)
        advanceUntilIdle()
        coVerify { settingsRepository.update(SettingsUpdate(pushNotificationsEnabled = false)) }
    }

    @Test
    fun `changing theme delegates to the controller`() = runTest {
        coEvery { settingsRepository.settings() } returns settings
        val vm = viewModel()

        vm.setThemeMode(ThemeMode.DARK)

        io.mockk.verify { themeController.set(ThemeMode.DARK) }
    }

    @Test
    fun `deleting the account calls the session then the callback`() = runTest {
        coEvery { settingsRepository.settings() } returns settings
        coEvery { session.deleteAccount() } just Runs

        val vm = viewModel()
        advanceUntilIdle()

        var done = false
        vm.deleteAccount { done = true }
        advanceUntilIdle()

        assertTrue(done)
        coVerify { session.deleteAccount() }
    }
}
