package com.erenlermarket.app.ui.orders

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.designsystem.cardSurface
import com.erenlermarket.app.designsystem.formatMoney
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.OrderStatus
import com.erenlermarket.app.ui.common.ErrorState
import com.erenlermarket.app.ui.common.LoadingState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderDetailScreen(
    onBack: () -> Unit,
    viewModel: OrderDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(state.order?.let { "#${it.reference}" } ?: "Sipariş") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Geri")
                    }
                },
            )
        },
    ) { padding ->
        val order = state.order
        when {
            state.loading && order == null -> LoadingState(Modifier.padding(padding))
            order == null ->
                ErrorState(state.error ?: "Sipariş bulunamadı", viewModel::load, Modifier.padding(padding))
            else -> LazyColumn(
                modifier = Modifier.padding(padding),
                contentPadding = PaddingValues(Spacing.lg),
                verticalArrangement = Arrangement.spacedBy(Spacing.lg),
            ) {
                item { StatusTimeline(order) }
                item { ItemsCard(order) }
                order.address?.let { address ->
                    item {
                        Column(
                            Modifier.fillMaxWidth().cardSurface().padding(Spacing.lg),
                            verticalArrangement = Arrangement.spacedBy(Spacing.xs),
                        ) {
                            Text("Teslimat adresi", fontWeight = FontWeight.Bold)
                            Text(address.fullAddress, style = MaterialTheme.typography.bodyMedium)
                            Text(address.summary, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
                item { TotalsCard(order) }
                state.error?.let {
                    item {
                        Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                    }
                }
                if (order.status.isCancellableByCustomer) {
                    item {
                        OutlinedButton(
                            onClick = viewModel::cancel,
                            enabled = !state.cancelling,
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("Siparişi iptal et")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StatusTimeline(order: Order) {
    Column(
        Modifier.fillMaxWidth().cardSurface().padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        Text("Durum", fontWeight = FontWeight.Bold)
        if (order.status == OrderStatus.CANCELLED) {
            Text(OrderStatus.CANCELLED.displayName, color = MaterialTheme.colorScheme.error)
            return@Column
        }
        val currentIndex = OrderStatus.deliveryFlow.indexOf(order.status)
        OrderStatus.deliveryFlow.forEachIndexed { index, step ->
            val done = index <= currentIndex
            Row(
                horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    Modifier
                        .size(12.dp)
                        .background(
                            if (done) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                            CircleShape,
                        ),
                )
                Text(
                    step.displayName,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (done) {
                        MaterialTheme.colorScheme.onSurface
                    } else {
                        MaterialTheme.colorScheme.onSurfaceVariant
                    },
                    fontWeight = if (index == currentIndex) FontWeight.Bold else FontWeight.Normal,
                )
            }
        }
    }
}

@Composable
private fun ItemsCard(order: Order) {
    Column(
        Modifier.fillMaxWidth().cardSurface().padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        Text("Ürünler", fontWeight = FontWeight.Bold)
        order.lines.forEach { line ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("${line.quantity} × ${line.name}", style = MaterialTheme.typography.bodyMedium)
                Text(formatMoney(line.lineSubtotal), style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Composable
private fun TotalsCard(order: Order) {
    Column(
        Modifier.fillMaxWidth().cardSurface().padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Ara toplam")
            Text(formatMoney(order.subtotal))
        }
        if (order.discountAmount.signum() > 0) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("İndirim")
                Text("- " + formatMoney(order.discountAmount))
            }
        }
        HorizontalDivider()
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Toplam", fontWeight = FontWeight.Bold)
            Text(formatMoney(order.totalAmount), fontWeight = FontWeight.Bold)
        }
        Text(
            "Ödeme: ${order.paymentMethod.displayName}",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
