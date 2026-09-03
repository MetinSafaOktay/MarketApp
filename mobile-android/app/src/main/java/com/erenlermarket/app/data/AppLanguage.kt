package com.erenlermarket.app.data

/**
 * Backend içeriğinin (ürün adı, kategori, duyuru…) hangi dilde isteneceği.
 * Tema gibi YEREL bir tercih — profile bağlı değil, cihazda kalır.
 * Gerçek kaynak `LanguageController` (DataStore); burası sadece ağ
 * interceptor'ının DI'sız okuyabilmesi için tutulan process içi kopya.
 * Varsayılan Türkçe.
 */
object AppLanguage {
    /** Backend'in desteklediği diller (yerel adlarıyla). */
    val supported = listOf("tr", "en", "de", "fr", "ar", "nl")

    const val DEFAULT = "tr"

    @Volatile
    var current: String = DEFAULT
        internal set

    /** Ayarlar ekranında gösterilecek yerel dil adı. */
    fun displayName(code: String): String = when (code) {
        "tr" -> "Türkçe"
        "en" -> "English"
        "de" -> "Deutsch"
        "fr" -> "Français"
        "ar" -> "العربية"
        "nl" -> "Nederlands"
        else -> code
    }
}
