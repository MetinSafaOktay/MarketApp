package com.erenlermarket.app.ui.messages

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import kotlinx.coroutines.delay
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.domain.model.Message
import com.erenlermarket.app.domain.model.MessageSender
import com.erenlermarket.app.ui.common.LoadingState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MessagesScreen(
    onBack: () -> Unit,
    viewModel: MessagesViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val listState = rememberLazyListState()

    LaunchedEffect(state.messages.size) {
        if (state.messages.isNotEmpty()) listState.animateScrollToItem(state.messages.lastIndex)
    }

    LaunchedEffect(Unit) {
        while (true) {
            delay(MESSAGES_POLL_INTERVAL_MS)
            viewModel.poll()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mağaza ile mesajlaş") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Geri")
                    }
                },
            )
        },
        bottomBar = {
            MessageInput(
                value = state.draft,
                sending = state.sending,
                onChange = viewModel::onDraftChange,
                onSend = viewModel::send,
            )
        },
    ) { padding ->
        when {
            state.loading && state.messages.isEmpty() -> LoadingState(Modifier.padding(padding))
            state.messages.isEmpty() -> Box(
                Modifier.fillMaxSize().padding(padding).padding(Spacing.xl),
                Alignment.Center,
            ) {
                Text(
                    "Henüz mesaj yok. Bir soru yazabilirsin.",
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center,
                )
            }
            else -> LazyColumn(
                state = listState,
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(Spacing.lg),
                verticalArrangement = Arrangement.spacedBy(Spacing.sm),
            ) {
                items(state.messages, key = { it.id }) { message -> MessageBubble(message) }
            }
        }
    }
}

@Composable
private fun MessageBubble(message: Message) {
    val fromCustomer = message.sender == MessageSender.USER
    val bubbleColor = if (fromCustomer) {
        MaterialTheme.colorScheme.primary
    } else {
        MaterialTheme.colorScheme.surfaceVariant
    }
    val textColor = if (fromCustomer) {
        MaterialTheme.colorScheme.onPrimary
    } else {
        MaterialTheme.colorScheme.onSurfaceVariant
    }
    Row(
        Modifier.fillMaxWidth(),
        horizontalArrangement = if (fromCustomer) Arrangement.End else Arrangement.Start,
    ) {
        Text(
            message.content,
            color = textColor,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(bubbleColor)
                .padding(horizontal = Spacing.md, vertical = Spacing.sm),
        )
    }
}

@Composable
private fun MessageInput(
    value: String,
    sending: Boolean,
    onChange: (String) -> Unit,
    onSend: () -> Unit,
) {
    Surface(shadowElevation = 8.dp) {
        Row(
            Modifier.fillMaxWidth().padding(Spacing.sm),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
        ) {
            OutlinedTextField(
                value = value,
                onValueChange = onChange,
                placeholder = { Text("Mesaj yaz") },
                modifier = Modifier.weight(1f),
                maxLines = 4,
            )
            IconButton(onClick = onSend, enabled = value.isNotBlank() && !sending) {
                Icon(Icons.AutoMirrored.Filled.Send, "Gönder")
            }
        }
    }
}
