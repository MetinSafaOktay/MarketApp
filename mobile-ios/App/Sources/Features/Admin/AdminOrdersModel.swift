import Domain
import Networking
import Observation

/// Admin sipariş listesi filtresi. `.active` özel: teslim/iptal hariç hepsi.
enum AdminOrderFilter: String, CaseIterable, Identifiable {
    case active
    case preparing
    case outForDelivery
    case delivered
    case all

    var id: String { rawValue }

    var label: String {
        switch self {
        case .active: "Aktif"
        case .preparing: "Hazırlanıyor"
        case .outForDelivery: "Yolda"
        case .delivered: "Teslim"
        case .all: "Tümü"
        }
    }

    var status: OrderStatus? {
        switch self {
        case .active, .all: nil
        case .preparing: .preparing
        case .outForDelivery: .outForDelivery
        case .delivered: .delivered
        }
    }
}

@MainActor
@Observable
final class AdminOrdersModel {
    enum Phase: Equatable {
        case loading
        case empty
        case loaded([Order])
        case failed(String)
    }

    private(set) var phase: Phase = .loading
    var filter: AdminOrderFilter = .active

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

    func select(_ filter: AdminOrderFilter) async {
        self.filter = filter
        await load()
    }

    func load() async {
        do {
            let orders = try await fetch()
            phase = orders.isEmpty ? .empty : .loaded(orders)
        } catch {
            phase = .failed((error as? APIError)?.displayMessage ?? "Siparişler yüklenemedi")
        }
    }

    /// Ekran açıkken 20 sn'de bir + görünür olunca sessizce tazeler.
    func startPolling() async {
        await reloadSilently()
        while !Task.isCancelled {
            try? await Task.sleep(for: .seconds(20))
            guard !Task.isCancelled else { return }
            await reloadSilently()
        }
    }

    private func reloadSilently() async {
        guard hasLoadedOnce, let orders = try? await fetch() else { return }
        phase = orders.isEmpty ? .empty : .loaded(orders)
    }

    private func fetch() async throws -> [Order] {
        let orders = try await deps.admin.orders(status: filter.status, language: deps.language)
        return filter == .active ? orders.filter { $0.status.isActive } : orders
    }
}
