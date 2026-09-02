import Domain
import Foundation
import Testing
@testable import ErenlerMarket

@MainActor
struct NotificationsStoreTests {
    private func notification(_ id: String, read: Bool) -> AppNotification {
        AppNotification(
            id: id, type: "announcement", title: "Test", body: nil,
            isRead: read, relatedOrderID: nil, createdAt: nil
        )
    }

    @Test func refreshLoadsAndCountsUnread() async throws {
        let deps = TestDeps.make(
            notifications: StubNotifications(result: [
                notification("n1", read: false), notification("n2", read: true)
            ])
        )
        try await deps.session.signIn(email: "test@example.com", password: "parola1234")

        await deps.notificationsStore.refresh()
        #expect(deps.notificationsStore.unreadCount == 1)
    }

    @Test func markAllReadZeroesBadge() async throws {
        let deps = TestDeps.make(
            notifications: StubNotifications(result: [
                notification("n1", read: false), notification("n2", read: false)
            ])
        )
        try await deps.session.signIn(email: "test@example.com", password: "parola1234")
        await deps.notificationsStore.refresh()

        await deps.notificationsStore.markAllRead()
        #expect(deps.notificationsStore.unreadCount == 0)
    }

    @Test func refreshNoOpWhenSignedOut() async {
        let deps = TestDeps.make(notifications: StubNotifications(result: [notification(
            "n1",
            read: false
        )]))
        await deps.notificationsStore.refresh()
        #expect(deps.notificationsStore.items.isEmpty)
    }
}

@MainActor
struct MessagesModelTests {
    @Test func sendAppendsCustomerMessage() async {
        let model = MessagesModel(repository: StubMessaging(result: []))
        await model.loadInitial()
        model.draft = "Merhaba"

        await model.send()
        #expect(model.messages.count == 1)
        #expect(model.messages.first?.sender == .customer)
        #expect(model.draft.isEmpty)
    }

    @Test func cannotSendBlankDraft() {
        let model = MessagesModel(repository: StubMessaging())
        model.draft = "   "
        #expect(!model.canSend)
    }
}
