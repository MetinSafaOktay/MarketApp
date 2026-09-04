import Domain
import Foundation

// Anahtarlar JSONDecoder.api (.convertFromSnakeCase) ile eşlenir.
// Para alanları `MoneyValue` (string veya sayı kabul eder).

// MARK: - Cart

struct CartItemDTO: Decodable, Sendable {
    let id: String
    let quantity: Int
    let products: ProductDTO
}

enum CartMapper {
    static func map(_ dto: CartItemDTO) -> CartItem {
        CartItem(id: dto.id, product: ProductMapper.map(dto.products), quantity: dto.quantity)
    }
}

/// Sepet/istek listesi ortak sarmalayıcı (istek listesinde `quantity` yok).
struct ProductWrapperDTO: Decodable, Sendable {
    let products: ProductDTO
}

// MARK: - Checkout preview

struct CheckoutLineDTO: Decodable, Sendable {
    let productID: String
    let name: String
    let quantity: Int
    let unitPrice: MoneyValue
    let lineTotal: MoneyValue
    let inStock: Bool
    let stockQuantity: Int

    private enum CodingKeys: String, CodingKey {
        case name, quantity, unitPrice, lineTotal, inStock, stockQuantity
        case productID = "productId"
    }
}

struct CheckoutCouponDTO: Decodable, Sendable {
    let code: String
    let discountType: String
    let discountValue: MoneyValue
}

struct CheckoutPreviewDTO: Decodable, Sendable {
    let items: [CheckoutLineDTO]
    let subtotal: MoneyValue
    let discountAmount: MoneyValue
    let total: MoneyValue
    let coupon: CheckoutCouponDTO?
    let couponError: String?
    let hasStockIssues: Bool?
    let deliveryAreaOK: Bool?
    let deliveryAreaError: String?

    private enum CodingKeys: String, CodingKey {
        case items, subtotal, discountAmount, total, coupon, couponError, hasStockIssues
        case deliveryAreaOK = "deliveryAreaOk"
        case deliveryAreaError
    }
}

enum CheckoutPreviewMapper {
    static func map(_ dto: CheckoutPreviewDTO) -> CheckoutPreview {
        CheckoutPreview(
            lines: dto.items.map { line in
                CheckoutPreview.Line(
                    productID: line.productID,
                    name: line.name,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice.value,
                    lineTotal: line.lineTotal.value,
                    inStock: line.inStock,
                    stockQuantity: line.stockQuantity
                )
            },
            subtotal: dto.subtotal.value,
            discountAmount: dto.discountAmount.value,
            total: dto.total.value,
            coupon: dto.coupon.map { coupon in
                AppliedCoupon(
                    code: coupon.code,
                    discountType: DiscountType(rawValue: coupon.discountType) ?? .fixed,
                    discountValue: coupon.discountValue.value
                )
            },
            couponError: dto.couponError,
            hasStockIssues: dto.hasStockIssues ?? false,
            deliveryAreaOK: dto.deliveryAreaOK ?? true,
            deliveryAreaError: dto.deliveryAreaError
        )
    }
}

// MARK: - Address

struct AddressDTO: Decodable, Sendable {
    let id: String
    let label: String
    let fullAddress: String
    let city: String
    let district: String
    let buildingName: String?
    let buildingNo: String?
    let floor: String?
    let apartmentNo: String?
    let isDefault: Bool
    let latitude: Double?
    let longitude: Double?
}

enum AddressMapper {
    static func map(_ dto: AddressDTO) -> Address {
        Address(
            id: dto.id,
            label: dto.label,
            fullAddress: dto.fullAddress,
            city: dto.city,
            district: dto.district,
            buildingName: dto.buildingName ?? "",
            buildingNo: dto.buildingNo ?? "",
            floor: dto.floor ?? "",
            apartmentNo: dto.apartmentNo ?? "",
            isDefault: dto.isDefault,
            latitude: dto.latitude,
            longitude: dto.longitude
        )
    }
}

// MARK: - Order

struct OrderItemDTO: Decodable, Sendable {
    let id: String
    let productID: String
    let quantity: Int
    let unitPriceSnapshot: MoneyValue
    let subtotal: MoneyValue
    let products: ProductDTO?

    private enum CodingKeys: String, CodingKey {
        case id, quantity, unitPriceSnapshot, subtotal, products
        case productID = "productId"
    }
}

struct OrderHistoryDTO: Decodable, Sendable {
    let id: String
    let status: String
    let note: String?
    let createdAt: String?
}

struct OrderCustomerDTO: Decodable, Sendable {
    let id: String
    let profileName: String?
    let firstName: String?
    let lastName: String?
    let phone: String?
    let email: String?
}

struct OrderDTO: Decodable, Sendable {
    let id: String
    let status: String
    let paymentMethod: String
    let subtotal: MoneyValue
    let discountAmount: MoneyValue
    let totalAmount: MoneyValue
    let createdAt: String?
    let orderItems: [OrderItemDTO]
    let orderStatusHistory: [OrderHistoryDTO]?
    let addresses: AddressDTO?
    /// Yalnızca /admin/orders yanıtında dolu.
    let users: OrderCustomerDTO?
}

enum OrderMapper {
    static func map(_ dto: OrderDTO) -> Order {
        Order(
            id: dto.id,
            status: OrderStatus(rawValue: dto.status) ?? .pending,
            paymentMethod: PaymentMethod(rawValue: dto.paymentMethod) ?? .cashOnDelivery,
            subtotal: dto.subtotal.value,
            discountAmount: dto.discountAmount.value,
            totalAmount: dto.totalAmount.value,
            createdAt: DateParsing.iso8601(dto.createdAt),
            lines: dto.orderItems.map { item in
                OrderLine(
                    id: item.id,
                    productID: item.productID,
                    name: item.products?.name ?? "Ürün",
                    quantity: item.quantity,
                    unitPrice: item.unitPriceSnapshot.value,
                    lineSubtotal: item.subtotal.value
                )
            },
            statusHistory: (dto.orderStatusHistory ?? []).map { event in
                OrderEvent(
                    id: event.id,
                    status: OrderStatus(rawValue: event.status) ?? .pending,
                    note: event.note,
                    createdAt: DateParsing.iso8601(event.createdAt)
                )
            },
            address: dto.addresses.map(AddressMapper.map),
            customerName: dto.users.map { user in
                let full = [user.firstName, user.lastName]
                    .compactMap { $0 }
                    .joined(separator: " ")
                    .trimmingCharacters(in: .whitespaces)
                return full.isEmpty ? (user.profileName ?? "Müşteri") : full
            },
            customerPhone: dto.users?.phone
        )
    }
}
