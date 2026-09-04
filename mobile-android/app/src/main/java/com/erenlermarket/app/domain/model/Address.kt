package com.erenlermarket.app.domain.model

data class Address(
    val id: String,
    val label: String,
    val fullAddress: String,
    val city: String,
    val district: String,
    val buildingName: String = "",
    val buildingNo: String = "",
    val floor: String = "",
    val apartmentNo: String = "",
    val isDefault: Boolean,
    val latitude: Double? = null,
    val longitude: Double? = null,
) {
    val summary: String get() = "$district, $city"

    /** "Erenler Apt, No 12, Kat 3, Daire 7" — boş alanlar atlanır. */
    val buildingLine: String
        get() = listOfNotNull(
            buildingName.takeIf { it.isNotBlank() },
            buildingNo.takeIf { it.isNotBlank() }?.let { "No $it" },
            floor.takeIf { it.isNotBlank() }?.let { "Kat $it" },
            apartmentNo.takeIf { it.isNotBlank() }?.let { "Daire $it" },
        ).joinToString(", ")
}

/** Yeni adres girdisi. */
data class NewAddress(
    val label: String,
    val fullAddress: String,
    val city: String,
    val district: String,
    val buildingName: String = "",
    val buildingNo: String = "",
    val floor: String = "",
    val apartmentNo: String = "",
    val isDefault: Boolean = false,
    val latitude: Double? = null,
    val longitude: Double? = null,
)
