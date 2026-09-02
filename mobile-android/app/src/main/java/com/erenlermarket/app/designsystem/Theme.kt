package com.erenlermarket.app.designsystem

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp

/** Ortak kenar boşlukları (iOS `Spacing` karşılığı). */
object Spacing {
    val xs = 4.dp
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 24.dp
    val xxl = 32.dp
}

object Radius {
    val card = 12.dp
    val button = 10.dp
}

private val DarkColors = darkColorScheme(
    primary = Palette.AccentDark,
    onPrimary = Palette.OnAccentDark,
    primaryContainer = Palette.SurfaceElevatedDark,
    onPrimaryContainer = Palette.AccentDark,
    secondary = Palette.AccentDark,
    onSecondary = Palette.OnAccentDark,
    secondaryContainer = Palette.SurfaceElevatedDark,
    onSecondaryContainer = Palette.AccentDark,
    background = Palette.BackgroundDark,
    onBackground = Palette.TextDark,
    surface = Palette.SurfaceDark,
    onSurface = Palette.TextDark,
    surfaceContainer = Palette.SurfaceDark,
    surfaceVariant = Palette.SurfaceElevatedDark,
    onSurfaceVariant = Palette.TextMutedDark,
    outline = Palette.BorderDark,
    outlineVariant = Palette.BorderDark,
    error = Palette.Danger,
    onError = Palette.OnAccentLight,
)

private val LightColors = lightColorScheme(
    primary = Palette.AccentLight,
    onPrimary = Palette.OnAccentLight,
    primaryContainer = Palette.SurfaceElevatedLight,
    onPrimaryContainer = Palette.AccentLight,
    secondary = Palette.AccentLight,
    onSecondary = Palette.OnAccentLight,
    secondaryContainer = Palette.SurfaceElevatedLight,
    onSecondaryContainer = Palette.AccentLight,
    background = Palette.BackgroundLight,
    onBackground = Palette.TextLight,
    surface = Palette.SurfaceLight,
    onSurface = Palette.TextLight,
    surfaceContainer = Palette.SurfaceLight,
    surfaceVariant = Palette.SurfaceElevatedLight,
    onSurfaceVariant = Palette.TextMutedLight,
    outline = Palette.BorderLight,
    outlineVariant = Palette.BorderLight,
    error = Palette.Danger,
    onError = Palette.OnAccentLight,
)

@Composable
fun ErenlerTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = ErenlerTypography,
        content = content,
    )
}
