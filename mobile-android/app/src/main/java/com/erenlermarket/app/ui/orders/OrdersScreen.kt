package com.erenlermarket.app.ui.orders

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.Badge
import com.erenlermarket.app.designsystem.BadgeStyle
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.designsystem.cardSurface
import com.erenlermarket.app.designsystem.formatMoney
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.OrderStatus
import com.erenlermarket.app.ui.common.ErrorState
import com.erenlermarket.app.ui.common.LoadingState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    onBack: () -> Unit,
    onOrder: (orderId: String) -> Unit,
    viewModel: OrdersViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Siparişlerim") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Geri")
                    }
                },
            )
        },
    ) { padding ->
        when (val current = state) {
            is OrdersUiState.Loading -> LoadingState(Modifier.padding(padding))
            is OrdersUiState.Error -> ErrorState(current.message, viewModel::load, Modifier.padding(padding))
            is OrdersUiState.Ready -> if (current.orders.isEmpty()) {
                Column(
                    Modifier.fillMaxSize().padding(padding).padding(Spacing.xl),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                ) {
                    Text(
                        "Henüz siparişin yok.",
                        style = MaterialTheme.typography.bodyLarge,
                        textAlign = TextAlign.Center,
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.padding(padding),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(Spacing.lg),
                    verticalArrangement = Arrangement.spacedBy(Spacing.md),
                ) {
                    items(current.orders, key = { it.id }) { order ->
                        OrderRow(order) { onOrder(order.id) }
                    }
                }
            }
        }
    }
}

@Composable
fun OrderStatusBadge(status: OrderStatus) {
    val style = when (status) {
        OrderStatus.DELIVERED -> BadgeStyle.ACCENT
        OrderStatus.CANCELLED -> BadgeStyle.DANGER
        else -> BadgeStyle.NEUTRAL
    }
    Badge(status.displayName, style = style)
}

@Composable
private fun OrderRow(order: Order, onClick: () -> Unit) {
    Column(
        Modifier.fillMaxWidth().cardSurface().clickable(onClick = onClick).padding(Spacing.md),
        verticalArrangement = Arrangement.spacedBy(Spacing.xs),
    ) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("#${order.reference}", fontWeight = FontWeight.Bold)
            OrderStatusBadge(order.status)
        }
        Text(
            "${order.itemCount} ürün • ${formatMoney(order.totalAmount)}",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
