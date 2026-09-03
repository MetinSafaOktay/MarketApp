package com.erenlermarket.app

import android.app.Application
import com.erenlermarket.app.data.local.LanguageController
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class ErenlerApp : Application() {

    // Süreç başında oluşturulsun ki kayıtlı dil tercihi ilk ağ isteğinden önce
    // AppLanguage.current'a yüklensin.
    @Inject
    lateinit var languageController: LanguageController
}
