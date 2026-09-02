package com.erenlermarket.app.data.remote

import kotlinx.serialization.SerializationException
import retrofit2.HttpException
import java.io.IOException

/** UI'ya taşınabilir hata. */
class ApiException(
    val kind: Kind,
    override val message: String,
    val statusCode: Int? = null,
) : Exception(message) {

    enum class Kind { NETWORK, HTTP, DECODING, UNAUTHORIZED, UNKNOWN }

    val isUnauthorized: Boolean get() = kind == Kind.UNAUTHORIZED

    companion object {
        fun from(throwable: Throwable): ApiException = when (throwable) {
            is ApiException -> throwable
            is HttpException -> {
                val code = throwable.code()
                ApiException(
                    kind = if (code == 401) Kind.UNAUTHORIZED else Kind.HTTP,
                    message = serverMessage(throwable) ?: httpFallback(code),
                    statusCode = code,
                )
            }
            is IOException -> ApiException(Kind.NETWORK, "İnternet bağlantını kontrol et")
            is SerializationException -> ApiException(Kind.DECODING, "Beklenmeyen bir yanıt alındı")
            else -> ApiException(Kind.UNKNOWN, "Bir şeyler ters gitti")
        }

        private fun serverMessage(exception: HttpException): String? =
            runCatching {
                val body = exception.response()?.errorBody()?.string().orEmpty()
                Regex("\"message\"\\s*:\\s*\"([^\"]+)\"").find(body)?.groupValues?.get(1)
            }.getOrNull()

        private fun httpFallback(code: Int): String = when (code) {
            in 500..599 -> "Sunucu şu an yanıt vermiyor"
            403 -> "Bu işlem için yetkin yok"
            404 -> "İçerik bulunamadı"
            else -> "İstek tamamlanamadı ($code)"
        }
    }
}

/** Repository çağrılarını `ApiException`'a normalize eder. */
internal inline fun <T> apiCall(block: () -> T): T =
    try {
        block()
    } catch (throwable: Throwable) {
        throw ApiException.from(throwable)
    }
