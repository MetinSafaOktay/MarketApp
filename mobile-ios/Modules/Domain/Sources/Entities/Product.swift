import Foundation

/// Katalog ürünü. Çevrilebilir alanlar (name, description) backend tarafından
/// istenen dile çözülmüş string olarak gelir.
public struct Product: Identifiable, Equatable, Sendable {
    public let id: String
    public let categoryID: String
    public let name: String
    public let sku: String
    public let description: String?
    public let price: Decimal
    public let originalPrice: Decimal?
    public let isNewArrival: Bool
    public let stockQuantity: Int
    public let imageURLs: [URL]

    public init(
        id: String,
        categoryID: String,
        name: String,
        sku: String,
        description: String?,
        price: Decimal,
        originalPrice: Decimal?,
        isNewArrival: Bool,
        stockQuantity: Int,
        imageURLs: [URL]
    ) {
        self.id = id
        self.categoryID = categoryID
        self.name = name
        self.sku = sku
        self.description = description
        self.price = price
        self.originalPrice = originalPrice
        self.isNewArrival = isNewArrival
        self.stockQuantity = stockQuantity
        self.imageURLs = imageURLs
    }

    public var isDiscounted: Bool {
        guard let originalPrice else { return false }
        return originalPrice > price
    }

    public var isInStock: Bool {
        stockQuantity > 0
    }
}
