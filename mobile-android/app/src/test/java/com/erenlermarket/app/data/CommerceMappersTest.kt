package com.erenlermarket.app.data

import com.erenlermarket.app.data.remote.toDomain
import com.erenlermarket.app.data.remote.toRequest
import com.erenlermarket.app.data.remote.dto.AddressDto
import com.erenlermarket.app.domain.model.NewAddress
import com.erenlermarket.app.domain.model.DiscountType
import com.erenlermarket.app.domain.model.OrderStatus
import com.erenlermarket.app.domain.model.PaymentMethod
import kotlinx.serialization.json.Json
import com.erenlermarket.app.data.remote.dto.CheckoutPreviewDto
import com.erenlermarket.app.data.remote.dto.OrderDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.math.BigDecimal

class CommerceMappersTest {

    private val json = Json { ignoreUnknownKeys = true; explicitNulls = false; coerceInputValues = true }

    @Test
    fun `checkout preview parses numeric money and maps lines`() {
        val body = """
            {
              "items": [
                {"product_id":"p1","name":"Çay","quantity":2,"unit_price":112,"line_total":224,
                 "in_stock":true,"stock_quantity":10}
              ],
              "subtotal": 224,
              "discount_amount": 24.5,
              "total": 199.5,
              "coupon": {"code":"HOSGELDIN","discount_type":"percentage","discount_value":10},
              "coupon_error": null,
              "has_stock_issues": false
            }
        """.trimIndent()

        val preview = json.decodeFromString(CheckoutPreviewDto.serializer(), body).toDomain()

        assertEquals(BigDecimal("224"), preview.subtotal)
        assertEquals(BigDecimal("199.5"), preview.total)
        assertEquals(1, preview.lines.size)
        assertEquals(BigDecimal("112"), preview.lines[0].unitPrice)
        assertEquals(DiscountType.PERCENTAGE, preview.coupon?.discountType)
        assertFalse(preview.hasStockIssues)
    }

    @Test
    fun `order parses string money and status`() {
        val body = """
            {
              "id": "11112222-3333-4444-5555-666677778888",
              "status": "preparing",
              "payment_method": "cash_on_delivery",
              "subtotal": "224.00",
              "discount_amount": "0.00",
              "total_amount": "224.00",
              "created_at": "2026-09-02T10:00:00.000Z",
              "order_items": [
                {"id":"oi1","product_id":"p1","quantity":2,"unit_price_snapshot":"112.00",
                 "subtotal":"224.00","products":{"id":"p1","category_id":"c1","name":"Çay","sku":"CAY","price":"112.00"}}
              ],
              "order_status_history": [
                {"id":"h1","status":"pending","note":null,"created_at":"2026-09-02T10:00:00.000Z"}
              ],
              "addresses": {"id":"a1","label":"Ev","full_address":"Merkez Mah.","city":"Afyon","district":"Merkez","is_default":true}
            }
        """.trimIndent()

        val order = json.decodeFromString(OrderDto.serializer(), body).toDomain()

        assertEquals(OrderStatus.PREPARING, order.status)
        assertEquals(PaymentMethod.CASH_ON_DELIVERY, order.paymentMethod)
        assertEquals(BigDecimal("224.00"), order.totalAmount)
        assertEquals("Çay", order.lines[0].name)
        assertEquals(2, order.itemCount)
        assertEquals("11112222", order.reference.lowercase())
        assertEquals("Ev", order.address?.label)
        assertEquals(1, order.statusHistory.size)
    }

    @Test
    fun `address maps building fields and builds a building line`() {
        val body = """
            {"id":"a1","label":"Ev","full_address":"Basın Cd.","city":"Afyon","district":"Merkez",
             "building_name":"Erenler Apt","building_no":"12","floor":"3","apartment_no":"7","is_default":false}
        """.trimIndent()

        val address = json.decodeFromString(AddressDto.serializer(), body).toDomain()

        assertEquals("Erenler Apt", address.buildingName)
        assertEquals("7", address.apartmentNo)
        assertEquals("Erenler Apt, No 12, Kat 3, Daire 7", address.buildingLine)
    }

    @Test
    fun `address without building fields has an empty building line`() {
        val body = """
            {"id":"a1","label":"Ev","full_address":"X","city":"Afyon","district":"Merkez","is_default":false}
        """.trimIndent()
        val address = json.decodeFromString(AddressDto.serializer(), body).toDomain()
        assertTrue(address.buildingLine.isEmpty())
    }

    @Test
    fun `new address request trims and forwards building fields`() {
        val req = NewAddress(
            label = "Ev", fullAddress = "X", city = "Afyon", district = "Merkez",
            buildingName = " Erenler Apt ", buildingNo = " 12 ", floor = " 3 ", apartmentNo = " 7 ",
        ).toRequest()
        assertEquals("Erenler Apt", req.buildingName)
        assertEquals("12", req.buildingNo)
        assertEquals("3", req.floor)
        assertEquals("7", req.apartmentNo)
    }

    @Test
    fun `cancellable only before preparing`() {
        assertTrue(OrderStatus.PENDING.isCancellableByCustomer)
        assertTrue(OrderStatus.CONFIRMED.isCancellableByCustomer)
        assertFalse(OrderStatus.PREPARING.isCancellableByCustomer)
    }

    @Test
    fun `unknown status falls back to pending`() {
        assertEquals(OrderStatus.PENDING, OrderStatus.from("banana"))
    }
}
