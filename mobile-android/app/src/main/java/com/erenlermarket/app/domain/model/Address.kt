package com.erenlermarket.app.domain.model

data class Address(
    val id: String,
    val label: String,
    val fullAddress: String,
    val city: String,
    val district: String,
    val isDefault: Boolean,
    val latitude: Double? = null,
    val longitude: Double? = null,
) {
    val summary: String get() = "$district, $city"
}

/** Yeni adres girdisi. */
data class NewAddress(
    val label: String,
    val fullAddress: String,
    val city: String,
    val district: String,
    val isDefault: Boolean = false,
    val latitude: Double? = null,
    val longitude: Double? = null,
)
