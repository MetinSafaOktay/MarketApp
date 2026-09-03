import Domain
import Networking
import Observation

@MainActor
@Observable
final class AdminConversationModel {
    enum Phase: Equatable {
        case loading
        case ready
        case failed(String)
    }

    private(set) var phase: Phase = .loading
    private(set) var messages: [Message] = []
    private(set) var isSending = false
    var draft = ""

    let customerName: String

    @ObservationIgnored private let deps: AppDependencies
    @ObservationIgnored private let conversationID: String

    init(deps: AppDependencies, conversationID: String, customerName: String) {
        self.deps = deps
        self.conversationID = conversationID
        self.customerName = customerName
    }

    var canSend: Bool {
        !draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !isSending
    }

    func loadInitial() async {
        await reload(showSpinner: messages.isEmpty)
    }

    func startPolling() async {
        while !Task.isCancelled {
            try? await Task.sleep(for: .seconds(5))
            guard !Task.isCancelled else { return }
            await reload(showSpinner: false)
        }
    }

    func send() async {
        let content = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !content.isEmpty, !isSending else { return }
        isSending = true
        defer { isSending = false }
        do {
            let message = try await deps.admin.reply(conversationID: conversationID, content: content)
            messages.append(message)
            draft = ""
        } catch {
            phase = .failed((error as? APIError)?.displayMessage ?? "Yanıt gönderilemedi")
        }
    }

    private func reload(showSpinner: Bool) async {
        if showSpinner { phase = .loading }
        do {
            messages = try await deps.admin.conversationMessages(id: conversationID)
            phase = .ready
        } catch {
            if showSpinner {
                phase = .failed((error as? APIError)?.displayMessage ?? "Sohbet yüklenemedi")
            }
        }
    }
}
