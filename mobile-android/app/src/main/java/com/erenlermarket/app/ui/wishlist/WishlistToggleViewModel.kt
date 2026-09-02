package com.erenlermarket.app.ui.wishlist

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.session.WishlistStore
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/** ProductCard / detay ekranındaki kalp butonları paylaşır. */
@HiltViewModel
class WishlistToggleViewModel @Inject constructor(
    private val store: WishlistStore,
) : ViewModel() {

    val ids: StateFlow<Set<String>> = store.ids
    val enabled: StateFlow<Boolean> = store.signedIn

    fun toggle(productId: String) {
        viewModelScope.launch { store.toggle(productId) }
    }
}
