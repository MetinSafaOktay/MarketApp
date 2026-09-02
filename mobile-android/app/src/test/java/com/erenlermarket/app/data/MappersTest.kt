package com.erenlermarket.app.data

import com.erenlermarket.app.data.remote.dto.AnnouncementDto
import com.erenlermarket.app.data.remote.dto.CategoryDto
import com.erenlermarket.app.data.remote.dto.MetaDto
import com.erenlermarket.app.data.remote.dto.ProductDto
import com.erenlermarket.app.data.remote.dto.ProductImageDto
import com.erenlermarket.app.data.remote.dto.ProductPageDto
import com.erenlermarket.app.data.remote.dto.StoreProfileDto
import com.erenlermarket.app.data.remote.toDomain
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
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
        assertNull(domain.description)
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
    fun `product with malformed price falls back to zero`() {
        assertEquals(BigDecimal.ZERO, product("n/a", null).toDomain().price)
    }

    @Test
    fun `product page maps meta`() {
        val page = ProductPageDto(
            data = listOf(product("10", null)),
            meta = MetaDto(total = 40, page = 2, pageSize = 20, totalPages = 2),
        ).toDomain()

        assertEquals(1, page.items.size)
        assertEquals(2, page.page)
        assertFalse(page.hasNextPage)
    }

    @Test
    fun `product page reports a next page when more remain`() {
        val page = ProductPageDto(
            data = listOf(product("10", null)),
            meta = MetaDto(total = 40, page = 1, pageSize = 20, totalPages = 2),
        ).toDomain()

        assertTrue(page.hasNextPage)
    }

    @Test
    fun `category maps fields`() {
        val category = CategoryDto(
            id = "c1",
            name = "İçecekler",
            imageUrl = "https://cdn/c.jpg",
            displayOrder = 3,
        ).toDomain()

        assertEquals("c1", category.id)
        assertEquals("İçecekler", category.name)
        assertEquals("https://cdn/c.jpg", category.imageUrl)
        assertEquals(3, category.displayOrder)
    }

    @Test
    fun `store profile blanks become null`() {
        val store = StoreProfileDto(
            name = "Erenler Market",
            city = "Afyonkarahisar",
            tagline = "   ",
            description = null,
            phone = "",
            address = "Merkez",
            logoUrl = null,
            coverImageUrl = null,
        ).toDomain()

        assertEquals("Erenler Market", store.name)
        assertEquals("Afyonkarahisar", store.city)
        assertNull(store.tagline)
        assertNull(store.phone)
        assertEquals("Merkez", store.address)
    }

    @Test
    fun `announcement maps fields`() {
        val announcement = AnnouncementDto(
            id = "a1",
            title = "Bayram",
            content = "Kapalıyız",
            imageUrl = null,
        ).toDomain()

        assertEquals("a1", announcement.id)
        assertEquals("Bayram", announcement.title)
        assertEquals("Kapalıyız", announcement.content)
        assertNull(announcement.imageUrl)
    }
}
