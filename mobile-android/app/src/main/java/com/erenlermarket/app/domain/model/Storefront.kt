package com.erenlermarket.app.domain.model

data class StoreProfile(
    val name: String,
    val city: String?,
    val tagline: String?,
    val description: String?,
    val phone: String?,
    val address: String?,
    val logoUrl: String?,
    val coverImageUrl: String?,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val deliveryRadiusKm: Double? = null,
) {
    /** Üç alan da doluysa teslimat bölgesi, yoksa null (kısıt yok). */
    val deliveryArea: DeliveryArea?
        get() {
            val lat = latitude ?: return null
            val lng = longitude ?: return null
            val r = deliveryRadiusKm ?: return null
            return if (r > 0) DeliveryArea(lat, lng, r) else null
        }
}

data class DeliveryArea(
    val latitude: Double,
    val longitude: Double,
    val radiusKm: Double,
) {
    fun contains(lat: Double, lng: Double): Boolean =
        haversineKm(latitude, longitude, lat, lng) <= radiusKm
}

data class Announcement(
    val id: String,
    val title: String,
    val content: String,
    val imageUrl: String?,
)
