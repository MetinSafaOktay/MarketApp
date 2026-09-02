package com.erenlermarket.app.data.repository

import com.erenlermarket.app.data.remote.ErenlerApi
import com.erenlermarket.app.data.remote.dto.CategoryDto
import com.erenlermarket.app.data.remote.dto.MetaDto
import com.erenlermarket.app.data.remote.dto.ProductDto
import com.erenlermarket.app.data.remote.dto.ProductPageDto
import com.erenlermarket.app.domain.model.ProductQuery
import com.erenlermarket.app.domain.model.ProductSort
import io.mockk.coEvery
import io.mockk.mockk
import io.mockk.slot
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test

class CatalogRepositoryImplTest {

    private val api = mockk<ErenlerApi>()
    private val repository = CatalogRepositoryImpl(api)

    private val emptyPage = ProductPageDto(
        data = emptyList(),
        meta = MetaDto(total = 0, page = 1, pageSize = 20, totalPages = 1),
    )

    @Test
    fun `products maps query to request params`() = runTest {
        val params = slot<Map<String, String>>()
        coEvery { api.products(capture(params)) } returns emptyPage

        repository.products(
            ProductQuery(
                page = 2,
                pageSize = 30,
                categoryId = "c1",
                search = "  çay ",
                sort = ProductSort.PRICE_ASC,
                onlyDiscounted = true,
            ),
        )

        assertEquals("2", params.captured["page"])
        assertEquals("30", params.captured["pageSize"])
        assertEquals("price_asc", params.captured["sort"])
        assertEquals("c1", params.captured["categoryId"])
        assertEquals("çay", params.captured["q"])
        assertEquals("true", params.captured["onlyDiscounted"])
    }

    @Test
    fun `products omits optional params when unset`() = runTest {
        val params = slot<Map<String, String>>()
        coEvery { api.products(capture(params)) } returns emptyPage

        repository.products(ProductQuery())

        assertEquals(setOf("page", "pageSize", "sort"), params.captured.keys)
    }

    @Test
    fun `categories are sorted by display order`() = runTest {
        coEvery { api.categories() } returns listOf(
            CategoryDto(id = "b", name = "B", imageUrl = null, displayOrder = 2),
            CategoryDto(id = "a", name = "A", imageUrl = null, displayOrder = 1),
            CategoryDto(id = "c", name = "C", imageUrl = null, displayOrder = 3),
        )

        val result = repository.categories()

        assertEquals(listOf("a", "b", "c"), result.map { it.id })
    }

    @Test
    fun `product delegates to api and maps`() = runTest {
        coEvery { api.product("p9") } returns ProductDto(
            id = "p9",
            categoryId = "c1",
            name = "Zeytin",
            sku = "ZTN",
            price = "80",
        )

        assertEquals("Zeytin", repository.product("p9").name)
    }
}
