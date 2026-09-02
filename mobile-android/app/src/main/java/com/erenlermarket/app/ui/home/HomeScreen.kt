package com.erenlermarket.app.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.Radius
import com.erenlermarket.app.designsystem.SectionHeader
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.designsystem.cardSurface
import com.erenlermarket.app.domain.model.Announcement
import com.erenlermarket.app.domain.model.StoreProfile
import com.erenlermarket.app.ui.common.ErrorState
import com.erenlermarket.app.ui.common.LoadingState
import com.erenlermarket.app.ui.common.ProductCard

@Composable
fun HomeScreen(
    onProduct: (id: String, name: String) -> Unit,
    onRailSeeAll: (rail: HomeRail) -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    when (val current = state) {
        is HomeUiState.Loading -> LoadingState()
        is HomeUiState.Error -> ErrorState(current.message, onRetry = viewModel::load)
        is HomeUiState.Ready -> HomeContent(current, onProduct, onRailSeeAll)
    }
}

@Composable
private fun HomeContent(
    state: HomeUiState.Ready,
    onProduct: (String, String) -> Unit,
    onRailSeeAll: (HomeRail) -> Unit,
) {
    LazyColumn(
        contentPadding = PaddingValues(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.xl),
    ) {
        item { HeroCard(state.store) }

        if (state.announcements.isNotEmpty()) {
            items(state.announcements.take(3)) { AnnouncementCard(it) }
        }

        items(state.rails, key = { it.id }) { rail ->
            Column(verticalArrangement = Arrangement.spacedBy(Spacing.md)) {
                SectionHeader(rail.title) {
                    TextButton(onClick = { onRailSeeAll(rail) }) {
                        Text("Tümü", style = MaterialTheme.typography.labelLarge)
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

