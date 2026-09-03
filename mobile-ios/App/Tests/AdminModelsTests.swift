import Domain
import Foundation
import Networking
import Testing
@testable import ErenlerMarket

@MainActor
struct AdminOrdersModelTests {
    private func order(_ id: String, _ status: OrderStatus) -> Order {
        Order(
            id: id, status: status, paymentMethod: .cashOnDelivery,
            subtotal: 10, discountAmount: 0, totalAmount: 10, createdAt: nil,
            lines: [], statusHistory: [], address: nil
        )
    }

    @Test func activeFilterDropsDeliveredAndCancelled() async {
        let deps = TestDeps.make(admin: StubAdmin(ordersResult: [
            order("1", .preparing), order("2", .delivered), order("3", .cancelled)
        ]))
        let model = AdminOrdersModel(deps: deps)
        await model.load()

        #expect(model.phase == .loaded([order("1", .preparing)]))
    }

    @Test func surfacesLoadFailure() async {
        struct FailingAdmin: AdminRepository {
            func orders(status _: OrderStatus?, language _: String) async throws -> [Order] {
                throw APIError.transport("yok")
            }
            func order(id _: String, language _: String) async throws -> Order { throw APIError.transport("yok") }
            func updateOrderStatus(
                id _: String, status _: OrderStatus, note _: String?, language _: String
            ) async throws -> Order { throw APIError.transport("yok") }
            func conversations() async throws -> [AdminConversation] { [] }
            func conversationMessages(id _: String) async throws -> [Message] { [] }
            func reply(conversationID _: String, content _: String) async throws -> Message {
                throw APIError.transport("yok")
            }
            func lowStock(language _: String) async throws -> [LowStockProduct] { [] }
        }
        let deps = TestDeps.make(admin: FailingAdmin())
        let model = AdminOrdersModel(deps: deps)
        await model.load()

        guard case .failed = model.phase else {
            Issue.record("beklenen .failed, gelen \(model.phase)")
            return
        }
    }
}

@MainActor
struct AdminConversationModelTests {
    @Test func sendingAppendsReplyAndClearsDraft() async {
        let deps = TestDeps.make(admin: StubAdmin(messagesResult: []))
        let model = AdminConversationModel(deps: deps, conversationID: "c1", customerName: "Ayşe")
        await model.loadInitial()

        model.draft = "merhaba"
        await model.send()

        #expect(model.draft == "")
        #expect(model.messages.map(\.content) == ["merhaba"])
        #expect(model.customerName == "Ayşe")
    }
}
