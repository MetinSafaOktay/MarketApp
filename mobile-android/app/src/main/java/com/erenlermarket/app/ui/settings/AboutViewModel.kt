package com.erenlermarket.app.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.domain.model.StoreProfile
import com.erenlermarket.app.domain.repository.StorefrontRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AboutViewModel @Inject constructor(
    private val storefront: StorefrontRepository,
) : ViewModel() {

    private val _store = MutableStateFlow<StoreProfile?>(null)
    val store: StateFlow<StoreProfile?> = _store.asStateFlow()

    init {
        viewModelScope.launch {
            _store.value = runCatching { storefront.storeProfile() }.getOrNull()
        }
    }
}
