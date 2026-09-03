package com.erenlermarket.app.ui.admin

import androidx.lifecycle.SavedStateHandle
import com.erenlermarket.app.domain.model.Message
import com.erenlermarket.app.domain.model.MessageSender
import com.erenlermarket.app.domain.repository.AdminRepository
import com.erenlermarket.app.util.MainDispatcherRule
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class AdminConversationViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = mockk<AdminRepository>()

    private fun msg(id: String, sender: MessageSender) =
        Message(id, sender, "içerik $id", isRead = true, createdAt = null)

    private fun vm() = AdminConversationViewModel(
        repository,
        SavedStateHandle(mapOf("conversationId" to "c1", "name" to "Ayşe")),
    )

    @Test
    fun `loads the thread and keeps the customer name`() = runTest {
        coEvery { repository.conversationMessages("c1") } returns listOf(msg("1", MessageSender.USER))

        val model = vm()
        advanceUntilIdle()

        assertEquals("Ayşe", model.state.value.customerName)
        assertEquals(1, model.state.value.messages.size)
    }

    @Test
    fun `sending appends the reply and clears the draft`() = runTest {
        coEvery { repository.conversationMessages("c1") } returns emptyList()
        coEvery { repository.reply("c1", "merhaba") } returns msg("r1", MessageSender.STORE)

        val model = vm()
        advanceUntilIdle()
        model.onDraftChange("merhaba")
        model.send()
        advanceUntilIdle()

        assertEquals("", model.state.value.draft)
        assertEquals(listOf("r1"), model.state.value.messages.map { it.id })
        coVerify { repository.reply("c1", "merhaba") }
    }
}
