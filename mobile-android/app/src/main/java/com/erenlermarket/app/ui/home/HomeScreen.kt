package com.erenlermarket.app.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.Radius
import com.erenlermarket.app.designsystem.SectionHeader
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.designsystem.cardSurface
import com.erenlermarket.app.designsystem.formatMoney
import com.erenlermarket.app.domain.model.Announcement
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.StoreProfile
import com.erenlermarket.app.ui.common.CartActionButton
import com.erenlermarket.app.ui.common.ErrorState
import com.erenlermarket.app.ui.common.LoadingState
import com.erenlermarket.app.ui.common.MessagesActionButton
import com.erenlermarket.app.ui.common.NotificationsActionButton
import com.erenlermarket.app.ui.common.OfflineBanner
import com.erenlermarket.app.ui.common.ProductCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onProduct: (id: String, name: String) -> Unit,
    onAccount: () -> Unit,
    onCart: () -> Unit,
    onNotifications: () -> Unit,
    onMessages: () -> Unit,
    onOrder: (orderId: String) -> Unit,
    onRailSeeAll: (rail: HomeRail) -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    // Ekrana geri dönünce süren siparişin durumunu tazele (takip kartı güncel kalsın).
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        if (state is HomeUiState.Ready) viewModel.refreshActiveOrder()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Erenler Market") },
                navigationIcon = {
                    IconButton(onClick = onAccount) {
                        Icon(Icons.Outlined.AccountCircle, "Hesabım")
                    }
                },
                actions = {
                    NotificationsActionButton(onClick = onNotifications)
                    MessagesActionButton(onClick = onMessages)
                    CartActionButton(onClick = onCart)
                },
            )
        },
    ) { padding ->
        when (val current = state) {
            is HomeUiState.Loading -> LoadingState(Modifier.padding(padding))
            is HomeUiState.Error ->
                ErrorState(current.message, onRetry = viewModel::load, modifier = Modifier.padding(padding))
            is HomeUiState.Ready -> Column(Modifier.padding(padding)) {
                if (current.isOffline) OfflineBanner()
                HomeContent(current, Modifier, onProduct, onOrder, onRailSeeAll)
            }
        }
    }
}

@Composable
private fun HomeContent(
    state: HomeUiState.Ready,
    modifier: Modifier,
    onProduct: (String, String) -> Unit,
    onOrder: (String) -> Unit,
    onRailSeeAll: (HomeRail) -> Unit,
) {
    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.xl),
    ) {
        state.activeOrder?.let { order ->
            item { ActiveOrderCard(order) { onOrder(order.id) } }
        }

        state.store?.let { item { HeroCard(it) } }

        if (state.announcements.isNotEmpty()) {
            items(state.announcements.take(3)) { AnnouncementCard(it) }
        }

        items(state.rails, key = { it.id }) { rail ->
            Column(verticalArrangement = Arrangement.spacedBy(Spacing.md)) {
                SectionHeader(rail.title) {
                    if (rail.showSeeAll) {
                        TextButton(onClick = { onRailSeeAll(rail) }) {
                            Text("Tümü", style = MaterialTheme.typography.labelLarge)
                        }
                    }
                }
                LazyRow(horizontalArrangement = Arrangement.spacedBy(Spacing.md)) {
                    items(rail.products, key = { it.id }) { product ->
                        ProductCard(
                            product = product,
                            onClick = { onProduct(product.id, product.name) },
                            modifier = Modifier.width(160.dp),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ActiveOrderCard(order: Order, onClick: () -> Unit) {
    val steps = com.erenlermarket.app.domain.model.OrderStatus.deliveryFlow
    val currentIndex = steps.indexOf(order.status).coerceAtLeast(0)
    Column(
        Modifier
            .fillMaxWidth()
            .cardSurface()
            .clickable(onClick = onClick)
            .padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                Icons.Filled.LocalShipping,
                null,
                tint = MaterialTheme.colorScheme.primary,
            )
            Column(Modifier.weight(1f)) {
                Text(
                    "Siparişin: ${order.status.displayName}",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.SemiBold,
                )
                Text(
                    "#${order.reference} • ${formatMoney(order.totalAmount)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(Spacing.xs)) {
            steps.forEachIndexed { index, _ ->
                Box(
                    Modifier
                        .weight(1f)
                        .height(4.dp)
                        .background(
                            if (index <= currentIndex) {
                                MaterialTheme.colorScheme.primary
                            } else {
                                MaterialTheme.colorScheme.surfaceVariant
                            },
                            RoundedCornerShape(2.dp),
                        ),
                )
            }
        }
    }
}

@Composable
private fun HeroCard(store: StoreProfile?) {
    Column(
        Modifier.fillMaxWidth().cardSurface().padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        Text(
            store?.name ?: "Erenler Market",
            style = MaterialTheme.typography.headlineLarge,
        )
        Text(
            store?.tagline ?: "Online sipariş ver, kapıda öde!",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        store?.description?.let {
            Text(
                it,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun AnnouncementCard(announcement: Announcement) {
    Column(
        Modifier
            .fillMaxWidth()
            .cardSurface()
            .padding(Spacing.md),
        verticalArrangement = Arrangement.spacedBy(Spacing.xs),
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
        ) {
            Icon(
                Icons.Filled.Campaign,
                null,
                tint = MaterialTheme.colorScheme.primary,
            )
            Text(
                announcement.title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold,
            )
        }
        Text(
            announcement.content,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

