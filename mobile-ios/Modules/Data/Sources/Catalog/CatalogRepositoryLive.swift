import Domain
import Foundation
import Networking

/// M1 iskeleti — endpoint eşlemeleri M2'de doldurulacak.
public struct CatalogRepositoryLive: CatalogRepository {
    private let client: APIClient

    public init(client: APIClient) {
        self.client = client
    }

    public func products(_ query: ProductQuery, language: String) async throws -> Page<Product> {
        let response: PaginatedDTO<ProductDTO> = try await client.send(
            .get("/products", query: [
                "lang": language,
                "page": String(query.page),
                "pageSize": String(query.pageSize),
                "categoryId": query.categoryID,
                "q": query.search,
                "sort": query.sort.rawValue,
                "onlyDiscounted": query.onlyDiscounted ? "true" : nil,
                "onlyNew": query.onlyNew ? "true" : nil,
                "inStock": query.inStock ? "true" : nil
            ])
        )
        return response.toDomain(ProductMapper.map)
    }

    public func product(id: String, language: String) async throws -> Product {
        let dto: ProductDTO = try await client.send(
            .get("/products/\(id)", query: ["lang": language])
        )
        return ProductMapper.map(dto)
    }

    public func similarProducts(id: String, language: String) async throws -> [Product] {
        let dtos: [ProductDTO] = try await client.send(
            .get("/products/\(id)/similar", query: ["lang": language])
        )
        return dtos.map(ProductMapper.map)
    }

    public func categories(language: String) async throws -> [ProductCategory] {
        let dtos: [CategoryDTO] = try await client.send(
            .get("/categories", query: ["lang": language])
        )
        return dtos.map(CategoryMapper.map)
    }
}
