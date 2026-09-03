package com.erenlermarket.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStore

/**
 * Uygulamanın tek yerel tercih deposu ("prefs"). Tema, dil gibi cihazda kalan
 * (backend'e senkronlanmayan) ayarlar buraya yazılır. Bir process'te bir isim
 * için TEK DataStore örneği olabildiğinden ortak bir extension kullanılır.
 */
internal val Context.appPreferences: DataStore<Preferences> by preferencesDataStore(name = "prefs")
