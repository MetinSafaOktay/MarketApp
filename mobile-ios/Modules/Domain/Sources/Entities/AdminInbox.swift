import Foundation

/// Admin gelen kutusu satırı: bir müşteri + son mesaj önizlemesi.
public struct AdminConversation: Identifiable, Equatable, Sendable {
    public let id: String
    public let customerName: String
    public let photoURL: URL?
    public let lastMessage: String?
    /// Son mesaj müşteriden ve okunmamış — mağaza yanıtı bekliyor.
    public let awaitingReply: Bool
    public let createdAt: Date?

    public init(
        id: String,
        customerName: String,
        photoURL: URL?,
        lastMessage: String?,
        awaitingReply: Bool,
        createdAt: Date?
    ) {
        self.id = id
        self.customerName = customerName
        self.photoURL = photoURL
        self.lastMessage = lastMessage
        self.awaitingReply = awaitingReply
        self.createdAt = createdAt
    }
}

/// Stoğu azalan ürün — admin uyarı listesi.
public struct LowStockProduct: Identifiable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let sku: String
    public let stockQuantity: Int
    public let categoryName: String?

    public init(id: String, name: String, sku: String, stockQuantity: Int, categoryName: String?) {
        self.id = id
        self.name = name
        self.sku = sku
        self.stockQuantity = stockQuantity
        self.categoryName = categoryName
    }

    public var isOutOfStock: Bool { stockQuantity <= 0 }
}
