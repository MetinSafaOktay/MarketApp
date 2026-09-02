import Domain
import Foundation
import SwiftData

/// SwiftData tabanlı yerel önbellek: son görüntülenen ürünler + çevrimdışı
/// katalog anlık görüntüsü. Sepet/istek listesi burada tutulmaz (sunucuda).
@MainActor
public final class LocalCatalogStore {
    private let container: ModelContainer?
    private static let recentLimit = 12

    private var context: ModelContext? {
        container?.mainContext
    }

    public nonisolated init(inMemory: Bool = false) {
        let schema = Schema([
            RecentProductRecord.self,
            CachedProductRecord.self,
            CachedCategoryRecord.self
        ])
        let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: inMemory)
        container = try? ModelContainer(for: schema, configurations: config)
    }

    // MARK: - Son görüntülenenler

    public func recordView(_ product: Product) {
        guard let context else { return }
        let id = product.id
        let existing = try? context.fetch(
            FetchDescriptor<RecentProductRecord>(predicate: #Predicate { $0.productID == id })
        )
        existing?.forEach(context.delete)

        context.insert(RecentProductRecord(
            productID: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            imageURL: product.imageURLs.first,
            isNewArrival: product.isNewArrival,
            stockQuantity: product.stockQuantity,
            categoryID: product.categoryID,
            viewedAt: .now
        ))

        // En eskileri buda.
        var descriptor = FetchDescriptor<RecentProductRecord>(
            sortBy: [SortDescriptor(\.viewedAt, order: .reverse)]
        )
        descriptor.fetchLimit = 1000
        if let all = try? context.fetch(descriptor), all.count > Self.recentLimit {
            all[Self.recentLimit...].forEach(context.delete)
        }
        try? context.save()
    }

    public func recentProducts(limit: Int = 10) -> [Product] {
        guard let context else { return [] }
        var descriptor = FetchDescriptor<RecentProductRecord>(
            sortBy: [SortDescriptor(\.viewedAt, order: .reverse)]
        )
        descriptor.fetchLimit = limit
        let records = (try? context.fetch(descriptor)) ?? []
        return records.map {
            Product(
                id: $0.productID, categoryID: $0.categoryID, name: $0.name, sku: "",
                description: nil, price: $0.price, originalPrice: $0.originalPrice,
                isNewArrival: $0.isNewArrival, stockQuantity: $0.stockQuantity,
                imageURLs: [$0.imageURL].compactMap(\.self)
            )
        }
    }

    // MARK: - Çevrimdışı katalog

    public func cache(products: [Product], railID: String) {
        guard let context, !products.isEmpty else { return }
        let existing = try? context.fetch(
            FetchDescriptor<CachedProductRecord>(predicate: #Predicate { $0.railID == railID })
        )
        existing?.forEach(context.delete)

        for (index, product) in products.enumerated() {
            context.insert(CachedProductRecord(
                railID: railID,
                productID: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                imageURL: product.imageURLs.first,
                isNewArrival: product.isNewArrival,
                stockQuantity: product.stockQuantity,
                categoryID: product.categoryID,
                sortIndex: index
            ))
        }
        try? context.save()
    }

    public func cachedProducts(railID: String) -> [Product] {
        guard let context else { return [] }
        let descriptor = FetchDescriptor<CachedProductRecord>(
            predicate: #Predicate { $0.railID == railID },
            sortBy: [SortDescriptor(\.sortIndex)]
        )
        let records = (try? context.fetch(descriptor)) ?? []
        return records.map {
            Product(
                id: $0.productID, categoryID: $0.categoryID, name: $0.name, sku: "",
                description: nil, price: $0.price, originalPrice: $0.originalPrice,
                isNewArrival: $0.isNewArrival, stockQuantity: $0.stockQuantity,
                imageURLs: [$0.imageURL].compactMap(\.self)
            )
        }
    }

    public func cache(categories: [ProductCategory]) {
        guard let context, !categories.isEmpty else { return }
        let existing = try? context.fetch(FetchDescriptor<CachedCategoryRecord>())
        existing?.forEach(context.delete)
        for category in categories {
            context.insert(CachedCategoryRecord(
                categoryID: category.id,
                name: category.name,
                imageURL: category.imageURL,
                displayOrder: category.displayOrder
            ))
        }
        try? context.save()
    }

    public func cachedCategories() -> [ProductCategory] {
        guard let context else { return [] }
        let descriptor = FetchDescriptor<CachedCategoryRecord>(
            sortBy: [SortDescriptor(\.displayOrder)]
        )
        let records = (try? context.fetch(descriptor)) ?? []
        return records.map {
            ProductCategory(
                id: $0.categoryID, name: $0.name,
                imageURL: $0.imageURL, displayOrder: $0.displayOrder
            )
        }
    }
}
