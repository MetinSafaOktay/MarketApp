package com.erenlermarket.app.data

import java.util.Locale

/** Cihaz dilini backend'in desteklediği koda eşler. */
object AppLanguage {
    private val supported = setOf("tr", "en", "de", "fr", "ar", "nl")
    private const val FALLBACK = "tr"

    val current: String
        get() = Locale.getDefault().language.takeIf { it in supported } ?: FALLBACK
}
