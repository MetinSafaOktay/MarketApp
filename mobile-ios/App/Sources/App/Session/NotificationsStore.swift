import Domain
import Networking
import Observation

/// Bildirimlerin uygulama genelindeki durumu (zil rozeti + bildirim ekranı).
@MainActor
@Observable
final class NotificationsStore {
    private(set) var items: [AppNotification] = []
    private(set) var isLoading = false

    @ObservationIgnored private let repository: any NotificationsRepository
    @ObservationIgnored private let session: SessionStore

    nonisolated init(repository: any NotificationsRepository, session: SessionStore) {
        self.repository = repository
        self.session = session
    }

    var unreadCount: Int {
        items.unreadCount
    }

    func refresh() async {
        guard session.isSignedIn else {
            items = []
            return
        }
        isLoading = true
        defer { isLoading = false }
        items = await (try? repository.notifications()) ?? items
    }

    func markRead(id: String) async {
        guard let index = items.firstIndex(where: { $0.id == id }),
              !items[index].isRead else { return }
        items[index] = markingRead(items[index])
        try? await repository.markRead(id: id)
    }

    func markAllRead() async {
        items = items.map(markingRead)
        try? await repository.markAllRead()
    }

    func clearLocal() {
        items = []
    }

    private func markingRead(_ notification: AppNotification) -> AppNotification {
        AppNotification(
            id: notification.id,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            isRead: true,
            relatedOrderID: notification.relatedOrderID,
            createdAt: notification.createdAt
        )
    }
}
