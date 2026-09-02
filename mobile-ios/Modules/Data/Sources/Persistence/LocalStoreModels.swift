import Foundation
import SwiftData

/// Son görüntülenen ürün (ana sayfadaki "Son Gezdiklerin" rafı).
@Model
final class RecentProductRecord {
    @Attribute(.unique) var productID: String
    var name: String
    var price: Decimal
    var originalPrice: Decimal?
    var imageURL: URL?
    var isNewArrival: Bool
    var stockQuantity: Int
    var categoryID: String
    var viewedAt: Date

    init(
        productID: String,
        name: String,
        price: Decimal,
        originalPrice: Decimal?,
        imageURL: URL?,
        isNewArrival: Bool,
        stockQuantity: Int,
        categoryID: String,
        viewedAt: Date
    ) {
        self.productID = productID
        self.name = name
        self.price = price
        self.originalPrice = originalPrice
        self.imageURL = imageURL
        self.isNewArrival = isNewArrival
        self.stockQuantity = stockQuantity
        self.categoryID = categoryID
        self.viewedAt = viewedAt
    }
}

/// Çevrimdışıyken gösterilecek katalog anlık görüntüsü.
@Model
final class CachedProductRecord {
    @Attribute(.unique) var cacheKey: String
    var railID: String
    var productID: String
    var name: String
    var price: Decimal
    var originalPrice: Decimal?
    var imageURL: URL?
    var isNewArrival: Bool
    var stockQuantity: Int
    var categoryID: String
    var sortIndex: Int

    init(
        railID: String,
        productID: String,
        name: String,
        price: Decimal,
        originalPrice: Decimal?,
        imageURL: URL?,
        isNewArrival: Bool,
        stockQuantity: Int,
        categoryID: String,
        sortIndex: Int
    ) {
        cacheKey = "\(railID)|\(productID)"
        self.railID = railID
        self.productID = productID
        self.name = name
        self.price = price
        self.originalPrice = originalPrice
        self.imageURL = imageURL
        self.isNewArrival = isNewArrival
        self.stockQuantity = stockQuantity
        self.categoryID = categoryID
        self.sortIndex = sortIndex
    }
}

@Model
final class CachedCategoryRecord {
    @Attribute(.unique) var categoryID: String
    var name: String
    var imageURL: URL?
    var displayOrder: Int

    init(categoryID: String, name: String, imageURL: URL?, displayOrder: Int) {
        self.categoryID = categoryID
        self.name = name
        self.imageURL = imageURL
        self.displayOrder = displayOrder
    }
}
