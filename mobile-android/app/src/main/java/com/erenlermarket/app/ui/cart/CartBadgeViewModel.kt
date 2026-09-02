package com.erenlermarket.app.ui.cart

import androidx.lifecycle.ViewModel
import com.erenlermarket.app.data.session.CartStore
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject

@HiltViewModel
class CartBadgeViewModel @Inject constructor(
    cart: CartStore,
) : ViewModel() {
    val count: StateFlow<Int> = cart.count
}
