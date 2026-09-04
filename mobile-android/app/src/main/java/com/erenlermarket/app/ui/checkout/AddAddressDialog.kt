package com.erenlermarket.app.ui.checkout

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.domain.model.DeliveryArea
import com.erenlermarket.app.domain.model.NewAddress
import org.maplibre.android.geometry.LatLng

@Composable
fun AddAddressDialog(
    deliveryArea: DeliveryArea?,
    onDismiss: () -> Unit,
    onSave: (NewAddress) -> Unit,
) {
    var label by remember { mutableStateOf("") }
    var fullAddress by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("Afyonkarahisar") }
    var district by remember { mutableStateOf("") }
    var isDefault by remember { mutableStateOf(false) }
    var coordinate by remember { mutableStateOf<LatLng?>(null) }

    val outside = deliveryArea != null && coordinate != null &&
        !deliveryArea.contains(coordinate!!.latitude, coordinate!!.longitude)

    val valid = label.isNotBlank() && fullAddress.isNotBlank() &&
        city.isNotBlank() && district.isNotBlank() && coordinate != null && !outside

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false),
    ) {
        Surface(Modifier.fillMaxSize()) {
            Column(Modifier.fillMaxSize()) {
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = Spacing.sm, vertical = Spacing.xs),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    TextButton(onClick = onDismiss) { Text("Vazgeç") }
                    Text("Yeni adres", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                    TextButton(
                        enabled = valid,
                        onClick = {
                            onSave(
                                NewAddress(
                                    label = label.trim(),
                                    fullAddress = fullAddress.trim(),
                                    city = city.trim(),
                                    district = district.trim(),
                                    isDefault = isDefault,
                                    latitude = coordinate?.latitude,
                                    longitude = coordinate?.longitude,
                                ),
                            )
                        },
                    ) { Text("Kaydet") }
                }

                Column(
                    Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(Spacing.lg),
                    verticalArrangement = Arrangement.spacedBy(Spacing.md),
                ) {
                    Field(label, "Başlık (Ev, İş...)") { label = it }
                    Field(fullAddress, "Açık adres", singleLine = false) { fullAddress = it }
                    Field(city, "İl") { city = it }
                    Field(district, "İlçe") { district = it }

                    LocationPicker(
                        value = coordinate,
                        onChange = { coordinate = it },
                        area = deliveryArea,
                    )

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = isDefault, onCheckedChange = { isDefault = it })
                        Text("Varsayılan adres yap")
                    }
                    Box(Modifier.padding(bottom = 24.dp))
                }
            }
        }
    }
}

@Composable
private fun Field(
    value: String,
    label: String,
    singleLine: Boolean = true,
    onChange: (String) -> Unit,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        label = { Text(label) },
        singleLine = singleLine,
        modifier = Modifier.fillMaxWidth(),
    )
}
