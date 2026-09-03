package com.erenlermarket.app.ui.admin

import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.OrderStatus
import com.erenlermarket.app.domain.model.PaymentMethod
import com.erenlermarket.app.domain.repository.AdminRepository
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
class AdminOrdersViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = mockk<AdminRepository>()

    private fun order(id: String, status: OrderStatus) = Order(
        id = id,
        status = status,
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
    fun `active filter drops delivered and cancelled`() = runTest {
        coEvery { repository.orders(null) } returns listOf(
            order("1", OrderStatus.PREPARING),
            order("2", OrderStatus.DELIVERED),
            order("3", OrderStatus.CANCELLED),
        )

        val vm = AdminOrdersViewModel(repository)
        advanceUntilIdle()

        assertEquals(listOf("1"), vm.state.value.orders.map { it.id })
    }

    @Test
    fun `surfaces an error`() = runTest {
        coEvery { repository.orders(null) } throws ApiException(ApiException.Kind.NETWORK, "yok")

        val vm = AdminOrdersViewModel(repository)
        advanceUntilIdle()

        assertTrue(vm.state.value.error != null)
    }
}
