package com.erenlermarket.app.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.erenlermarket.app.data.AppLanguage
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

/**
 * İçerik dili tercihi — yerel (backend'e senkronlanmaz, tema gibi). Varsayılan
 * Türkçe. Seçilen kod ayrıca [AppLanguage.current]'a yazılır ki `LanguageInterceptor`
 * DI olmadan okuyabilsin.
 */
@Singleton
class LanguageController @Inject constructor(
    @ApplicationContext context: Context,
    @AppScope private val scope: CoroutineScope,
) {

    private val dataStore = context.appPreferences

    val code: StateFlow<String> = dataStore.data
        .map { prefs ->
            prefs[KEY]?.takeIf { it in AppLanguage.supported } ?: AppLanguage.DEFAULT
        }
        .stateIn(scope, SharingStarted.Eagerly, AppLanguage.DEFAULT)

    init {
        // Interceptor'ın gördüğü process içi kopyayı senkron tut.
        scope.launch { code.collect { AppLanguage.current = it } }
    }

    fun set(code: String) {
        if (code !in AppLanguage.supported) return
        scope.launch { dataStore.edit { it[KEY] = code } }
    }

    private companion object {
        val KEY = stringPreferencesKey("content_language")
    }
}
