import Domain
import Networking
import Observation

@MainActor
@Observable
final class AdminMessagesModel {
    enum Phase: Equatable {
        case loading
        case empty
        case loaded([AdminConversation])
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
            let conversations = try await deps.admin.conversations()
            phase = conversations.isEmpty ? .empty : .loaded(conversations)
        } catch {
            phase = .failed((error as? APIError)?.displayMessage ?? "Mesajlar yüklenemedi")
        }
    }

    func startPolling() async {
        while !Task.isCancelled {
            try? await Task.sleep(for: .seconds(15))
            guard !Task.isCancelled, hasLoadedOnce else { continue }
            if let conversations = try? await deps.admin.conversations() {
                phase = conversations.isEmpty ? .empty : .loaded(conversations)
            }
        }
    }
}
