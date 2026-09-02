package com.erenlermarket.app.ui.common

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Image
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.erenlermarket.app.designsystem.Badge
import com.erenlermarket.app.designsystem.BadgeStyle
import com.erenlermarket.app.designsystem.Radius
import com.erenlermarket.app.designsystem.RemoteImage
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.designsystem.cardSurface
import com.erenlermarket.app.designsystem.formatMoney
import com.erenlermarket.app.domain.model.Product

@Composable
fun ProductCard(
    product: Product,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    showWishlist: Boolean = false,
) {
    Column(
        modifier = modifier
            .cardSurface()
            .clickable(onClick = onClick)
            .padding(Spacing.sm),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        Box(
            Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(RoundedCornerShape(Radius.button)),
        ) {
            RemoteImage(
                url = product.imageUrls.firstOrNull(),
                contentDescription = product.name,
                modifier = Modifier.fillMaxWidth().aspectRatio(1f),
                fallbackIcon = Icons.Outlined.Image,
            )
            Column(
                Modifier.padding(Spacing.xs),
                verticalArrangement = Arrangement.spacedBy(Spacing.xs),
            ) {
                product.discountPercent?.let { percent ->
                    Badge("−%$percent", style = BadgeStyle.DANGER)
                }
                if (product.isNewArrival) Badge("Yeni")
            }
            if (!product.isInStock) {
                Badge(
                    "Stok yok",
                    Modifier.align(Alignment.BottomEnd).padding(Spacing.xs),
                    BadgeStyle.NEUTRAL,
                )
            }
            if (showWishlist) {
                WishlistIconButton(
                    productId = product.id,
                    modifier = Modifier.align(Alignment.TopEnd),
                )
            }
        }

        Text(
            product.name,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )

        Row(
            horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
            verticalAlignment = Alignment.Bottom,
        ) {
            Text(
                formatMoney(product.price),
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Bold,
            )
            if (product.isDiscounted && product.originalPrice != null) {
                Text(
                    formatMoney(product.originalPrice),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textDecoration = TextDecoration.LineThrough,
                )
            }
        }
    }
}
