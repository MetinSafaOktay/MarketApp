package com.erenlermarket.app.data

import com.erenlermarket.app.data.remote.dto.MetaDto
import com.erenlermarket.app.data.remote.dto.PaginatedDto
import com.erenlermarket.app.data.remote.dto.ProductDto
import com.erenlermarket.app.data.remote.dto.ProductImageDto
import com.erenlermarket.app.data.remote.toDomain
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.math.BigDecimal

class MappersTest {

    private fun product(price: String, original: String?) = ProductDto(
        id = "p1",
        categoryId = "c1",
        name = "Koska Helva",
        sku = "KOSKA",
        description = "  ",
        price = price,
        originalPrice = original,
        isNewArrival = true,
        stockQuantity = 8,
        productImages = listOf(ProductImageDto("https://cdn/a.jpg")),
    )

    @Test
    fun `product maps core fields and blank description becomes null`() {
        val domain = product("95", "120").toDomain()

        assertEquals("Koska Helva", domain.name)
        assertEquals(BigDecimal("95"), domain.price)
        assertEquals(BigDecimal("120"), domain.originalPrice)
        assertEquals(null, domain.description)
        assertEquals(listOf("https://cdn/a.jpg"), domain.imageUrls)
        assertTrue(domain.isDiscounted)
        assertTrue(domain.isInStock)
        assertEquals(20, domain.discountPercent)
    }

    @Test
    fun `product without original price is not discounted`() {
        assertFalse(product("50", null).toDomain().isDiscounted)
    }

    @Test
    fun `paginated dto maps meta`() {
        val page = PaginatedDto(
            data = listOf(product("10", null)),
            meta = MetaDto(total = 40, page = 2, pageSize = 20, totalPages = 2),
        ).toDomain()

        assertEquals(1, page.items.size)
        assertEquals(2, page.page)
        assertFalse(page.hasNextPage)
    }
}
