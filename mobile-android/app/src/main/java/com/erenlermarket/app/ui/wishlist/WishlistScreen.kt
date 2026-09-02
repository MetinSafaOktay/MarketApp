package com.erenlermarket.app.ui.wishlist

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import androidx.compose.ui.text.style.TextAlign
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.ui.common.LoadingState
import com.erenlermarket.app.ui.common.ProductCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishlistScreen(
    onBack: () -> Unit,
    onProduct: (id: String, name: String) -> Unit,
    viewModel: WishlistViewModel = hiltViewModel(),
) {
    val products by viewModel.products.collectAsStateWithLifecycle()
    val loading by viewModel.loading.collectAsStateWithLifecycle()
    val signedIn by viewModel.signedIn.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("İstek listem") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Geri")
                    }
                },
            )
        },
    ) { padding ->
        when {
            loading && products.isEmpty() -> LoadingState(Modifier.padding(padding))
            products.isEmpty() -> EmptyMessage(
                if (signedIn) {
                    "İstek listen boş. Beğendiğin ürünlere kalp koy."
                } else {
                    "İstek listeni görmek için giriş yap."
                },
                Modifier.padding(padding),
            )
            else -> LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier.padding(padding),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(Spacing.lg),
                horizontalArrangement = Arrangement.spacedBy(Spacing.md),
                verticalArrangement = Arrangement.spacedBy(Spacing.md),
            ) {
                items(products, key = { it.id }) { product ->
                    ProductCard(
                        product = product,
                        onClick = { onProduct(product.id, product.name) },
                        showWishlist = true,
                    )
                }
            }
        }
    }
}

@Composable
private fun EmptyMessage(text: String, modifier: Modifier) {
    Column(
        modifier = modifier.fillMaxSize().padding(Spacing.xl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(text, style = MaterialTheme.typography.bodyLarge, textAlign = TextAlign.Center)
    }
}
