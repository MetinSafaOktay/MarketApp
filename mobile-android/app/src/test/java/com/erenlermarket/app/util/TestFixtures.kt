package com.erenlermarket.app.util

import com.erenlermarket.app.domain.model.Product
import com.erenlermarket.app.domain.model.User
import com.erenlermarket.app.domain.model.UserRole
import java.math.BigDecimal

fun testProduct(
    id: String = "p1",
    price: String = "100",
    stock: Int = 10,
): Product = Product(
    id = id,
    categoryId = "c1",
    name = "Ürün $id",
    sku = id,
    description = null,
    price = BigDecimal(price),
    originalPrice = null,
    isNewArrival = false,
    stockQuantity = stock,
    imageUrls = emptyList(),
)

fun testUser(): User = User(
    id = "u1",
    email = "a@b.com",
    phone = null,
    profileName = "a",
    firstName = "A",
    lastName = "B",
    photoUrl = null,
    bio = null,
    isPrivate = false,
    role = UserRole.CUSTOMER,
)
