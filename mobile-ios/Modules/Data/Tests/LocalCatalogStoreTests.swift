import Domain
import Foundation
import Testing
@testable import Data

@MainActor
struct LocalCatalogStoreTests {
    private func makeStore() -> LocalCatalogStore {
        LocalCatalogStore(inMemory: true)
    }

    private func product(_ id: String, price: Decimal = 10) -> Product {
        Product(
            id: id, categoryID: "c1", name: "Ürün \(id)", sku: "S",
            description: nil, price: price, originalPrice: nil,
            isNewArrival: false, stockQuantity: 5,
            imageURLs: [URL(string: "https://cdn/\(id).jpg")].compactMap(\.self)
        )
    }

    @Test func recordViewDeduplicatesAndKeepsNewestFirst() {
        let store = makeStore()
        store.recordView(product("a"))
        store.recordView(product("b"))
        store.recordView(product("a")) // tekrar

        let recent = store.recentProducts()
        #expect(recent.map(\.id) == ["a", "b"])
    }

    @Test func recordViewTrimsToLimit() {
        let store = makeStore()
        for index in 0 ..< 20 {
            store.recordView(product("p\(index)"))
        }
        #expect(store.recentProducts(limit: 50).count <= 12)
    }

    @Test func cachedProductsRoundTripPerRail() {
        let store = makeStore()
        store.cache(products: [product("a"), product("b")], railID: "discounted")
        store.cache(products: [product("c")], railID: "new")

        #expect(store.cachedProducts(railID: "discounted").map(\.id) == ["a", "b"])
        #expect(store.cachedProducts(railID: "new").map(\.id) == ["c"])

        // Yeniden önbelleğe alınca eskiler silinir.
        store.cache(products: [product("z")], railID: "discounted")
        #expect(store.cachedProducts(railID: "discounted").map(\.id) == ["z"])
    }

    @Test func cachedCategoriesSortedByOrder() {
        let store = makeStore()
        store.cache(categories: [
            ProductCategory(id: "c2", name: "B", imageURL: nil, displayOrder: 2),
            ProductCategory(id: "c1", name: "A", imageURL: nil, displayOrder: 1)
        ])
        #expect(store.cachedCategories().map(\.id) == ["c1", "c2"])
    }
}
