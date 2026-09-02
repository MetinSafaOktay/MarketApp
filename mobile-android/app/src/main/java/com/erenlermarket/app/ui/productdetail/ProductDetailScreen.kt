package com.erenlermarket.app.ui.productdetail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.Badge
import com.erenlermarket.app.designsystem.BadgeStyle
import com.erenlermarket.app.designsystem.Radius
import com.erenlermarket.app.designsystem.RemoteImage
import com.erenlermarket.app.designsystem.SectionHeader
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.designsystem.formatMoney
import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.ui.common.ErrorState
import com.erenlermarket.app.ui.common.LoadingState
import com.erenlermarket.app.ui.common.ProductCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    onBack: () -> Unit,
    onProduct: (id: String, name: String) -> Unit,
    viewModel: ProductDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(viewModel.fallbackName) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Geri")
                    }
                },
            )
        },
    ) { padding ->
        when (val current = state) {
            is ProductDetailUiState.Loading -> LoadingState(Modifier.padding(padding))
            is ProductDetailUiState.Error ->
                ErrorState(current.message, viewModel::load, Modifier.padding(padding))
            is ProductDetailUiState.Ready ->
                DetailContent(current, Modifier.padding(padding), onProduct)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DetailContent(
    state: ProductDetailUiState.Ready,
    modifier: Modifier,
    onProduct: (String, String) -> Unit,
) {
    val product = state.product
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.lg),
    ) {
        item { Gallery(product.imageUrls) }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                Text(product.name, style = MaterialTheme.typography.titleLarge)
                Row(
                    horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
                    verticalAlignment = androidx.compose.ui.Alignment.Bottom,
                ) {
                    Text(
                        formatMoney(product.price),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    if (product.isDiscounted && product.originalPrice != null) {
                        Text(
                            formatMoney(product.originalPrice),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textDecoration = TextDecoration.LineThrough,
                        )
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                    if (product.isNewArrival) Badge("Yeni")
                    Badge(
                        text = if (product.isInStock) "Stokta" else "Stok yok",
                        style = if (product.isInStock) BadgeStyle.NEUTRAL else BadgeStyle.DANGER,
                    )
                }
                Text(
                    "Stok kodu: ${product.sku}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        product.description?.takeIf { it.isNotBlank() }?.let { description ->
            item {
                Text(description, style = MaterialTheme.typography.bodyLarge)
            }
        }

        if (state.similar.isNotEmpty()) {
            item { HorizontalDivider() }
            item { SectionHeader("Benzer ürünler") }
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(Spacing.md)) {
                    items(state.similar, key = { it.id }) { similar ->
                        ProductCard(
                            product = similar,
                            onClick = { onProduct(similar.id, similar.name) },
                            modifier = Modifier.width(160.dp),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun Gallery(urls: List<String>) {
    val shape = RoundedCornerShape(Radius.card)
    if (urls.isEmpty()) {
        RemoteImage(
            url = null,
            contentDescription = null,
            modifier = Modifier.fillMaxWidth().aspectRatio(1f).clip(shape),
            fallbackIcon = Icons.Outlined.Image,
        )
        return
    }
    val pagerState = rememberPagerState(pageCount = { urls.size })
    HorizontalPager(
        state = pagerState,
        modifier = Modifier.fillMaxWidth().aspectRatio(1f).clip(shape),
    ) { page ->
        RemoteImage(
            url = urls[page],
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            fallbackIcon = Icons.Outlined.Image,
        )
    }
}
