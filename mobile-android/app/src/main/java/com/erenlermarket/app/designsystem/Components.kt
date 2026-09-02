package com.erenlermarket.app.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.draw.clip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.SubcomposeAsyncImage
import java.math.BigDecimal
import java.text.NumberFormat
import java.util.Locale

private val currencyFormat: NumberFormat =
    NumberFormat.getCurrencyInstance(Locale("tr", "TR")).apply { maximumFractionDigits = 2 }

fun formatMoney(amount: BigDecimal): String = currencyFormat.format(amount)

enum class BadgeStyle { ACCENT, DANGER, NEUTRAL }

@Composable
fun Badge(text: String, modifier: Modifier = Modifier, style: BadgeStyle = BadgeStyle.ACCENT) {
    val scheme = MaterialTheme.colorScheme
    val (bg, fg) = when (style) {
        BadgeStyle.ACCENT -> scheme.primary to scheme.onPrimary
        BadgeStyle.DANGER -> scheme.error to Color.White
        BadgeStyle.NEUTRAL -> scheme.surfaceVariant to scheme.onSurfaceVariant
    }
    Text(
        text = text,
        style = MaterialTheme.typography.labelSmall,
        fontWeight = FontWeight.Bold,
        color = fg,
        modifier = modifier
            .background(bg, RoundedCornerShape(Radius.button))
            .padding(horizontal = Spacing.sm, vertical = Spacing.xs),
    )
}

@Composable
fun SectionHeader(
    title: String,
    modifier: Modifier = Modifier,
    trailing: @Composable (() -> Unit)? = null,
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
        )
        trailing?.invoke()
    }
}

/** Coil tabanlı uzak görsel; yüklenirken ve hata durumunda yer tutucu gösterir. */
@Composable
fun RemoteImage(
    url: String?,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop,
    fallbackIcon: ImageVector? = null,
) {
    val scheme = MaterialTheme.colorScheme
    SubcomposeAsyncImage(
        model = url,
        contentDescription = contentDescription,
        contentScale = contentScale,
        modifier = modifier,
        loading = { Box(Modifier.fillMaxSize().background(scheme.surfaceVariant)) },
        error = {
            Box(Modifier.fillMaxSize().background(scheme.surfaceVariant), Alignment.Center) {
                if (fallbackIcon != null) {
                    Icon(fallbackIcon, null, tint = scheme.onSurfaceVariant)
                }
            }
        },
    )
}

/** Kart yüzeyi: surface + kenarlık + köşe yuvarlama. */
@Composable
fun Modifier.cardSurface(): Modifier {
    val scheme = MaterialTheme.colorScheme
    return this
        .clip(RoundedCornerShape(Radius.card))
        .background(scheme.surface)
        .border(1.dp, scheme.outline, RoundedCornerShape(Radius.card))
}
