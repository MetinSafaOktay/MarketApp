package com.erenlermarket.app.ui.checkout

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.data.session.CartStore
import com.erenlermarket.app.domain.model.Address
import com.erenlermarket.app.domain.model.CheckoutPreview
import com.erenlermarket.app.domain.model.NewAddress
import com.erenlermarket.app.domain.model.PaymentMethod
import com.erenlermarket.app.domain.model.PlaceOrderInput
import com.erenlermarket.app.domain.repository.AddressRepository
import com.erenlermarket.app.domain.repository.CartRepository
import com.erenlermarket.app.domain.repository.OrderRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class CheckoutPhase { Loading, Ready, Error }

data class CheckoutUiState(
    val phase: CheckoutPhase = CheckoutPhase.Loading,
    val addresses: List<Address> = emptyList(),
    val selectedAddressId: String? = null,
    val paymentMethod: PaymentMethod = PaymentMethod.CASH_ON_DELIVERY,
    val couponInput: String = "",
    val preview: CheckoutPreview? = null,
    val applyingCoupon: Boolean = false,
    val placing: Boolean = false,
    val error: String? = null,
) {
    val canPlaceOrder: Boolean
        get() = phase == CheckoutPhase.Ready &&
            selectedAddressId != null &&
            !placing &&
            preview?.let { it.lines.isNotEmpty() && !it.hasStockIssues } == true
}

@HiltViewModel
class CheckoutViewModel @Inject constructor(
    private val cart: CartStore,
    private val cartRepository: CartRepository,
    private val addressRepository: AddressRepository,
    private val orderRepository: OrderRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(CheckoutUiState())
    val state: StateFlow<CheckoutUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.update { it.copy(phase = CheckoutPhase.Loading, error = null) }
        viewModelScope.launch {
            try {
                val addresses = addressRepository.addresses()
                val preview = cartRepository.checkoutPreview(null)
                _state.update {
                    it.copy(
                        phase = CheckoutPhase.Ready,
                        addresses = addresses,
                        selectedAddressId = it.selectedAddressId
                            ?: addresses.firstOrNull { a -> a.isDefault }?.id
                            ?: addresses.firstOrNull()?.id,
                        preview = preview,
                    )
                }
            } catch (error: ApiException) {
                _state.update { it.copy(phase = CheckoutPhase.Error, error = error.message) }
            }
        }
    }

    fun selectAddress(id: String) = _state.update { it.copy(selectedAddressId = id) }

    fun setPaymentMethod(method: PaymentMethod) = _state.update { it.copy(paymentMethod = method) }

    fun onCouponInputChange(value: String) = _state.update { it.copy(couponInput = value) }

    fun applyCoupon() {
        val code = _state.value.couponInput.trim().ifBlank { null }
        _state.update { it.copy(applyingCoupon = true) }
        viewModelScope.launch {
            try {
                val preview = cartRepository.checkoutPreview(code)
                _state.update { it.copy(applyingCoupon = false, preview = preview) }
            } catch (error: ApiException) {
                _state.update { it.copy(applyingCoupon = false, error = error.message) }
            }
        }
    }

    fun clearCoupon() {
        _state.update { it.copy(couponInput = "") }
        applyCoupon()
    }

    fun addAddress(address: NewAddress, onDone: () -> Unit) {
        viewModelScope.launch {
            try {
                val created = addressRepository.create(address)
                _state.update {
                    it.copy(
                        addresses = it.addresses.filterNot { a -> a.id == created.id } + created,
                        selectedAddressId = created.id,
                    )
                }
                onDone()
            } catch (error: ApiException) {
                _state.update { it.copy(error = error.message) }
            }
        }
    }

    fun placeOrder(onPlaced: (orderId: String) -> Unit) {
        val current = _state.value
        val addressId = current.selectedAddressId ?: return
        val items = cart.items.value.map { PlaceOrderInput.Item(it.product.id, it.quantity) }
        if (items.isEmpty()) return
        _state.update { it.copy(placing = true, error = null) }
        viewModelScope.launch {
            try {
                val order = orderRepository.place(
                    PlaceOrderInput(
                        addressId = addressId,
                        items = items,
                        couponCode = current.preview?.coupon?.code,
                        paymentMethod = current.paymentMethod,
                    ),
                )
                cart.refresh()
                onPlaced(order.id)
            } catch (error: ApiException) {
                _state.update { it.copy(placing = false, error = error.message) }
            }
        }
    }
}
