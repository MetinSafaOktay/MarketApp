package com.erenlermarket.app.ui.productlist

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.domain.model.ProductQuery
import com.erenlermarket.app.domain.model.ProductSort

private val sortLabels = listOf(
    ProductSort.NEWEST to "En yeni",
    ProductSort.PRICE_ASC to "Fiyat: düşükten yükseğe",
    ProductSort.PRICE_DESC to "Fiyat: yüksekten düşüğe",
)

@Composable
fun FilterSheet(
    query: ProductQuery,
    onApply: (ProductSort, Boolean, Boolean, Boolean) -> Unit,
) {
    var sort by remember { mutableStateOf(query.sort) }
    var onlyDiscounted by remember { mutableStateOf(query.onlyDiscounted) }
    var onlyNew by remember { mutableStateOf(query.onlyNew) }
    var inStock by remember { mutableStateOf(query.inStock) }

    Column(
        Modifier
            .fillMaxWidth()
            .padding(horizontal = Spacing.lg)
            .padding(bottom = Spacing.xxl),
        verticalArrangement = Arrangement.spacedBy(Spacing.sm),
    ) {
        Text("Sıralama", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        sortLabels.forEach { (value, label) ->
            Row(
                Modifier
                    .fillMaxWidth()
                    .selectable(selected = sort == value, onClick = { sort = value })
                    .padding(vertical = Spacing.xs),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                RadioButton(selected = sort == value, onClick = { sort = value })
                Text(label, Modifier.padding(start = Spacing.sm))
            }
        }

        Text(
            "Filtreler",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(top = Spacing.md),
        )
        SwitchRow("Sadece indirimli", onlyDiscounted) { onlyDiscounted = it }
        SwitchRow("Sadece yeni ürünler", onlyNew) { onlyNew = it }
        SwitchRow("Sadece stokta olanlar", inStock) { inStock = it }

        Row(
            Modifier.fillMaxWidth().padding(top = Spacing.md),
            horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
        ) {
            TextButton(onClick = {
                sort = ProductSort.NEWEST
                onlyDiscounted = false
                onlyNew = false
                inStock = false
            }) { Text("Sıfırla") }
            Button(
                onClick = { onApply(sort, onlyDiscounted, onlyNew, inStock) },
                modifier = Modifier.weight(1f),
            ) { Text("Uygula") }
        }
    }
}

@Composable
private fun SwitchRow(label: String, checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = Spacing.xs),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label)
        Switch(checked = checked, onCheckedChange = onChange)
    }
}
