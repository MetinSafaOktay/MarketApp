package com.erenlermarket.app.ui.checkout

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.designsystem.cardSurface
import com.erenlermarket.app.designsystem.formatMoney
import com.erenlermarket.app.domain.model.Address
import com.erenlermarket.app.domain.model.CheckoutPreview
import com.erenlermarket.app.domain.model.PaymentMethod
import com.erenlermarket.app.ui.common.ErrorState
import com.erenlermarket.app.ui.common.LoadingState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    onBack: () -> Unit,
    onOrderPlaced: (orderId: String) -> Unit,
    viewModel: CheckoutViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var addingAddress by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Ödeme") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Geri")
                    }
                },
            )
        },
        bottomBar = {
            if (state.phase == CheckoutPhase.Ready) {
                Button(
                    onClick = { viewModel.placeOrder(onOrderPlaced) },
                    enabled = state.canPlaceOrder,
                    modifier = Modifier.fillMaxWidth().padding(Spacing.lg),
                ) {
                    if (state.placing) {
                        CircularProgressIndicator(
                            strokeWidth = 2.dp,
                            modifier = Modifier.padding(0.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                        )
                    } else {
                        Text("Siparişi ver" + (state.preview?.let { " • ${formatMoney(it.total)}" } ?: ""))
                    }
                }
            }
        },
    ) { padding ->
        when (state.phase) {
            CheckoutPhase.Loading -> LoadingState(Modifier.padding(padding))
            CheckoutPhase.Error ->
                ErrorState(state.error ?: "Bir şeyler ters gitti", viewModel::load, Modifier.padding(padding))
            CheckoutPhase.Ready -> Column(
                Modifier
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(Spacing.lg),
                verticalArrangement = Arrangement.spacedBy(Spacing.lg),
            ) {
                AddressSection(
                    addresses = state.addresses,
                    selectedId = state.selectedAddressId,
                    onSelect = viewModel::selectAddress,
                    onAdd = { addingAddress = true },
                )
                state.deliveryAreaError?.let {
                    Text(
                        it,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
                PaymentSection(state.paymentMethod, viewModel::setPaymentMethod)
                CouponSection(
                    input = state.couponInput,
                    applying = state.applyingCoupon,
                    preview = state.preview,
                    onInput = viewModel::onCouponInputChange,
                    onApply = viewModel::applyCoupon,
                    onClear = viewModel::clearCoupon,
                )
                state.preview?.let { SummarySection(it) }
                state.error?.let {
                    Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }

    if (addingAddress) {
        AddAddressDialog(
            deliveryArea = state.deliveryArea,
            onDismiss = { addingAddress = false },
            onSave = { viewModel.addAddress(it) { addingAddress = false } },
        )
    }
}

@Composable
private fun AddressSection(
    addresses: List<Address>,
    selectedId: String?,
    onSelect: (String) -> Unit,
    onAdd: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
        SectionTitle("Teslimat adresi")
        if (addresses.isEmpty()) {
            Text("Kayıtlı adresin yok.", style = MaterialTheme.typography.bodyMedium)
        }
        addresses.forEach { address ->
            Row(
                Modifier
                    .fillMaxWidth()
                    .cardSurface()
                    .selectable(selected = address.id == selectedId, onClick = { onSelect(address.id) })
                    .padding(Spacing.md),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
            ) {
                RadioButton(selected = address.id == selectedId, onClick = { onSelect(address.id) })
                Column {
                    Text(address.label, fontWeight = FontWeight.SemiBold)
                    Text(
                        address.fullAddress,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    if (address.buildingLine.isNotEmpty()) {
                        Text(
                            address.buildingLine,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    Text(address.summary, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        OutlinedButton(onClick = onAdd, modifier = Modifier.fillMaxWidth()) { Text("Yeni adres ekle") }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PaymentSection(selected: PaymentMethod, onSelect: (PaymentMethod) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
        SectionTitle("Ödeme yöntemi")
        Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            PaymentMethod.entries.forEach { method ->
                FilterChip(
                    selected = method == selected,
                    onClick = { onSelect(method) },
                    label = { Text(method.displayName) },
                )
            }
        }
    }
}

@Composable
private fun CouponSection(
    input: String,
    applying: Boolean,
    preview: CheckoutPreview?,
    onInput: (String) -> Unit,
    onApply: () -> Unit,
    onClear: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
        SectionTitle("Kupon")
        Row(
            horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedTextField(
                value = input,
                onValueChange = onInput,
                label = { Text("Kupon kodu") },
                singleLine = true,
                modifier = Modifier.weight(1f),
            )
            TextButton(onClick = onApply, enabled = !applying) { Text("Uygula") }
        }
        preview?.coupon?.let {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("${it.code} uygulandı", color = MaterialTheme.colorScheme.primary)
                TextButton(onClick = onClear) { Text("Kaldır") }
            }
        }
        preview?.couponError?.let {
            Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
private fun SummarySection(preview: CheckoutPreview) {
    Column(
        Modifier.fillMaxWidth().cardSurface().padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        SummaryRow("Ara toplam", formatMoney(preview.subtotal))
        if (preview.discountAmount.signum() > 0) {
            SummaryRow("İndirim", "- " + formatMoney(preview.discountAmount))
        }
        HorizontalDivider()
        SummaryRow("Toplam", formatMoney(preview.total), bold = true)
        if (preview.hasStockIssues) {
            Text(
                "Sepette stok sorunu var. Devam etmeden önce sepeti düzenle.",
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
            )
        }
    }
}

@Composable
private fun SummaryRow(label: String, value: String, bold: Boolean = false) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal)
        Text(value, fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal)
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(text, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
}
