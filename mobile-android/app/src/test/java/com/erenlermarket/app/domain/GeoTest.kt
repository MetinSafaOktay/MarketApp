package com.erenlermarket.app.domain

import com.erenlermarket.app.domain.model.DeliveryArea
import com.erenlermarket.app.domain.model.StoreProfile
import com.erenlermarket.app.domain.model.haversineKm
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class GeoTest {

    @Test fun `same point is zero`() {
        assertEquals(0.0, haversineKm(38.75, 30.54, 38.75, 30.54), 0.0)
    }

    @Test fun `one degree latitude is about 111 km`() {
        val d = haversineKm(38.0, 30.0, 39.0, 30.0)
        assertTrue(d in 110.0..112.0)
    }

    @Test fun `delivery area contains inside and rejects outside`() {
        val area = DeliveryArea(38.7569, 30.5387, 5.0)
        assertTrue(area.contains(38.7569 + 0.02, 30.5387)) // ~2.2 km
        assertFalse(area.contains(38.7569 + 0.1, 30.5387)) // ~11 km
    }

    @Test fun `store delivery area needs all three fields`() {
        fun store(lat: Double?, lng: Double?, r: Double?) = StoreProfile(
            name = "X", city = null, tagline = null, description = null,
            phone = null, address = null, logoUrl = null, coverImageUrl = null,
            latitude = lat, longitude = lng, deliveryRadiusKm = r,
        )
        assertNotNull(store(38.7, 30.5, 4.0).deliveryArea)
        assertNull(store(38.7, null, 4.0).deliveryArea)
        assertNull(store(38.7, 30.5, 0.0).deliveryArea)
    }
}
