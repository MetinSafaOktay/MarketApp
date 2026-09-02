package com.erenlermarket.app.ui.auth

import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.data.session.SessionManager
import com.erenlermarket.app.domain.model.RegisterInput
import com.erenlermarket.app.util.MainDispatcherRule
import io.mockk.Runs
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.just
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class AuthViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val session = mockk<SessionManager>()
    private fun viewModel() = AuthViewModel(session)

    @Test
    fun `login needs an identifier and a password`() {
        val vm = viewModel()
        assertFalse(vm.state.value.canSubmit)

        vm.onIdentifierChange("a@b.com")
        vm.onPasswordChange("x")

        assertTrue(vm.state.value.canSubmit)
    }

    @Test
    fun `register needs an email and all name fields plus 8-char password`() {
        val vm = viewModel()
        vm.toggleMode()
        vm.onIdentifierChange("0555")
        vm.onPasswordChange("short")
        vm.onProfileNameChange("ali")
        vm.onFirstNameChange("Ali")
        vm.onLastNameChange("Veli")
        assertFalse(vm.state.value.canSubmit)

        vm.onIdentifierChange("ali@example.com")
        vm.onPasswordChange("longenough")

        assertTrue(vm.state.value.canSubmit)
    }

    @Test
    fun `successful login calls the success callback`() = runTest {
        coEvery { session.login("a@b.com", "secret") } just Runs
        val vm = viewModel()
        vm.onIdentifierChange("a@b.com")
        vm.onPasswordChange("secret")

        var done = false
        vm.submit { done = true }
        advanceUntilIdle()

        assertTrue(done)
        assertFalse(vm.state.value.submitting)
    }

    @Test
    fun `register sends the typed fields`() = runTest {
        coEvery { session.register(any()) } just Runs
        val vm = viewModel()
        vm.toggleMode()
        vm.onIdentifierChange("ali@example.com")
        vm.onPasswordChange("longenough")
        vm.onProfileNameChange("ali")
        vm.onFirstNameChange("Ali")
        vm.onLastNameChange("Veli")

        vm.submit {}
        advanceUntilIdle()

        coVerify {
            session.register(
                RegisterInput("ali@example.com", "longenough", "ali", "Ali", "Veli"),
            )
        }
    }

    @Test
    fun `an api error surfaces its message and stops the spinner`() = runTest {
        coEvery { session.login(any(), any()) } throws
            ApiException(ApiException.Kind.UNAUTHORIZED, "Geçersiz kimlik bilgileri")
        val vm = viewModel()
        vm.onIdentifierChange("a@b.com")
        vm.onPasswordChange("secret")

        vm.submit { error("should not be called") }
        advanceUntilIdle()

        assertEquals("Geçersiz kimlik bilgileri", vm.state.value.error)
        assertFalse(vm.state.value.submitting)
    }
}
