import Domain
import Networking
import Observation

@MainActor
@Observable
final class OrderDetailModel {
    enum Phase: Equatable {
        case loading
        case loaded(Order)
        case failed(String)
    }

    private(set) var phase: Phase = .loading
    private(set) var isCancelling = false
    private(set) var actionError: String?

    @ObservationIgnored private let deps: AppDependencies
    @ObservationIgnored private let orderID: String
    @ObservationIgnored private var hasLoadedOnce = false

    init(deps: AppDependencies, orderID: String) {
        self.deps = deps
        self.orderID = orderID
    }

    var reference: String {
        String(orderID.prefix(8)).uppercased()
    }

    func loadIfNeeded() async {
        guard !hasLoadedOnce else { return }
        hasLoadedOnce = true
        await load()
    }

    func load() async {
        do {
            phase = try await .loaded(deps.order.order(id: orderID, language: deps.language))
        } catch {
            phase = .failed((error as? APIError)?.displayMessage ?? "Sipariş yüklenemedi")
        }
    }

    func cancel() async {
        isCancelling = true
        actionError = nil
        defer { isCancelling = false }
        do {
            phase = try await .loaded(deps.order.cancel(
                id: orderID,
                reason: nil,
                language: deps.language
            ))
        } catch {
            actionError = (error as? APIError)?.displayMessage ?? "Sipariş iptal edilemedi"
        }
    }
}
