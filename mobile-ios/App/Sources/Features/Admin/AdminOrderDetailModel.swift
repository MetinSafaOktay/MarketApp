import Domain
import Networking
import Observation

@MainActor
@Observable
final class AdminOrderDetailModel {
    enum Phase: Equatable {
        case loading
        case loaded(Order)
        case failed(String)
    }

    private(set) var phase: Phase = .loading
    private(set) var isUpdating = false
    private(set) var actionError: String?
    var note = ""

    @ObservationIgnored private let deps: AppDependencies
    @ObservationIgnored private let orderID: String
    @ObservationIgnored private var hasLoadedOnce = false

    init(deps: AppDependencies, orderID: String) {
        self.deps = deps
        self.orderID = orderID
    }

    var reference: String { String(orderID.prefix(8)).uppercased() }

    func loadIfNeeded() async {
        guard !hasLoadedOnce else { return }
        hasLoadedOnce = true
        await load()
    }

    func load() async {
        do {
            phase = try await .loaded(deps.admin.order(id: orderID, language: deps.language))
        } catch {
            phase = .failed((error as? APIError)?.displayMessage ?? "Sipariş yüklenemedi")
        }
    }

    func startPolling() async {
        while !Task.isCancelled {
            try? await Task.sleep(for: .seconds(15))
            guard !Task.isCancelled, hasLoadedOnce else { continue }
            if let order = try? await deps.admin.order(id: orderID, language: deps.language) {
                phase = .loaded(order)
            }
        }
    }

    func update(to status: OrderStatus) async {
        guard !isUpdating else { return }
        isUpdating = true
        actionError = nil
        defer { isUpdating = false }
        do {
            let trimmed = note.trimmingCharacters(in: .whitespacesAndNewlines)
            let order = try await deps.admin.updateOrderStatus(
                id: orderID,
                status: status,
                note: trimmed.isEmpty ? nil : trimmed,
                language: deps.language
            )
            phase = .loaded(order)
            note = ""
        } catch {
            actionError = (error as? APIError)?.displayMessage ?? "Durum güncellenemedi"
        }
    }
}
