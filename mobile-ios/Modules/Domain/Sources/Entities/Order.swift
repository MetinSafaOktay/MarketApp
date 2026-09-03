import Foundation

public enum OrderStatus: String, Sendable, CaseIterable {
    case pending
    case confirmed
    case preparing
    case outForDelivery = "out_for_delivery"
    case delivered
    case cancelled

    public var displayName: String {
        switch self {
        case .pending: "Sipariş Alındı"
        case .confirmed: "Onaylandı"
        case .preparing: "Hazırlanıyor"
        case .outForDelivery: "Yolda"
        case .delivered: "Teslim Edildi"
        case .cancelled: "İptal Edildi"
        }
    }

    /// Müşteri yalnızca hazırlığa başlanmadan iptal edebilir.
    public var isCancellableByCustomer: Bool {
        self == .pending || self == .confirmed
    }

    /// Hâlâ süren sipariş (teslim/iptal değil) — ana ekran takip kartı bunları gösterir.
    public var isActive: Bool {
        self != .delivered && self != .cancelled
    }

    /// Zaman çizelgesinde gösterilen normal akış.
    public static let deliveryFlow: [OrderStatus] =
        [.pending, .confirmed, .preparing, .outForDelivery, .delivered]
}

public enum PaymentMethod: String, Sendable, CaseIterable {
    case cashOnDelivery = "cash_on_delivery"
    case card

    public var displayName: String {
        switch self {
        case .cashOnDelivery: "Kapıda nakit"
        case .card: "Kapıda kart"
        }
    }
}

public struct OrderLine: Identifiable, Equatable, Sendable {
    public let id: String
    public let productID: String
    public let name: String
    public let quantity: Int
    public let unitPrice: Decimal
    public let lineSubtotal: Decimal

    public init(
        id: String,
        productID: String,
        name: String,
        quantity: Int,
        unitPrice: Decimal,
        lineSubtotal: Decimal
    ) {
        self.id = id
        self.productID = productID
        self.name = name
        self.quantity = quantity
        self.unitPrice = unitPrice
        self.lineSubtotal = lineSubtotal
    }
}

public struct OrderEvent: Identifiable, Equatable, Sendable {
    public let id: String
    public let status: OrderStatus
    public let note: String?
    public let createdAt: Date?

    public init(id: String, status: OrderStatus, note: String?, createdAt: Date?) {
        self.id = id
        self.status = status
        self.note = note
        self.createdAt = createdAt
    }
}

public struct Order: Identifiable, Equatable, Sendable {
    public let id: String
    public let status: OrderStatus
    public let paymentMethod: PaymentMethod
    public let subtotal: Decimal
    public let discountAmount: Decimal
    public let totalAmount: Decimal
    public let createdAt: Date?
    public let lines: [OrderLine]
    public let statusHistory: [OrderEvent]
    public let address: Address?
    /// Yalnızca admin sipariş listesinde dolu (müşteriye açık uçlarda nil).
    public let customerName: String?
    public let customerPhone: String?

    public init(
        id: String,
        status: OrderStatus,
        paymentMethod: PaymentMethod,
        subtotal: Decimal,
        discountAmount: Decimal,
        totalAmount: Decimal,
        createdAt: Date?,
        lines: [OrderLine],
        statusHistory: [OrderEvent],
        address: Address?,
        customerName: String? = nil,
        customerPhone: String? = nil
    ) {
        self.id = id
        self.status = status
        self.paymentMethod = paymentMethod
        self.subtotal = subtotal
        self.discountAmount = discountAmount
        self.totalAmount = totalAmount
        self.createdAt = createdAt
        self.lines = lines
        self.statusHistory = statusHistory
        self.address = address
        self.customerName = customerName
        self.customerPhone = customerPhone
    }

    public var itemCount: Int {
        lines.reduce(0) { $0 + $1.quantity }
    }

    /// Kısa referans (id'nin ilk bloğu).
    public var reference: String {
        String(id.prefix(8)).uppercased()
    }

    /// Admin için bir sonraki durum (ileri akış). Teslim/iptal ise nil.
    public var nextStatus: OrderStatus? {
        let flow = OrderStatus.deliveryFlow
        guard let i = flow.firstIndex(of: status), i < flow.count - 1 else { return nil }
        return flow[i + 1]
    }
}

/// Sipariş oluşturma girdisi.
public struct PlaceOrderInput: Sendable, Equatable {
    public var addressID: String
    public var items: [(productID: String, quantity: Int)]
    public var couponCode: String?
    public var paymentMethod: PaymentMethod

    public init(
        addressID: String,
        items: [(productID: String, quantity: Int)],
        couponCode: String?,
        paymentMethod: PaymentMethod
    ) {
        self.addressID = addressID
        self.items = items
        self.couponCode = couponCode
        self.paymentMethod = paymentMethod
    }

    public static func == (lhs: PlaceOrderInput, rhs: PlaceOrderInput) -> Bool {
        lhs.addressID == rhs.addressID
            && lhs.couponCode == rhs.couponCode
            && lhs.paymentMethod == rhs.paymentMethod
            && lhs.items.count == rhs.items.count
            && zip(lhs.items, rhs.items)
            .allSatisfy { $0.productID == $1.productID && $0.quantity == $1.quantity }
    }
}
