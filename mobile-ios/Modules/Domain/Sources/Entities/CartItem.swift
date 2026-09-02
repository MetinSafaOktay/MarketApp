import Foundation

/// Sepetteki bir satır (sunucu tarafında tutulur).
public struct CartItem: Identifiable, Equatable, Sendable {
    public let id: String
    public let product: Product
    public let quantity: Int

    public init(id: String, product: Product, quantity: Int) {
        self.id = id
        self.product = product
        self.quantity = quantity
    }

    public var lineTotal: Decimal {
        product.price * Decimal(quantity)
    }

    /// İstenen adet stokta var mı?
    public var isAvailable: Bool {
        product.stockQuantity >= quantity
    }
}

extension [CartItem] {
    public var totalQuantity: Int {
        reduce(0) { $0 + $1.quantity }
    }

    public var subtotal: Decimal {
        reduce(Decimal(0)) { $0 + $1.lineTotal }
    }
}
