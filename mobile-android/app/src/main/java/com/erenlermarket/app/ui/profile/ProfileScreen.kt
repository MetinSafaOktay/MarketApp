package com.erenlermarket.app.ui.profile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.data.session.SessionState
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.designsystem.cardSurface
import com.erenlermarket.app.domain.model.User
import com.erenlermarket.app.domain.model.UserRole
import com.erenlermarket.app.ui.common.LoadingState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onBack: () -> Unit,
    onSignIn: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val signingOut by viewModel.signingOut.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Hesabım") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Geri")
                    }
                },
            )
        },
    ) { padding ->
        when (val current = state) {
            is SessionState.Loading -> LoadingState(Modifier.padding(padding))
            is SessionState.SignedOut -> SignedOut(Modifier.padding(padding), onSignIn)
            is SessionState.SignedIn ->
                SignedIn(current.user, signingOut, Modifier.padding(padding), viewModel::signOut)
        }
    }
}

@Composable
private fun SignedOut(modifier: Modifier, onSignIn: () -> Unit) {
    Column(
        modifier = modifier.fillMaxSize().padding(Spacing.xl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            "Siparişlerini görmek ve alışveriş yapmak için giriş yap.",
            style = MaterialTheme.typography.bodyLarge,
        )
        Button(
            onClick = onSignIn,
            modifier = Modifier.fillMaxWidth().padding(top = Spacing.lg),
        ) {
            Text("Giriş yap")
        }
    }
}

@Composable
private fun SignedIn(
    user: User,
    signingOut: Boolean,
    modifier: Modifier,
    onSignOut: () -> Unit,
) {
    Column(
        modifier = modifier.fillMaxSize().padding(Spacing.lg),
        verticalArrangement = Arrangement.spacedBy(Spacing.lg),
    ) {
        Column(
            Modifier.fillMaxWidth().cardSurface().padding(Spacing.lg),
            verticalArrangement = Arrangement.spacedBy(Spacing.xs),
        ) {
            Text(
                user.fullName.ifBlank { user.profileName },
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Text(
                user.contactLabel,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            if (user.role == UserRole.ADMIN) {
                Text(
                    "Yönetici",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
        }

        OutlinedButton(
            onClick = onSignOut,
            enabled = !signingOut,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Çıkış yap")
        }
    }
}
