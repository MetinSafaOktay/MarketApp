import Domain
import Networking
import Observation

@MainActor
@Observable
final class HomeModel {
    struct Rail: Identifiable {
        let id: String
        let title: String
        let products: [Product]
        let seeAll: ProductQuery
    }

    private(set) var store: StoreProfile?
    private(set) var announcements: [Announcement] = []
    private(set) var rails: [Rail] = []
    private(set) var isLoading = true
    private(set) var errorMessage: String?

    private let catalog: any CatalogRepository
    private let storefront: any StorefrontRepository
    private let language: String
    private var hasLoadedOnce = false

    init(deps: AppDependencies) {
        catalog = deps.catalog
        storefront = deps.storefront
        language = deps.language
    }

    func loadIfNeeded() async {
        guard !hasLoadedOnce else { return }
        hasLoadedOnce = true
        await load()
    }

    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        async let storeTask = loadStore()
        async let announcementsTask = loadAnnouncements()
        async let discountedTask = products(ProductQuery(pageSize: 10, onlyDiscounted: true))
        async let newArrivalsTask = products(ProductQuery(pageSize: 10, onlyNew: true))
        async let latestTask = products(ProductQuery(pageSize: 10))

        store = await storeTask
        announcements = await announcementsTask
        let discounted = await discountedTask
        let newArrivals = await newArrivalsTask
        let latest = await latestTask

        var built: [Rail] = []
        if !discounted.isEmpty {
            built.append(Rail(
                id: "discounted",
                title: "İndirimdekiler",
                products: discounted,
                seeAll: ProductQuery(onlyDiscounted: true)
            ))
        }
        if !newArrivals.isEmpty {
            built.append(Rail(
                id: "new",
                title: "Yeni Gelenler",
                products: newArrivals,
                seeAll: ProductQuery(onlyNew: true)
            ))
        }
        if !latest.isEmpty {
            built.append(Rail(
                id: "latest",
                title: built.isEmpty ? "Ürünler" : "Tüm Ürünler",
                products: latest,
                seeAll: ProductQuery()
            ))
        }
        rails = built

        if store == nil, built.isEmpty {
            errorMessage = "İçerik yüklenemedi. Bağlantını kontrol et."
        }
    }

    private func loadStore() async -> StoreProfile? {
        try? await storefront.storeProfile(language: language)
    }

    private func loadAnnouncements() async -> [Announcement] {
        await (try? storefront.announcements(language: language)) ?? []
    }

    private func products(_ query: ProductQuery) async -> [Product] {
        await (try? catalog.products(query, language: language))?.items ?? []
    }
}
