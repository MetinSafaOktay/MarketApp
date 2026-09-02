package com.erenlermarket.app.data.session

import com.erenlermarket.app.domain.model.CartItem
import com.erenlermarket.app.domain.repository.CartRepository
import com.erenlermarket.app.util.testProduct
import com.erenlermarket.app.util.testUser
import io.mockk.Runs
import io.mockk.coEvery
import io.mockk.coVerify
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
class CartStoreTest {

    private val repository = mockk<CartRepository>(relaxed = true)
    private val product = testProduct(stock = 10)

    private fun sessionFlow(signedIn: Boolean) = MutableStateFlow<SessionState>(
        if (signedIn) SessionState.SignedIn(testUser()) else SessionState.SignedOut,
    )

    @Test
    fun `signing in refreshes the cart`() = runTest {
        val session = mockk<SessionManager>()
        io.mockk.every { session.state } returns sessionFlow(signedIn = true)
        coEvery { repository.cart() } returns listOf(CartItem("p1", product, 2))

        val store = CartStore(repository, session, CoroutineScope(StandardTestDispatcher(testScheduler)))
        advanceUntilIdle()

        assertEquals(2, store.count.value)
    }

    @Test
    fun `signing out clears the cart`() = runTest {
        val session = mockk<SessionManager>()
        val flow = sessionFlow(signedIn = true)
        io.mockk.every { session.state } returns flow
        coEvery { repository.cart() } returns listOf(CartItem("p1", product, 2))

        val store = CartStore(repository, session, CoroutineScope(StandardTestDispatcher(testScheduler)))
        advanceUntilIdle()
        flow.value = SessionState.SignedOut
        advanceUntilIdle()

        assertEquals(0, store.count.value)
        assertEquals(emptyList<CartItem>(), store.items.value)
    }

    @Test
    fun `add is optimistic then reconciles with the server`() = runTest {
        val session = mockk<SessionManager>()
        io.mockk.every { session.state } returns sessionFlow(signedIn = true)
        coEvery { repository.cart() } returnsMany listOf(
            emptyList(),
            listOf(CartItem("p1", product, 1)),
        )
        coEvery { repository.addItem("p1", 1) } just Runs

        val store = CartStore(repository, session, CoroutineScope(StandardTestDispatcher(testScheduler)))
        advanceUntilIdle()

        store.add(product)
        advanceUntilIdle()

        coVerify { repository.addItem("p1", 1) }
        assertEquals(1, store.count.value)
    }

    @Test
    fun `setting quantity to zero removes the line`() = runTest {
        val session = mockk<SessionManager>()
        io.mockk.every { session.state } returns sessionFlow(signedIn = true)
        coEvery { repository.cart() } returns listOf(CartItem("p1", product, 1))
        coEvery { repository.removeItem("p1") } just Runs

        val store = CartStore(repository, session, CoroutineScope(StandardTestDispatcher(testScheduler)))
        advanceUntilIdle()

        store.setQuantity("p1", 0)
        advanceUntilIdle()

        coVerify { repository.removeItem("p1") }
    }
}
