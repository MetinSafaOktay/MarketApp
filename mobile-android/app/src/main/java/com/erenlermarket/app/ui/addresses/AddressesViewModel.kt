package com.erenlermarket.app.ui.addresses

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.erenlermarket.app.data.remote.ApiException
import com.erenlermarket.app.domain.model.Address
import com.erenlermarket.app.domain.model.DeliveryArea
import com.erenlermarket.app.domain.model.NewAddress
import com.erenlermarket.app.domain.repository.AddressRepository
import com.erenlermarket.app.domain.repository.StorefrontRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class AddressesPhase { Loading, Ready, Error }

data class AddressesUiState(
    val phase: AddressesPhase = AddressesPhase.Loading,
    val addresses: List<Address> = emptyList(),
    val deliveryArea: DeliveryArea? = null,
    val saving: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class AddressesViewModel @Inject constructor(
    private val addressRepository: AddressRepository,
    private val storefrontRepository: StorefrontRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(AddressesUiState())
    val state: StateFlow<AddressesUiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        _state.update { it.copy(phase = AddressesPhase.Loading, error = null) }
        viewModelScope.launch {
            try {
                val addresses = addressRepository.addresses()
                val area = runCatching { storefrontRepository.storeProfile().deliveryArea }.getOrNull()
                _state.update {
                    it.copy(phase = AddressesPhase.Ready, addresses = addresses, deliveryArea = area)
                }
            } catch (error: ApiException) {
                _state.update { it.copy(phase = AddressesPhase.Error, error = error.message) }
            }
        }
    }

    /** [editing] null ise yeni adres oluşturur, değilse günceller. */
    fun save(editing: Address?, input: NewAddress, onDone: () -> Unit) {
        _state.update { it.copy(saving = true, error = null) }
        viewModelScope.launch {
            try {
                val saved = if (editing == null) {
                    addressRepository.create(input)
                } else {
                    addressRepository.update(editing.id, input)
                }
                _state.update { s ->
                    val without = s.addresses.filterNot { it.id == saved.id }
                    val merged = if (saved.isDefault) {
                        without.map { it.copy(isDefault = false) } + saved
                    } else {
                        without + saved
                    }
                    s.copy(saving = false, addresses = merged.sortedByDescending { it.isDefault })
                }
                onDone()
            } catch (error: ApiException) {
                _state.update { it.copy(saving = false, error = error.message) }
            }
        }
    }

    fun delete(id: String) {
        viewModelScope.launch {
            try {
                addressRepository.delete(id)
                _state.update { s -> s.copy(addresses = s.addresses.filterNot { it.id == id }) }
            } catch (error: ApiException) {
                _state.update { it.copy(error = error.message) }
            }
        }
    }
}
