package com.erenlermarket.app.ui.home

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.ErenlerTheme
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.ui.common.ErrorState
import com.erenlermarket.app.ui.common.LoadingState

@Composable
fun HomeScreen(viewModel: HomeViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    when (val current = state) {
        is HomeUiState.Loading -> LoadingState()
        is HomeUiState.Error -> ErrorState(current.message, onRetry = viewModel::load)
        is HomeUiState.Ready -> HomeContent(
            title = current.store.name,
            tagline = current.store.tagline ?: "Online sipariş ver, kapıda öde!",
        )
    }
}

@Composable
private fun HomeContent(title: String, tagline: String) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(Spacing.xl),
    ) {
        Text(title, style = MaterialTheme.typography.headlineLarge)
        Text(
            tagline,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = Spacing.sm),
        )
        Text(
            "Vitrin, raflar ve duyurular A2'de eklenecek.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = Spacing.xl),
        )
    }
}

@Preview
@Composable
private fun HomeContentPreview() {
    ErenlerTheme {
        HomeContent("Erenler Market", "Taze ürünler, kapına kadar")
    }
}
