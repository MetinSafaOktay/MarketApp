import Domain
import Foundation
import Testing
@testable import ErenlerMarket

@MainActor
struct ProductListModelTests {
    @Test func loadsFirstPageAndReportsEmpty() async {
        let model = ProductListModel(
            deps: TestDeps.make(catalog: StubCatalog(pages: [TestFixtures.page([])])),
            query: ProductQuery()
        )
        await model.reload()
        #expect(model.phase == .empty)
    }

    @Test func paginationAppendsAndDeduplicates() async {
        let p1 = [TestFixtures.product(id: "1"), TestFixtures.product(id: "2")]
        let p2 = [TestFixtures.product(id: "2"), TestFixtures.product(id: "3")]
        let catalog = StubCatalog(pages: [
            TestFixtures.page(p1, page: 1, totalPages: 2),
            TestFixtures.page(p2, page: 2, totalPages: 2)
        ])
        let model = ProductListModel(deps: TestDeps.make(catalog: catalog), query: ProductQuery())

        await model.reload()
        #expect(model.phase == .loaded)
        #expect(model.canLoadMore)

        await model.loadMore(after: p1[1])
        #expect(model.products.map(\.id) == ["1", "2", "3"])
        #expect(!model.canLoadMore)
    }
}

@MainActor
struct HomeModelTests {
    @Test func buildsRailsFromCatalogAndStorefront() async {
        let items = [
            TestFixtures.product(id: "d1", price: 8, original: 10),
            TestFixtures.product(id: "n1", new: true)
        ]
        let catalog = StubCatalog(pages: [TestFixtures.page(items)])
        let storefront = StubStorefront(announcementsResult: [
            Announcement(id: "a1", title: "Duyuru", content: "içerik")
        ])
        let model = HomeModel(deps: TestDeps.make(catalog: catalog, storefront: storefront))

        await model.load()

        #expect(model.store?.name == "Erenler Market")
        #expect(model.announcements.count == 1)
        #expect(!model.rails.isEmpty)
        #expect(model.errorMessage == nil)
    }
}
