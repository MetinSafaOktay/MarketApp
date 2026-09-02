package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.AppLanguage
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Provider

/** Her isteğe `?lang=` ekler (yoksa). */
class LanguageInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        if (original.url.queryParameter("lang") != null) return chain.proceed(original)
        val url = original.url.newBuilder()
            .addQueryParameter("lang", AppLanguage.current)
            .build()
        return chain.proceed(original.newBuilder().url(url).build())
    }
}

/** Oturum token'ını sağlar. A3'te gerçek oturum deposuyla değiştirilir. */
interface TokenProvider {
    fun accessToken(): String?
}

/**
 * Varsa `Authorization: Bearer` başlığı ekler.
 * `Provider` ile alınır çünkü token sağlayıcısı (SessionManager) OkHttp grafiğine
 * bağımlı — doğrudan enjekte edilirse Dagger döngüsü oluşur.
 */
class AuthInterceptor(private val tokenProvider: Provider<TokenProvider>) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenProvider.get().accessToken() ?: return chain.proceed(chain.request())
        val request = chain.request().newBuilder()
            .header("Authorization", "Bearer $token")
            .build()
        return chain.proceed(request)
    }
}
