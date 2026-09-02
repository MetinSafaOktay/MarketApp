package com.erenlermarket.app.ui.productlist

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.ui.common.ErrorState
import com.erenlermarket.app.ui.common.LoadingState
import com.erenlermarket.app.ui.common.ProductCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductListScreen(
    onProduct: (id: String, name: String) -> Unit,
    onBack: (() -> Unit)?,
    viewModel: ProductListViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var showFilters by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(state.title) },
                navigationIcon = {
                    if (onBack != null) {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, "Geri")
                        }
                    }
                },
                actions = {
                    if (state.showControls) {
                        IconButton(onClick = { showFilters = true }) {
                            Icon(Icons.Filled.FilterList, "Filtrele")
                        }
                    }
                },
            )
        },
    ) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            if (state.showControls) {
                OutlinedTextField(
                    value = state.search,
                    onValueChange = viewModel::onSearchChange,
                    leadingIcon = { Icon(Icons.Filled.Search, null) },
                    placeholder = { Text("Ürün ara") },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.lg, vertical = Spacing.sm),
                )
            }

            when (state.phase) {
                ListPhase.Loading -> LoadingState()
                ListPhase.Error -> ErrorState("Ürünler yüklenemedi", onRetry = viewModel::reload)
                ListPhase.Empty -> ErrorState("Ürün bulunamadı", onRetry = viewModel::reload)
                ListPhase.Loaded -> ProductGrid(state, viewModel, onProduct)
            }
        }
    }

    if (showFilters) {
        ModalBottomSheet(onDismissRequest = { showFilters = false }) {
            FilterSheet(
                query = state.query,
                onApply = { sort, discounted, new, inStock ->
                    viewModel.applyFilters(sort, discounted, new, inStock)
                    showFilters = false
                },
            )
        }
    }
}

@Composable
private fun ProductGrid(
    state: ProductListUiState,
    viewModel: ProductListViewModel,
    onProduct: (String, String) -> Unit,
) {
    val gridState = rememberLazyGridState()
    val lastVisible by remember {
        derivedStateOf { gridState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0 }
    }
    LaunchedEffect(gridState) {
        snapshotFlow { lastVisible }.collect { viewModel.loadMoreIfNeeded(it) }
    }

    LazyVerticalGrid(
        state = gridState,
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(Spacing.lg),
        horizontalArrangement = Arrangement.spacedBy(Spacing.md),
        verticalArrangement = Arrangement.spacedBy(Spacing.md),
        modifier = Modifier.fillMaxSize(),
    ) {
        itemsIndexed(state.products, key = { _, p -> p.id }) { _, product ->
            ProductCard(
                product = product,
                onClick = { onProduct(product.id, product.name) },
            )
        }
        if (state.loadingMore) {
            item {
                Box(Modifier.fillMaxWidth().padding(Spacing.lg), Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
        }
    }
}
