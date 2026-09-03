import Domain
import Networking
import Observation

@MainActor
@Observable
final class AdminLowStockModel {
    enum Phase: Equatable {
        case loading
        case empty
        case loaded([LowStockProduct])
        case failed(String)
    }

    private(set) var phase: Phase = .loading

    @ObservationIgnored private let deps: AppDependencies
    @ObservationIgnored private var hasLoadedOnce = false

    init(deps: AppDependencies) {
        self.deps = deps
    }

    func loadIfNeeded() async {
        guard !hasLoadedOnce else { return }
        hasLoadedOnce = true
        await load()
    }

    func load() async {
        do {
            let products = try await deps.admin.lowStock(language: deps.language)
            phase = products.isEmpty ? .empty : .loaded(products)
        } catch {
            phase = .failed((error as? APIError)?.displayMessage ?? "Stok listesi yüklenemedi")
        }
    }
}
