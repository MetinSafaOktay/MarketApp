package com.erenlermarket.app.ui.common

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedIconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.ui.cart.CartBadgeViewModel
import com.erenlermarket.app.ui.wishlist.WishlistToggleViewModel

/** Sepet rozeti olan üst çubuk butonu (rozet sayısını kendi çeker). */
@Composable
fun CartActionButton(
    onClick: () -> Unit,
    viewModel: CartBadgeViewModel = hiltViewModel(),
) {
    val count by viewModel.count.collectAsStateWithLifecycle()
    IconButton(onClick = onClick) {
        BadgedBox(
            badge = {
                if (count > 0) {
                    Badge { Text(if (count > 99) "99+" else count.toString()) }
                }
            },
        ) {
            Icon(Icons.Filled.ShoppingCart, "Sepet")
        }
    }
}

/** Ürünü istek listesine ekleyen/çıkaran kalp. Oturum yoksa gizlenir. */
@Composable
fun WishlistIconButton(
    productId: String,
    modifier: Modifier = Modifier,
    viewModel: WishlistToggleViewModel = hiltViewModel(),
) {
    val enabled by viewModel.enabled.collectAsStateWithLifecycle()
    if (!enabled) return
    val ids by viewModel.ids.collectAsStateWithLifecycle()
    val on = productId in ids
    IconButton(onClick = { viewModel.toggle(productId) }, modifier = modifier) {
        Icon(
            if (on) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
            contentDescription = if (on) "İstek listesinden çıkar" else "İstek listesine ekle",
            tint = if (on) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

/** -/adet/+ sayaç. Adet 1 iken azaltma butonu çöp kutusu olur. */
@Composable
fun QuantityStepper(
    quantity: Int,
    onDecrease: () -> Unit,
    onIncrease: () -> Unit,
    modifier: Modifier = Modifier,
    canIncrease: Boolean = true,
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        OutlinedIconButton(
            onClick = onDecrease,
            shape = RoundedCornerShape(Spacing.sm),
            modifier = Modifier.size(36.dp),
        ) {
            Icon(
                if (quantity <= 1) Icons.Outlined.Delete else Icons.Filled.Remove,
                contentDescription = if (quantity <= 1) "Kaldır" else "Azalt",
                modifier = Modifier.size(18.dp),
            )
        }
        Text(
            quantity.toString(),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.widthIn(min = 40.dp),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
        )
        OutlinedIconButton(
            onClick = onIncrease,
            enabled = canIncrease,
            shape = RoundedCornerShape(Spacing.sm),
            modifier = Modifier.size(36.dp),
        ) {
            Icon(Icons.Filled.Add, "Artır", modifier = Modifier.size(18.dp))
        }
    }
}
