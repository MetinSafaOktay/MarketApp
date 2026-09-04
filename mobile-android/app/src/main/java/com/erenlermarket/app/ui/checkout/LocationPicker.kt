package com.erenlermarket.app.ui.checkout

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.erenlermarket.app.designsystem.Spacing
import com.erenlermarket.app.domain.model.DeliveryArea
import com.erenlermarket.app.domain.model.haversineKm
import com.google.android.gms.location.LocationServices
import org.maplibre.android.MapLibre
import org.maplibre.android.camera.CameraPosition
import org.maplibre.android.camera.CameraUpdateFactory
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.maps.MapView
import org.maplibre.android.maps.Style
import org.maplibre.android.style.layers.FillLayer
import org.maplibre.android.style.layers.LineLayer
import org.maplibre.android.style.layers.PropertyFactory
import org.maplibre.android.style.sources.GeoJsonSource
import org.maplibre.geojson.Feature
import org.maplibre.geojson.Point
import org.maplibre.geojson.Polygon
import kotlin.math.cos
import kotlin.math.sin

// Ücretsiz, anahtarsız vektör tile stili.
private const val STYLE_URL = "https://tiles.openfreemap.org/styles/bright"
// Konum bilinmiyorsa harita buraya ortalanır (Afyonkarahisar merkez).
private val FALLBACK = LatLng(38.7507, 30.5433)
private const val CIRCLE_SOURCE = "delivery-area"

/** Dairenin çemberini `steps` noktalı bir polygon'a çevirir. */
private fun circlePolygon(centerLat: Double, centerLng: Double, radiusKm: Double, steps: Int = 64): Polygon {
    val earthRadiusKm = 6371.0
    val latR = Math.toRadians(centerLat)
    val angular = radiusKm / earthRadiusKm
    val ring = (0..steps).map { i ->
        val bearing = Math.toRadians(i * 360.0 / steps)
        val lat2 = Math.asin(
            sin(latR) * cos(angular) + cos(latR) * sin(angular) * cos(bearing),
        )
        val lng2 = Math.toRadians(centerLng) + Math.atan2(
            sin(bearing) * sin(angular) * cos(latR),
            cos(angular) - sin(latR) * sin(lat2),
        )
        Point.fromLngLat(Math.toDegrees(lng2), Math.toDegrees(lat2))
    }
    return Polygon.fromLngLats(listOf(ring))
}

/**
 * Adres için haritadan konum seçimi (MapLibre). Pin ekranın ortasında sabittir;
 * kullanıcı haritayı kaydırır, merkez koordinat `onChange`'e verilir. Teslimat
 * bölgesi (varsa) kesikli daire olarak çizilir.
 */
@SuppressLint("MissingPermission")
@Composable
fun LocationPicker(
    value: LatLng?,
    onChange: (LatLng) -> Unit,
    area: DeliveryArea?,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    remember { MapLibre.getInstance(context) }

    var center by remember { mutableStateOf(value ?: area?.let { LatLng(it.latitude, it.longitude) } ?: FALLBACK) }
    var permissionDenied by remember { mutableStateOf(false) }

    val fillColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f).toArgb()
    val lineColor = MaterialTheme.colorScheme.error.toArgb()

    val mapView = remember {
        MapView(context).apply {
            getMapAsync { map ->
                val start = value ?: area?.let { LatLng(it.latitude, it.longitude) } ?: FALLBACK
                map.cameraPosition = CameraPosition.Builder()
                    .target(start)
                    .zoom(if (area != null) 12.0 else 13.0)
                    .build()
                map.setStyle(Style.Builder().fromUri(STYLE_URL)) { style ->
                    if (area != null) {
                        style.addSource(
                            GeoJsonSource(
                                CIRCLE_SOURCE,
                                Feature.fromGeometry(
                                    circlePolygon(area.latitude, area.longitude, area.radiusKm),
                                ),
                            ),
                        )
                        style.addLayer(
                            FillLayer("$CIRCLE_SOURCE-fill", CIRCLE_SOURCE)
                                .withProperties(PropertyFactory.fillColor(fillColor)),
                        )
                        style.addLayer(
                            LineLayer("$CIRCLE_SOURCE-line", CIRCLE_SOURCE).withProperties(
                                PropertyFactory.lineColor(lineColor),
                                PropertyFactory.lineWidth(1.5f),
                                PropertyFactory.lineDasharray(arrayOf(2f, 2f)),
                            ),
                        )
                    }
                }
                map.addOnCameraIdleListener {
                    val t = map.cameraPosition.target ?: return@addOnCameraIdleListener
                    center = t
                    onChange(t)
                }
            }
        }
    }

    // MapView yaşam döngüsünü Compose'a bağla.
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_CREATE -> mapView.onCreate(null)
                Lifecycle.Event.ON_START -> mapView.onStart()
                Lifecycle.Event.ON_RESUME -> mapView.onResume()
                Lifecycle.Event.ON_PAUSE -> mapView.onPause()
                Lifecycle.Event.ON_STOP -> mapView.onStop()
                Lifecycle.Event.ON_DESTROY -> mapView.onDestroy()
                else -> Unit
            }
        }
        mapView.onCreate(null)
        mapView.onStart()
        mapView.onResume()
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            mapView.onPause()
            mapView.onStop()
            mapView.onDestroy()
        }
    }

    fun moveToCurrentLocation() {
        LocationServices.getFusedLocationProviderClient(context).lastLocation
            .addOnSuccessListener { loc ->
                if (loc != null) {
                    mapView.getMapAsync { map ->
                        map.animateCamera(
                            CameraUpdateFactory.newLatLngZoom(LatLng(loc.latitude, loc.longitude), 15.0),
                        )
                    }
                }
            }
    }

    val permLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions(),
    ) { result ->
        if (result.values.any { it }) moveToCurrentLocation() else permissionDenied = true
    }

    fun onUseMyLocation() {
        val granted = ContextCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_FINE_LOCATION,
        ) == PackageManager.PERMISSION_GRANTED
        if (granted) {
            moveToCurrentLocation()
        } else {
            permLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION,
                ),
            )
        }
    }

    val distanceKm = area?.let { haversineKm(it.latitude, it.longitude, center.latitude, center.longitude) }
    val outside = area != null && distanceKm != null && distanceKm > area.radiusKm

    Column(modifier, verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
        Box(Modifier.fillMaxWidth().height(240.dp)) {
            AndroidView(factory = { mapView }, modifier = Modifier.fillMaxWidth().height(240.dp))
            // Sabit merkez pini
            Icon(
                Icons.Filled.LocationOn,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.error,
                modifier = Modifier.align(Alignment.Center).padding(bottom = 28.dp),
            )
            OutlinedButton(
                onClick = ::onUseMyLocation,
                modifier = Modifier.align(Alignment.TopStart).padding(Spacing.sm),
            ) {
                Icon(Icons.Filled.MyLocation, null, modifier = Modifier.height(16.dp))
                Text(" Konumumu kullan", style = MaterialTheme.typography.labelMedium)
            }
        }
        Text(
            "Haritayı kaydırarak pini tam konumunuza getirin." +
                (distanceKm?.let { " Mağazaya ~%.1f km.".format(it) } ?: ""),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        if (outside && area != null) {
            Text(
                "Bu konum teslimat bölgesinin dışında (en fazla ${area.radiusKm.toInt()} km).",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.error,
                fontWeight = FontWeight.Medium,
            )
        }
        if (permissionDenied) {
            Text(
                "Konum izni verilmedi. Haritayı elle kaydırabilirsiniz.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
