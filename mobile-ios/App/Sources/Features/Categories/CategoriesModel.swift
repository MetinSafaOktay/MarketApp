import Data
import Domain
import Networking
import Observation

@MainActor
@Observable
final class CategoriesModel {
    enum Phase: Equatable {
        case loading
        case loaded([ProductCategory])
        case failed(String)
    }

    private(set) var phase: Phase = .loading
    private(set) var isOffline = false

    private let catalog: any CatalogRepository
    private let local: LocalCatalogStore
    private var language: String { AppLanguage.current }
    private var hasLoadedOnce = false

    init(deps: AppDependencies) {
        catalog = deps.catalog
        local = deps.localCatalog
    }

    func loadIfNeeded() async {
        guard !hasLoadedOnce else { return }
        hasLoadedOnce = true
        await load()
    }

    func load() async {
        phase = .loading
        do {
            let categories = try await catalog.categories(language: language)
                .sorted { $0.displayOrder < $1.displayOrder }
            isOffline = false
            local.cache(categories: categories)
            phase = .loaded(categories)
        } catch {
            let cached = local.cachedCategories()
            if cached.isEmpty {
                phase = .failed((error as? APIError)?.displayMessage ?? "Kategoriler yüklenemedi")
            } else {
                isOffline = true
                phase = .loaded(cached)
            }
        }
    }
}
