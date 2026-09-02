import Domain
import Networking
import Observation

@MainActor
@Observable
final class OrdersModel {
    enum Phase: Equatable {
        case loading
        case empty
        case loaded([Order])
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
            let orders = try await deps.order.orders(language: deps.language)
            phase = orders.isEmpty ? .empty : .loaded(orders)
        } catch {
            phase = .failed((error as? APIError)?.displayMessage ?? "Siparişler yüklenemedi")
        }
    }
}
