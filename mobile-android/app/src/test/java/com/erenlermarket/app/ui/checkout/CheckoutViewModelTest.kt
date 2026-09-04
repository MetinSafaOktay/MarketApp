package com.erenlermarket.app.ui.checkout

import com.erenlermarket.app.data.session.CartStore
import com.erenlermarket.app.domain.model.Address
import com.erenlermarket.app.domain.model.CartItem
import com.erenlermarket.app.domain.model.CheckoutPreview
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.OrderStatus
import com.erenlermarket.app.domain.model.PaymentMethod
import com.erenlermarket.app.domain.model.StoreProfile
import com.erenlermarket.app.domain.repository.AddressRepository
import com.erenlermarket.app.domain.repository.CartRepository
import com.erenlermarket.app.domain.repository.OrderRepository
import com.erenlermarket.app.domain.repository.StorefrontRepository
import com.erenlermarket.app.util.MainDispatcherRule
import com.erenlermarket.app.util.testProduct
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.math.BigDecimal

@OptIn(ExperimentalCoroutinesApi::class)
class CheckoutViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val cartStore = mockk<CartStore>()
    private val cartRepository = mockk<CartRepository>()
    private val addressRepository = mockk<AddressRepository>()
    private val orderRepository = mockk<OrderRepository>()
    private val storefrontRepository = mockk<StorefrontRepository>()

    private val address = Address("a1", "Ev", "Merkez Mah.", "Afyon", "Merkez", isDefault = true)
    private val preview = CheckoutPreview(
        lines = listOf(CheckoutPreview.Line("p1", "Çay", 1, BigDecimal.TEN, BigDecimal.TEN, true, 5)),
        subtotal = BigDecimal.TEN,
        discountAmount = BigDecimal.ZERO,
        total = BigDecimal.TEN,
        coupon = null,
        couponError = null,
        hasStockIssues = false,
    )

    private fun viewModel(): CheckoutViewModel {
        every { cartStore.items } returns MutableStateFlow(listOf(CartItem("p1", testProduct(), 1)))
        coEvery { storefrontRepository.storeProfile() } returns StoreProfile(
            name = "Erenler", city = null, tagline = null, description = null,
            phone = null, address = null, logoUrl = null, coverImageUrl = null,
        )
        return CheckoutViewModel(
            cartStore, cartRepository, addressRepository, orderRepository, storefrontRepository,
        )
    }

    @Test
    fun `load selects the default address and fetches a preview`() = runTest {
        coEvery { addressRepository.addresses() } returns listOf(address)
        coEvery { cartRepository.checkoutPreview(null, any()) } returns preview

        val vm = viewModel()
        advanceUntilIdle()

        assertEquals(CheckoutPhase.Ready, vm.state.value.phase)
        assertEquals("a1", vm.state.value.selectedAddressId)
        assertTrue(vm.state.value.canPlaceOrder)
    }

    @Test
    fun `applying a coupon re-fetches the preview with the code`() = runTest {
        coEvery { addressRepository.addresses() } returns listOf(address)
        coEvery { cartRepository.checkoutPreview(null, any()) } returns preview
        coEvery { cartRepository.checkoutPreview("HOSGELDIN", any()) } returns preview.copy(
            discountAmount = BigDecimal.ONE,
            total = BigDecimal("9"),
        )

        val vm = viewModel()
        advanceUntilIdle()
        vm.onCouponInputChange("HOSGELDIN")
        vm.applyCoupon()
        advanceUntilIdle()

        assertEquals(BigDecimal("9"), vm.state.value.preview?.total)
        coVerify { cartRepository.checkoutPreview("HOSGELDIN", any()) }
    }

    @Test
    fun `placing an order posts the cart items and reports the id`() = runTest {
        coEvery { addressRepository.addresses() } returns listOf(address)
        coEvery { cartRepository.checkoutPreview(null, any()) } returns preview
        coEvery { cartStore.refresh() } returns Unit
        val order = Order(
            id = "order-1",
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
        coEvery { orderRepository.place(any()) } returns order

        val vm = viewModel()
        advanceUntilIdle()

        var placedId: String? = null
        vm.placeOrder { placedId = it }
        advanceUntilIdle()

        assertEquals("order-1", placedId)
        coVerify { orderRepository.place(match { it.addressId == "a1" && it.items.single().productId == "p1" }) }
    }
}
