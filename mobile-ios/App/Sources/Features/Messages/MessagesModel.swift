import Domain
import Networking
import Observation

@MainActor
@Observable
final class MessagesModel {
    enum Phase: Equatable {
        case loading
        case ready
        case failed(String)
    }

    private(set) var phase: Phase = .loading
    private(set) var messages: [Message] = []
    private(set) var isSending = false
    var draft = ""

    @ObservationIgnored private let repository: any MessagingRepository

    init(repository: any MessagingRepository) {
        self.repository = repository
    }

    var canSend: Bool {
        !draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !isSending
    }

    func loadInitial() async {
        await reload(showSpinner: messages.isEmpty)
    }

    /// Ekran açıkken 5 sn'de bir yeni mesajları çeker (basit polling).
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
            let message = try await repository.send(content)
            messages.append(message)
            draft = ""
        } catch {
            phase = .failed((error as? APIError)?.displayMessage ?? "Mesaj gönderilemedi")
        }
    }

    private func reload(showSpinner: Bool) async {
        if showSpinner {
            phase = .loading
        }
        do {
            messages = try await repository.messages()
            phase = .ready
        } catch is CancellationError {
            // yoksay
        } catch {
            if messages.isEmpty {
                phase = .failed((error as? APIError)?.displayMessage ?? "Mesajlar yüklenemedi")
            }
        }
    }
}
