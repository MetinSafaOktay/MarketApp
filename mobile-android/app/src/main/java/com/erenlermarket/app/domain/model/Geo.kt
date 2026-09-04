package com.erenlermarket.app.domain.model

import kotlin.math.asin
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

private const val EARTH_RADIUS_KM = 6371.0

private fun Double.toRad(): Double = this * Math.PI / 180.0

/** İki koordinat arası kuş uçuşu mesafe (km). Backend'deki haversineKm ile aynı. */
fun haversineKm(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
    val dLat = (lat2 - lat1).toRad()
    val dLon = (lon2 - lon1).toRad()
    val a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1.toRad()) * cos(lat2.toRad()) * sin(dLon / 2) * sin(dLon / 2)
    return 2 * EARTH_RADIUS_KM * asin(min(1.0, sqrt(a)))
}
