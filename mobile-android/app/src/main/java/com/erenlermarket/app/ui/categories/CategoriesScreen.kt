package com.erenlermarket.app.ui.categories

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.GridView
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.Radius
import com.erenlermarket.app.designsystem.RemoteImage
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.designsystem.cardSurface
import com.erenlermarket.app.domain.model.ProductCategory
import com.erenlermarket.app.ui.common.ErrorState
import com.erenlermarket.app.ui.common.LoadingState
import com.erenlermarket.app.ui.common.OfflineBanner

@Composable
fun CategoriesScreen(
    onCategory: (id: String, name: String) -> Unit,
    viewModel: CategoriesViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    when (val current = state) {
        is CategoriesUiState.Loading -> LoadingState()
        is CategoriesUiState.Error -> ErrorState(current.message, onRetry = viewModel::load)
        is CategoriesUiState.Ready -> Column {
            if (current.isOffline) OfflineBanner()
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(Spacing.lg),
                horizontalArrangement = Arrangement.spacedBy(Spacing.md),
                verticalArrangement = Arrangement.spacedBy(Spacing.md),
            ) {
                items(current.categories, key = { it.id }) { category ->
                    CategoryTile(category) { onCategory(category.id, category.name) }
                }
            }
        }
    }
}

@Composable
private fun CategoryTile(category: ProductCategory, onClick: () -> Unit) {
    Column(
        Modifier.cardSurface().clickable(onClick = onClick).padding(Spacing.sm),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        RemoteImage(
            url = category.imageUrl,
            contentDescription = category.name,
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1.4f)
                .clip(RoundedCornerShape(Radius.button)),
            fallbackIcon = Icons.Outlined.GridView,
        )
        Text(
            category.name,
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = FontWeight.SemiBold,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
    }
}
