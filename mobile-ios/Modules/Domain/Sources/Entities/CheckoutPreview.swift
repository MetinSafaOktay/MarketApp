import Foundation

public enum DiscountType: String, Sendable {
    case percentage
    case fixed
}

public struct AppliedCoupon: Equatable, Sendable {
    public let code: String
    public let discountType: DiscountType
    public let discountValue: Decimal

    public init(code: String, discountType: DiscountType, discountValue: Decimal) {
        self.code = code
        self.discountType = discountType
        self.discountValue = discountValue
    }
}

/// `POST /cart/checkout-preview` sonucu.
public struct CheckoutPreview: Equatable, Sendable {
    public struct Line: Identifiable, Equatable, Sendable {
        public let productID: String
        public let name: String
        public let quantity: Int
        public let unitPrice: Decimal
        public let lineTotal: Decimal
        public let inStock: Bool
        public let stockQuantity: Int

        public var id: String {
            productID
        }

        public init(
            productID: String,
            name: String,
            quantity: Int,
            unitPrice: Decimal,
            lineTotal: Decimal,
            inStock: Bool,
            stockQuantity: Int
        ) {
            self.productID = productID
            self.name = name
            self.quantity = quantity
            self.unitPrice = unitPrice
            self.lineTotal = lineTotal
            self.inStock = inStock
            self.stockQuantity = stockQuantity
        }
    }

    public let lines: [Line]
    public let subtotal: Decimal
    public let discountAmount: Decimal
    public let total: Decimal
    public let coupon: AppliedCoupon?
    public let couponError: String?
    public let hasStockIssues: Bool

    public init(
        lines: [Line],
        subtotal: Decimal,
        discountAmount: Decimal,
        total: Decimal,
        coupon: AppliedCoupon?,
        couponError: String?,
        hasStockIssues: Bool
    ) {
        self.lines = lines
        self.subtotal = subtotal
        self.discountAmount = discountAmount
        self.total = total
        self.coupon = coupon
        self.couponError = couponError
        self.hasStockIssues = hasStockIssues
    }
}
