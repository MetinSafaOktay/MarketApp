package com.erenlermarket.app.ui.addresses

import com.erenlermarket.app.domain.model.Address
import com.erenlermarket.app.domain.model.NewAddress
import com.erenlermarket.app.domain.model.StoreProfile
import com.erenlermarket.app.domain.repository.AddressRepository
import com.erenlermarket.app.domain.repository.StorefrontRepository
import com.erenlermarket.app.util.MainDispatcherRule
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class AddressesViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val addressRepository = mockk<AddressRepository>()
    private val storefrontRepository = mockk<StorefrontRepository>()

    private val ev = Address("a1", "Ev", "Merkez Mah.", "Afyonkarahisar", "Merkez", isDefault = true)

    private fun viewModel(): AddressesViewModel {
        coEvery { storefrontRepository.storeProfile() } returns StoreProfile(
            name = "Erenler", city = null, tagline = null, description = null,
            phone = null, address = null, logoUrl = null, coverImageUrl = null,
        )
        return AddressesViewModel(addressRepository, storefrontRepository)
    }

    @Test
    fun `load exposes the address list`() = runTest {
        coEvery { addressRepository.addresses() } returns listOf(ev)

        val vm = viewModel()
        advanceUntilIdle()

        assertEquals(AddressesPhase.Ready, vm.state.value.phase)
        assertEquals(listOf(ev), vm.state.value.addresses)
    }

    @Test
    fun `save with an editing address calls update and replaces it in the list`() = runTest {
        coEvery { addressRepository.addresses() } returns listOf(ev)
        val updated = ev.copy(label = "İş", fullAddress = "Yeni Mah.")
        coEvery { addressRepository.update("a1", any()) } returns updated

        val vm = viewModel()
        advanceUntilIdle()

        var done = false
        vm.save(ev, NewAddress("İş", "Yeni Mah.", "Afyonkarahisar", "Merkez"), onDone = { done = true })
        advanceUntilIdle()

        assertTrue(done)
        assertEquals(listOf(updated), vm.state.value.addresses)
        coVerify { addressRepository.update("a1", any()) }
    }

    @Test
    fun `save without an editing address calls create`() = runTest {
        coEvery { addressRepository.addresses() } returns emptyList()
        val created = Address("a2", "Ev", "A Mah.", "Afyonkarahisar", "Merkez", isDefault = false)
        coEvery { addressRepository.create(any()) } returns created

        val vm = viewModel()
        advanceUntilIdle()

        vm.save(null, NewAddress("Ev", "A Mah.", "Afyonkarahisar", "Merkez"), onDone = {})
        advanceUntilIdle()

        assertEquals(listOf(created), vm.state.value.addresses)
        coVerify { addressRepository.create(any()) }
    }

    @Test
    fun `delete removes the address from the list`() = runTest {
        coEvery { addressRepository.addresses() } returns listOf(ev)
        coEvery { addressRepository.delete("a1") } returns Unit

        val vm = viewModel()
        advanceUntilIdle()
        vm.delete("a1")
        advanceUntilIdle()

        assertTrue(vm.state.value.addresses.isEmpty())
        coVerify { addressRepository.delete("a1") }
    }
}
