import Domain
import Foundation

// MARK: - Ortak

struct PaginatedDTO<Item: Decodable & Sendable>: Decodable, Sendable {
    let data: [Item]
    let meta: MetaDTO

    struct MetaDTO: Decodable, Sendable {
        let total: Int
        let page: Int
        let pageSize: Int
        let totalPages: Int
    }

    func toDomain<T: Sendable>(_ transform: (Item) -> T) -> Page<T> {
        Page(
            items: data.map(transform),
            page: meta.page,
            pageSize: meta.pageSize,
            total: meta.total,
            totalPages: meta.totalPages
        )
    }
}

// MARK: - Product

// Anahtarlar JSONDecoder.api (.convertFromSnakeCase) ile eşlenir.

struct ProductImageDTO: Decodable, Sendable {
    let imageURL: String

    private enum CodingKeys: String, CodingKey { case imageURL = "imageUrl" }
}

struct ProductDTO: Decodable, Sendable {
    let id: String
    let categoryID: String
    let name: String
    let sku: String
    let description: String?
    let price: String
    let originalPrice: String?
    let isNewArrival: Bool
    let stockQuantity: Int
    let productImages: [ProductImageDTO]?

    private enum CodingKeys: String, CodingKey {
        case id, name, sku, description, price, productImages
        case categoryID = "categoryId"
        case originalPrice, isNewArrival, stockQuantity
    }
}

enum ProductMapper {
    /// Backend para alanlarını string döndürür ("95", "120.50").
    static func decimal(_ string: String) -> Decimal? {
        Decimal(string: string, locale: Locale(identifier: "en_US_POSIX"))
    }

    static func map(_ dto: ProductDTO) -> Product {
        Product(
            id: dto.id,
            categoryID: dto.categoryID,
            name: dto.name,
            sku: dto.sku,
            description: dto.description?.isEmpty == true ? nil : dto.description,
            price: decimal(dto.price) ?? 0,
            originalPrice: dto.originalPrice.flatMap(decimal),
            isNewArrival: dto.isNewArrival,
            stockQuantity: dto.stockQuantity,
            imageURLs: (dto.productImages ?? []).compactMap { URL(string: $0.imageURL) }
        )
    }
}

// MARK: - Category

struct CategoryDTO: Decodable, Sendable {
    let id: String
    let name: String
    let imageURL: String?
    let displayOrder: Int

    private enum CodingKeys: String, CodingKey {
        case id, name, displayOrder
        case imageURL = "imageUrl"
    }
}

enum CategoryMapper {
    static func map(_ dto: CategoryDTO) -> ProductCategory {
        ProductCategory(
            id: dto.id,
            name: dto.name,
            imageURL: dto.imageURL.flatMap { URL(string: $0) },
            displayOrder: dto.displayOrder
        )
    }
}
