import Domain
import Networking
import Observation

@MainActor
@Observable
final class ProductDetailModel {
    enum Phase: Equatable {
        case loading
        case loaded(Product)
        case failed(String)
    }

    private(set) var phase: Phase = .loading
    private(set) var similar: [Product] = []

    private let productID: String
    private let catalog: any CatalogRepository
    private let language: String
    private var hasLoadedOnce = false

    init(productID: String, deps: AppDependencies) {
        self.productID = productID
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
            phase = try await .loaded(catalog.product(id: productID, language: language))
        } catch {
            phase = .failed((error as? APIError)?.displayMessage ?? "Ürün yüklenemedi")
            return
        }
        similar = await (try? catalog.similarProducts(id: productID, language: language)) ?? []
    }
}
