import Foundation

public enum ProductSort: String, Sendable, CaseIterable {
    case newest
    case priceAscending = "price_asc"
    case priceDescending = "price_desc"
}

public struct ProductQuery: Sendable, Equatable {
    public var page: Int
    public var pageSize: Int
    public var categoryID: String?
    public var search: String?
    public var sort: ProductSort
    public var onlyDiscounted: Bool
    public var onlyNew: Bool
    public var inStock: Bool

    public init(
        page: Int = 1,
        pageSize: Int = 20,
        categoryID: String? = nil,
        search: String? = nil,
        sort: ProductSort = .newest,
        onlyDiscounted: Bool = false,
        onlyNew: Bool = false,
        inStock: Bool = false
    ) {
        self.page = page
        self.pageSize = pageSize
        self.categoryID = categoryID
        self.search = search
        self.sort = sort
        self.onlyDiscounted = onlyDiscounted
        self.onlyNew = onlyNew
        self.inStock = inStock
    }
}

public protocol CatalogRepository: Sendable {
    func products(_ query: ProductQuery, language: String) async throws -> Page<Product>
    func product(id: String, language: String) async throws -> Product
    func similarProducts(id: String, language: String) async throws -> [Product]
    func categories(language: String) async throws -> [ProductCategory]
}
