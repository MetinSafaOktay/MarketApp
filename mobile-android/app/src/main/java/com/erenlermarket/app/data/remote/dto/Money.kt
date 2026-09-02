package com.erenlermarket.app.data.remote.dto

import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.JsonDecoder
import kotlinx.serialization.json.jsonPrimitive
import java.math.BigDecimal

/**
 * Para alanları: sepet/checkout-preview sayı, sipariş uçları string döndürüyor.
 * İki biçimi de kabul eder.
 */
object MoneySerializer : KSerializer<BigDecimal> {
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("Money", PrimitiveKind.STRING)

    override fun deserialize(decoder: Decoder): BigDecimal {
        val raw = if (decoder is JsonDecoder) {
            decoder.decodeJsonElement().jsonPrimitive.content
        } else {
            decoder.decodeString()
        }
        return raw.toBigDecimalOrNull() ?: BigDecimal.ZERO
    }

    override fun serialize(encoder: Encoder, value: BigDecimal) {
        encoder.encodeString(value.toPlainString())
    }
}
