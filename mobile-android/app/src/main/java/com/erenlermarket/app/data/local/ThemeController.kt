package com.erenlermarket.app.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.erenlermarket.app.di.AppScope
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

enum class ThemeMode {
    SYSTEM,
    LIGHT,
    DARK,
    ;

    val label: String
        get() = when (this) {
            SYSTEM -> "Sistem"
            LIGHT -> "Açık"
            DARK -> "Koyu"
        }
}

/** Uygulama teması — yerel tercih (backend'e senkronlanmaz). */
@Singleton
class ThemeController @Inject constructor(
    @ApplicationContext context: Context,
    @AppScope private val scope: CoroutineScope,
) {

    private val dataStore = context.appPreferences

    val mode: StateFlow<ThemeMode> = dataStore.data
        .map { prefs ->
            runCatching { ThemeMode.valueOf(prefs[KEY] ?: ThemeMode.SYSTEM.name) }
                .getOrDefault(ThemeMode.SYSTEM)
        }
        .stateIn(scope, SharingStarted.Eagerly, ThemeMode.SYSTEM)

    fun set(mode: ThemeMode) {
        scope.launch { dataStore.edit { it[KEY] = mode.name } }
    }

    private companion object {
        val KEY = stringPreferencesKey("theme_mode")
    }
}
