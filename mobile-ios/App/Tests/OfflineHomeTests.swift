import Domain
import Foundation
import Networking
import Testing
@testable import ErenlerMarket

private struct FailingCatalog: CatalogRepository {
    func products(_: ProductQuery, language _: String) async throws -> Page<Product> {
        throw APIError.transport("offline")
    }

    func product(id _: String, language _: String) async throws -> Product {
        throw APIError.transport("offline")
    }

    func similarProducts(id _: String, language _: String) async throws -> [Product] {
        []
    }

    func categories(language _: String) async throws -> [ProductCategory] {
        throw APIError.transport("offline")
    }
}

@MainActor
struct OfflineHomeTests {
    @Test func homeFallsBackToCacheWhenOffline() async {
        // Önce çevrimiçi: önbelleği doldur.
        let online = StubCatalog(pages: [TestFixtures.page([
            TestFixtures.product(id: "p1"), TestFixtures.product(id: "p2")
        ])])
        let deps = TestDeps.make(catalog: online)
        let warm = HomeModel(deps: deps)
        await warm.load()
        #expect(!warm.isOffline)

        // Sonra çevrimdışı: aynı yerel depoyla yeni model.
        let offlineDeps = TestDeps.make(catalog: FailingCatalog(), local: deps.localCatalog)
        let cold = HomeModel(deps: offlineDeps)
        await cold.load()

        #expect(cold.isOffline)
        #expect(!cold.rails.isEmpty)
    }

    @Test func categoriesFallBackToCacheWhenOffline() async {
        let online = StubCatalog(categoriesResult: [
            ProductCategory(id: "c1", name: "Meyve", imageURL: nil, displayOrder: 1)
        ])
        let deps = TestDeps.make(catalog: online)
        let warm = CategoriesModel(deps: deps)
        await warm.load()

        let cold = CategoriesModel(deps: TestDeps.make(
            catalog: FailingCatalog(),
            local: deps.localCatalog
        ))
        await cold.load()

        #expect(cold.isOffline)
        if case .loaded(let categories) = cold.phase {
            #expect(categories.map(\.id) == ["c1"])
        } else {
            Issue.record("beklenen .loaded")
        }
    }
}
