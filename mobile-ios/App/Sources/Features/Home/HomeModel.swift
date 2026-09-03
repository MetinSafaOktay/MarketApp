import Data
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
        let seeAll: ProductQuery?
    }

    private(set) var store: StoreProfile?
    private(set) var announcements: [Announcement] = []
    private(set) var rails: [Rail] = []
    private(set) var isLoading = true
    private(set) var isOffline = false
    private(set) var errorMessage: String?
    /// Süren sipariş (teslim/iptal olmamış, en güncel) — üstte takip kartı.
    private(set) var activeOrder: Order?

    private let catalog: any CatalogRepository
    private let storefront: any StorefrontRepository
    private let local: LocalCatalogStore
    private let order: any OrderRepository
    private let session: SessionStore
    private var hasLoadedOnce = false
    private var loadedLanguage: String?

    /// Yerel dil tercihi — her istek anında taze okunur (ayarlardan değişince yansır).
    private var language: String { AppLanguage.current }

    private struct RailSpec {
        let id: String
        let title: String
        let query: ProductQuery
    }

    /// Ana sayfada gösterilen çevrimiçi raflar.
    private static let onlineRails: [RailSpec] = [
        RailSpec(
            id: "discounted",
            title: "İndirimdekiler",
            query: ProductQuery(pageSize: 10, onlyDiscounted: true)
        ),
        RailSpec(
            id: "new",
            title: "Yeni Gelenler",
            query: ProductQuery(pageSize: 10, onlyNew: true)
        ),
        RailSpec(
            id: "latest",
            title: "Tüm Ürünler",
            query: ProductQuery(pageSize: 10)
        )
    ]

    init(deps: AppDependencies) {
        catalog = deps.catalog
        storefront = deps.storefront
        local = deps.localCatalog
        order = deps.order
        session = deps.session
    }

    func loadIfNeeded() async {
        guard !hasLoadedOnce else { return }
        hasLoadedOnce = true
        await load()
    }

    /// Ayarlardan içerik dili değişince çağrılır — ilk yükleme `loadIfNeeded`'te.
    func reloadForLanguageChange() async {
        guard let loaded = loadedLanguage, loaded != AppLanguage.current else { return }
        await load()
    }

    func load() async {
        isLoading = true
        errorMessage = nil
        loadedLanguage = AppLanguage.current
        defer { isLoading = false }

        async let storeTask = loadStore()
        async let announcementsTask = loadAnnouncements()
        async let activeOrderTask = fetchActiveOrder()
        async let discountedTask = products(Self.onlineRails[0].query)
        async let newArrivalsTask = products(Self.onlineRails[1].query)
        async let latestTask = products(Self.onlineRails[2].query)

        store = await storeTask
        announcements = await announcementsTask
        activeOrder = await activeOrderTask
        let fetched = await [discountedTask, newArrivalsTask, latestTask]
        let anyLoaded = fetched.contains { !$0.isEmpty }

        var built: [Rail] = []
        addRecentlyViewedRail(to: &built)

        if anyLoaded {
            isOffline = false
            for (index, group) in fetched.enumerated() where !group.isEmpty {
                let spec = Self.onlineRails[index]
                local.cache(products: group, railID: spec.id)
                built.append(Rail(
                    id: spec.id, title: spec.title, products: group,
                    seeAll: strippedQuery(spec.query)
                ))
            }
        } else {
            // Çevrimdışı: kayıtlı katalog anlık görüntüsünü göster.
            for spec in Self.onlineRails {
                let cached = local.cachedProducts(railID: spec.id)
                if !cached.isEmpty {
                    built.append(Rail(
                        id: spec.id,
                        title: spec.title,
                        products: cached,
                        seeAll: nil
                    ))
                }
            }
            isOffline = built.contains { $0.id != "recent" }
        }

        rails = built
        if store == nil, rails.isEmpty {
            errorMessage = "İçerik yüklenemedi. Bağlantını kontrol et."
        }
    }

    private func addRecentlyViewedRail(to rails: inout [Rail]) {
        let recent = local.recentProducts(limit: 10)
        guard !recent.isEmpty else { return }
        rails.append(Rail(id: "recent", title: "Son Gezdiklerin", products: recent, seeAll: nil))
    }

    /// Ana ekrana her dönüşte süren siparişi ucuzca tazeler (durum değişince kart güncellensin).
    func syncActiveOrder() async {
        guard hasLoadedOnce else { return }
        activeOrder = await fetchActiveOrder()
    }

    /// En güncel süren sipariş (teslim/iptal değil). Oturum yoksa nil.
    private func fetchActiveOrder() async -> Order? {
        guard session.isSignedIn else { return nil }
        let orders = try? await order.orders(language: language)
        return orders?.first { $0.status.isActive }
    }

    /// Ana sayfaya her dönüşte "Son Gezdiklerin" rafını ucuzca tazeler.
    func syncRecentRail() {
        guard hasLoadedOnce else { return }
        let recent = local.recentProducts(limit: 10)
        var updated = rails.filter { $0.id != "recent" }
        if !recent.isEmpty {
            updated.insert(
                Rail(id: "recent", title: "Son Gezdiklerin", products: recent, seeAll: nil),
                at: 0
            )
        }
        rails = updated
    }

    private func strippedQuery(_ query: ProductQuery) -> ProductQuery {
        ProductQuery(
            onlyDiscounted: query.onlyDiscounted,
            onlyNew: query.onlyNew
        )
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
