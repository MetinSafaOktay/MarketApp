package com.erenlermarket.app.ui.cart

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.RemoteImage
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.designsystem.cardSurface
import com.erenlermarket.app.designsystem.formatMoney
import com.erenlermarket.app.domain.model.CartItem
import com.erenlermarket.app.ui.common.LoadingState
import com.erenlermarket.app.ui.common.QuantityStepper

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    onBack: () -> Unit,
    onCheckout: () -> Unit,
    onSignIn: () -> Unit,
    viewModel: CartViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Sepetim") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Geri")
                    }
                },
            )
        },
        bottomBar = {
            if (state.items.isNotEmpty()) {
                CartSummaryBar(
                    subtotalLabel = formatMoney(state.subtotal),
                    enabled = !state.hasStockIssue,
                    onCheckout = onCheckout,
                )
            }
        },
    ) { padding ->
        when {
            state.loading && state.items.isEmpty() -> LoadingState(Modifier.padding(padding))
            !state.signedIn -> Centered("Sepetini görmek için giriş yap.", "Giriş yap", onSignIn, Modifier.padding(padding))
            state.items.isEmpty() -> Centered("Sepetin boş.", null, {}, Modifier.padding(padding))
            else -> LazyColumn(
                modifier = Modifier.padding(padding),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(Spacing.lg),
                verticalArrangement = Arrangement.spacedBy(Spacing.md),
            ) {
                items(state.items, key = { it.id }) { item ->
                    CartRow(
                        item = item,
                        onIncrease = { viewModel.increase(item) },
                        onDecrease = { viewModel.decrease(item) },
                    )
                }
                if (state.hasStockIssue) {
                    item {
                        Text(
                            "Bazı ürünlerde yeterli stok yok. Adedi azalt ya da ürünü kaldır.",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun CartRow(item: CartItem, onIncrease: () -> Unit, onDecrease: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().cardSurface().padding(Spacing.md),
        horizontalArrangement = Arrangement.spacedBy(Spacing.md),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        RemoteImage(
            url = item.product.imageUrls.firstOrNull(),
            contentDescription = item.product.name,
            modifier = Modifier.size(64.dp),
            fallbackIcon = Icons.Outlined.Image,
        )
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
            Text(
                item.product.name,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                formatMoney(item.lineTotal),
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Bold,
            )
            if (!item.isAvailable) {
                Text(
                    "Stokta ${item.product.stockQuantity} adet",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.labelSmall,
                )
            }
        }
        QuantityStepper(
            quantity = item.quantity,
            onDecrease = onDecrease,
            onIncrease = onIncrease,
            canIncrease = item.quantity < item.product.stockQuantity,
        )
    }
}

@Composable
private fun CartSummaryBar(subtotalLabel: String, enabled: Boolean, onCheckout: () -> Unit) {
    Surface(shadowElevation = 8.dp) {
        Column(Modifier.fillMaxWidth().padding(Spacing.lg), verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Ara toplam", style = MaterialTheme.typography.bodyMedium)
                Text(subtotalLabel, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }
            Button(onClick = onCheckout, enabled = enabled, modifier = Modifier.fillMaxWidth()) {
                Text("Sepeti onayla")
            }
        }
    }
}

@Composable
private fun Centered(message: String, actionLabel: String?, onAction: () -> Unit, modifier: Modifier) {
    Column(
        modifier = modifier.fillMaxSize().padding(Spacing.xl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(message, style = MaterialTheme.typography.bodyLarge, textAlign = TextAlign.Center)
        if (actionLabel != null) {
            Spacer(Modifier.size(Spacing.lg))
            Button(onClick = onAction) { Text(actionLabel) }
        }
    }
}
