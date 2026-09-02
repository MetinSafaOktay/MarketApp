package com.erenlermarket.app.ui.orders

import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.OrderStatus
import com.erenlermarket.app.domain.model.PaymentMethod
import com.erenlermarket.app.domain.repository.OrderRepository
import com.erenlermarket.app.util.MainDispatcherRule
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.math.BigDecimal

@OptIn(ExperimentalCoroutinesApi::class)
class OrdersViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = mockk<OrderRepository>()

    private fun order(id: String) = Order(
        id = id,
        status = OrderStatus.PENDING,
        paymentMethod = PaymentMethod.CASH_ON_DELIVERY,
        subtotal = BigDecimal.TEN,
        discountAmount = BigDecimal.ZERO,
        totalAmount = BigDecimal.TEN,
        createdAt = null,
        lines = emptyList(),
        statusHistory = emptyList(),
        address = null,
    )

    @Test
    fun `loads the order list`() = runTest {
        coEvery { repository.orders() } returns listOf(order("1"), order("2"))

        val vm = OrdersViewModel(repository)
        advanceUntilIdle()

        val state = vm.state.value
        assertTrue(state is OrdersUiState.Ready)
        assertEquals(2, (state as OrdersUiState.Ready).orders.size)
    }

    @Test
    fun `surfaces an error`() = runTest {
        coEvery { repository.orders() } throws ApiException(ApiException.Kind.NETWORK, "yok")

        val vm = OrdersViewModel(repository)
        advanceUntilIdle()

        assertTrue(vm.state.value is OrdersUiState.Error)
    }
}
