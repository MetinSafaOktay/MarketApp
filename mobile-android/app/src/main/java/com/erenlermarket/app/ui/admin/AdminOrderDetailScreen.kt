package com.erenlermarket.app.ui.admin

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.designsystem.cardSurface
import com.erenlermarket.app.designsystem.formatMoney
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.OrderStatus
import com.erenlermarket.app.ui.common.ErrorState
import com.erenlermarket.app.ui.common.LoadingState
import com.erenlermarket.app.ui.orders.OrderStatusBadge

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminOrderDetailScreen(
    onBack: () -> Unit,
    viewModel: AdminOrderDetailViewModel = hiltViewModel(),
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
            order == null -> ErrorState(state.error ?: "Sipariş bulunamadı", viewModel::load, Modifier.padding(padding))
            else -> LazyColumn(
                modifier = Modifier.padding(padding),
                contentPadding = PaddingValues(Spacing.lg),
                verticalArrangement = Arrangement.spacedBy(Spacing.lg),
            ) {
                item { StatusCard(order, state.updating, state.error, viewModel::updateStatus) }
                item { CustomerCard(order) }
                item { ItemsCard(order) }
            }
        }
    }
}

@Composable
private fun StatusCard(
    order: Order,
    updating: Boolean,
    error: String?,
    onUpdate: (OrderStatus, String?) -> Unit,
) {
    var note by remember { mutableStateOf("") }
    Column(
        Modifier.fillMaxWidth().cardSurface().padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.md),
    ) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text("Durum", fontWeight = FontWeight.Bold)
            OrderStatusBadge(order.status)
        }

        if (order.status == OrderStatus.CANCELLED || order.status == OrderStatus.DELIVERED) {
            Text(
                "Bu sipariş kapandı.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            return@Column
        }

        OutlinedTextField(
            value = note,
            onValueChange = { note = it },
            label = { Text("Not (opsiyonel, müşteri görür)") },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 3,
        )

        order.nextStatus?.let { next ->
            Button(
                onClick = { onUpdate(next, note.ifBlank { null }); note = "" },
                enabled = !updating,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("İleri: ${next.displayName}")
            }
        }
        OutlinedButton(
            onClick = { onUpdate(OrderStatus.CANCELLED, note.ifBlank { null }); note = "" },
            enabled = !updating,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Siparişi iptal et", color = MaterialTheme.colorScheme.error)
        }
        error?.let {
            Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
private fun CustomerCard(order: Order) {
    if (order.customerName == null && order.customerPhone == null && order.address == null) return
    Column(
        Modifier.fillMaxWidth().cardSurface().padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.xs),
    ) {
        Text("Müşteri", fontWeight = FontWeight.Bold)
        order.customerName?.let { Text(it, style = MaterialTheme.typography.bodyMedium) }
        order.customerPhone?.let {
            Text(it, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
        }
        order.address?.let {
            Text(it.fullAddress, style = MaterialTheme.typography.bodySmall)
            if (it.buildingLine.isNotEmpty()) {
                Text(
                    it.buildingLine,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Text(it.summary, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
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
        HorizontalDivider()
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Toplam", fontWeight = FontWeight.Bold)
            Text(formatMoney(order.totalAmount), fontWeight = FontWeight.Bold)
        }
    }
}
