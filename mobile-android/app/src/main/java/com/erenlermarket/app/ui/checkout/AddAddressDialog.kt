package com.erenlermarket.app.ui.checkout

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Checkbox
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.domain.model.NewAddress

@Composable
fun AddAddressDialog(
    onDismiss: () -> Unit,
    onSave: (NewAddress) -> Unit,
) {
    var label by remember { mutableStateOf("") }
    var fullAddress by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var district by remember { mutableStateOf("") }
    var isDefault by remember { mutableStateOf(false) }

    val valid = label.isNotBlank() && fullAddress.isNotBlank() &&
        city.isNotBlank() && district.isNotBlank()

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Yeni adres") },
        text = {
            Column(
                Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(Spacing.sm),
            ) {
                Field(label, "Başlık (Ev, İş...)") { label = it }
                Field(fullAddress, "Açık adres", singleLine = false) { fullAddress = it }
                Field(city, "İl") { city = it }
                Field(district, "İlçe") { district = it }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = isDefault, onCheckedChange = { isDefault = it })
                    Text("Varsayılan adres yap")
                }
            }
        },
        confirmButton = {
            TextButton(
                enabled = valid,
                onClick = {
                    onSave(NewAddress(label, fullAddress, city, district, isDefault))
                },
            ) { Text("Kaydet") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Vazgeç") } },
    )
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
