package com.erenlermarket.app.ui.checkout

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.erenlermarket.app.designsystem.Spacing

@Composable
fun OrderPlacedScreen(
    onViewOrder: () -> Unit,
    onContinueShopping: () -> Unit,
) {
    Column(
        Modifier.fillMaxSize().padding(Spacing.xl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(
            Icons.Filled.CheckCircle,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(72.dp),
        )
        Text(
            "Siparişin alındı!",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(top = Spacing.lg),
        )
        Text(
            "Hazır olduğunda seni haberdar edeceğiz. Ödemeyi teslimatta yapacaksın.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = Spacing.sm),
        )
        Button(
            onClick = onViewOrder,
            modifier = Modifier.padding(top = Spacing.xl),
        ) {
            Text("Siparişi gör")
        }
        OutlinedButton(onClick = onContinueShopping, modifier = Modifier.padding(top = Spacing.sm)) {
            Text("Alışverişe devam et")
        }
    }
}
