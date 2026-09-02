import Domain
import Foundation
import Testing
@testable import ErenlerMarket

// MARK: - Stub repositories

private struct StubCatalog: CatalogRepository {
    var pages: [Page<Product>] = []
    var similar: [Product] = []
    var categoriesResult: [ProductCategory] = []

    func products(_ query: ProductQuery, language _: String) async throws -> Page<Product> {
        pages[min(query.page - 1, pages.count - 1)]
    }

    func product(id: String, language _: String) async throws -> Product {
        Self.product(id: id)
    }

    func similarProducts(id _: String, language _: String) async throws -> [Product] {
        similar
    }

    func categories(language _: String) async throws -> [ProductCategory] {
        categoriesResult
    }

    static func product(
        id: String,
        price: Decimal = 10,
        original: Decimal? = nil,
        new: Bool = false
    ) -> Product {
        Product(
            id: id, categoryID: "c1", name: "Ürün \(id)", sku: "SKU-\(id)",
            description: nil, price: price, originalPrice: original,
            isNewArrival: new, stockQuantity: 5, imageURLs: []
        )
    }
}

private struct StubStorefront: StorefrontRepository {
    var profile = StoreProfile(name: "Erenler Market", tagline: "Taze")
    var announcementsResult: [Announcement] = []

    func storeProfile(language _: String) async throws -> StoreProfile {
        profile
    }

    func announcements(language _: String) async throws -> [Announcement] {
        announcementsResult
    }
}

private func page(_ items: [Product], page: Int, totalPages: Int) -> Page<Product> {
    Page(items: items, page: page, pageSize: 20, total: totalPages * 20, totalPages: totalPages)
}

private func deps(
    catalog: StubCatalog = StubCatalog(),
    storefront: StubStorefront = StubStorefront()
) -> AppDependencies {
    AppDependencies(catalog: catalog, storefront: storefront, language: "tr")
}

// MARK: - ProductListModel

@MainActor
struct ProductListModelTests {
    @Test func loadsFirstPageAndReportsEmpty() async {
        let model = ProductListModel(
            deps: deps(catalog: StubCatalog(pages: [page([], page: 1, totalPages: 1)])),
            query: ProductQuery()
        )
        await model.reload()
        #expect(model.phase == .empty)
    }

    @Test func paginationAppendsAndDeduplicates() async {
        let p1 = [StubCatalog.product(id: "1"), StubCatalog.product(id: "2")]
        let p2 = [StubCatalog.product(id: "2"), StubCatalog.product(id: "3")]
        let catalog = StubCatalog(pages: [
            page(p1, page: 1, totalPages: 2),
            page(p2, page: 2, totalPages: 2)
        ])
        let model = ProductListModel(deps: deps(catalog: catalog), query: ProductQuery())

        await model.reload()
        #expect(model.phase == .loaded)
        #expect(model.canLoadMore)

        await model.loadMore(after: p1[1]) // son öğeye yaklaşınca
        #expect(model.products.map(\.id) == ["1", "2", "3"]) // "2" tekrar eklenmedi
        #expect(!model.canLoadMore)
    }
}

// MARK: - HomeModel

@MainActor
struct HomeModelTests {
    @Test func buildsDiscountedAndNewRails() async {
        let discounted = [StubCatalog.product(id: "d1", price: 8, original: 10)]
        let news = [StubCatalog.product(id: "n1", new: true)]
        // reload() her rafta aynı stub sayfayı döndürür; ayrım için hepsi dolu.
        var catalog = StubCatalog(pages: [page(discounted + news, page: 1, totalPages: 1)])
        catalog.similar = []
        let model = HomeModel(deps: deps(
            catalog: catalog,
            storefront: StubStorefront(announcementsResult: [
                Announcement(
                    id: "a1",
                    title: "Duyuru",
                    content: "içerik"
                )
            ])
        ))
        await model.load()

        #expect(model.store?.name == "Erenler Market")
        #expect(model.announcements.count == 1)
        #expect(!model.rails.isEmpty)
        #expect(model.errorMessage == nil)
    }
}
