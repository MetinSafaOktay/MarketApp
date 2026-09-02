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

    private let catalog: any CatalogRepository
    private let language: String
    private var hasLoadedOnce = false

    init(deps: AppDependencies) {
        catalog = deps.catalog
        language = deps.language
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
            phase = .loaded(categories.sorted { $0.displayOrder < $1.displayOrder })
        } catch {
            phase = .failed((error as? APIError)?.displayMessage ?? "Kategoriler yüklenemedi")
        }
    }
}
