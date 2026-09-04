package com.erenlermarket.app.data.remote

import com.erenlermarket.app.data.remote.dto.AddressDto
import com.erenlermarket.app.data.remote.dto.CartItemDto
import com.erenlermarket.app.data.remote.dto.CheckoutPreviewDto
import com.erenlermarket.app.data.remote.dto.OrderDto
import com.erenlermarket.app.domain.model.Address
import com.erenlermarket.app.domain.model.AppliedCoupon
import com.erenlermarket.app.domain.model.CartItem
import com.erenlermarket.app.domain.model.CheckoutPreview
import com.erenlermarket.app.domain.model.DiscountType
import com.erenlermarket.app.domain.model.NewAddress
import com.erenlermarket.app.domain.model.Order
import com.erenlermarket.app.domain.model.OrderEvent
import com.erenlermarket.app.domain.model.OrderLine
import com.erenlermarket.app.domain.model.OrderStatus
import com.erenlermarket.app.domain.model.PaymentMethod

fun CartItemDto.toDomain(): CartItem = CartItem(
    id = id,
    product = products.toDomain(),
    quantity = quantity,
)

fun AddressDto.toDomain(): Address = Address(
    id = id,
    label = label,
    fullAddress = fullAddress,
    city = city,
    district = district,
    buildingName = buildingName,
    buildingNo = buildingNo,
    floor = floor,
    apartmentNo = apartmentNo,
    isDefault = isDefault,
    latitude = latitude,
    longitude = longitude,
)

fun NewAddress.toRequest() = com.erenlermarket.app.data.remote.dto.AddressRequest(
    label = label.trim(),
    fullAddress = fullAddress.trim(),
    city = city.trim(),
    district = district.trim(),
    buildingName = buildingName.trim(),
    buildingNo = buildingNo.trim(),
    floor = floor.trim(),
    apartmentNo = apartmentNo.trim(),
    isDefault = isDefault,
    latitude = latitude,
    longitude = longitude,
)

fun CheckoutPreviewDto.toDomain(): CheckoutPreview = CheckoutPreview(
    lines = items.map { line ->
        CheckoutPreview.Line(
            productId = line.productId,
            name = line.name,
            quantity = line.quantity,
            unitPrice = line.unitPrice,
            lineTotal = line.lineTotal,
            inStock = line.inStock,
            stockQuantity = line.stockQuantity,
        )
    },
    subtotal = subtotal,
    discountAmount = discountAmount,
    total = total,
    coupon = coupon?.let {
        AppliedCoupon(
            code = it.code,
            discountType = if (it.discountType.equals("percentage", ignoreCase = true)) {
                DiscountType.PERCENTAGE
            } else {
                DiscountType.FIXED
            },
            discountValue = it.discountValue,
        )
    },
    couponError = couponError,
    hasStockIssues = hasStockIssues,
    deliveryAreaOk = deliveryAreaOk,
    deliveryAreaError = deliveryAreaError,
)

fun OrderDto.toDomain(): Order = Order(
    id = id,
    status = OrderStatus.from(status),
    paymentMethod = PaymentMethod.from(paymentMethod),
    subtotal = subtotal,
    discountAmount = discountAmount,
    totalAmount = totalAmount,
    createdAt = createdAt,
    lines = orderItems.map { item ->
        OrderLine(
            id = item.id,
            productId = item.productId,
            name = item.products?.name ?: "Ürün",
            quantity = item.quantity,
            unitPrice = item.unitPriceSnapshot,
            lineSubtotal = item.subtotal,
        )
    },
    statusHistory = orderStatusHistory.orEmpty().map { event ->
        OrderEvent(
            id = event.id,
            status = OrderStatus.from(event.status),
            note = event.note,
            createdAt = event.createdAt,
        )
    },
    address = addresses?.toDomain(),
    customerName = users?.let {
        listOfNotNull(it.firstName, it.lastName).joinToString(" ").ifBlank { null }
            ?: it.profileName
    },
    customerPhone = users?.phone,
)
