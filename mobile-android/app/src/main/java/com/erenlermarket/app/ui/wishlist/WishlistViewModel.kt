package com.erenlermarket.app.ui.wishlist

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.session.WishlistStore
import com.erenlermarket.app.domain.model.Product
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class WishlistViewModel @Inject constructor(
    private val store: WishlistStore,
) : ViewModel() {

    private val _loading = MutableStateFlow(true)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    val products: StateFlow<List<Product>> = store.products
    val signedIn: StateFlow<Boolean> = store.signedIn

    init { refresh() }

    fun refresh() {
        _loading.value = true
        viewModelScope.launch {
            store.refresh()
            _loading.value = false
        }
    }
}
