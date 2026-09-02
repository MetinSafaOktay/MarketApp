package com.erenlermarket.app.ui.messages

import com.erenlermarket.app.domain.model.Message
import com.erenlermarket.app.domain.model.MessageSender
import com.erenlermarket.app.domain.repository.MessagingRepository
import com.erenlermarket.app.util.MainDispatcherRule
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class MessagesViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = mockk<MessagingRepository>()

    private fun message(id: String, sender: MessageSender = MessageSender.STORE) =
        Message(id, sender, "içerik $id", isRead = false, createdAt = null)

    @Test
    fun `loads the conversation`() = runTest {
        coEvery { repository.messages() } returns listOf(message("1"), message("2"))

        val vm = MessagesViewModel(repository)
        runCurrent()

        assertEquals(2, vm.state.value.messages.size)
        assertEquals(false, vm.state.value.loading)
    }

    @Test
    fun `sending appends the message and clears the draft`() = runTest {
        coEvery { repository.messages() } returns emptyList()
        coEvery { repository.send("Bir sorum var") } returns message("3", MessageSender.USER)

        val vm = MessagesViewModel(repository)
        runCurrent()
        vm.onDraftChange("Bir sorum var")
        vm.send()
        runCurrent()

        assertEquals(listOf("3"), vm.state.value.messages.map { it.id })
        assertTrue(vm.state.value.draft.isEmpty())
    }

    @Test
    fun `blank draft does not send`() = runTest {
        coEvery { repository.messages() } returns emptyList()
        val vm = MessagesViewModel(repository)
        runCurrent()

        vm.onDraftChange("   ")
        vm.send()
        runCurrent()

        assertTrue(vm.state.value.messages.isEmpty())
    }
}
