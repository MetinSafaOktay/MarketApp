import Domain
import Foundation
import Networking

public struct AdminRepositoryLive: AdminRepository {
    private let client: APIClient

    public init(client: APIClient) {
        self.client = client
    }

    // MARK: Orders

    public func orders(status: OrderStatus?, language: String) async throws -> [Order] {
        var query: [String: String?] = ["lang": language]
        if let status { query["status"] = status.rawValue }
        let dtos: [OrderDTO] = try await client.send(.get("/admin/orders", query: query, auth: true))
        return dtos.map(OrderMapper.map)
    }

    public func order(id: String, language: String) async throws -> Order {
        let dto: OrderDTO = try await client.send(
            .get("/admin/orders/\(id)", query: ["lang": language], auth: true)
        )
        return OrderMapper.map(dto)
    }

    public func updateOrderStatus(
        id: String,
        status: OrderStatus,
        note: String?,
        language: String
    ) async throws -> Order {
        let dto: OrderDTO = try await client.send(Endpoint(
            path: "/orders/\(id)/status",
            method: .patch,
            query: ["lang": language],
            body: JSONEncoder.api.encode(StatusBody(status: status.rawValue, note: note)),
            requiresAuth: true
        ))
        return OrderMapper.map(dto)
    }

    // MARK: Messaging

    public func conversations() async throws -> [AdminConversation] {
        let dtos: [ConversationDTO] = try await client.send(.get("/conversations", auth: true))
        return dtos.map(ConversationMapper.map)
    }

    public func conversationMessages(id: String) async throws -> [Message] {
        let dtos: [MessageDTO] = try await client.send(.get("/conversations/\(id)", auth: true))
        return dtos.map(MessageMapper.map)
    }

    public func reply(conversationID: String, content: String) async throws -> Message {
        let dto: MessageDTO = try await client.send(.post(
            "/conversations/\(conversationID)/messages",
            json: ReplyBody(content: content),
            auth: true
        ))
        return MessageMapper.map(dto)
    }

    // MARK: Stock

    public func lowStock(language: String) async throws -> [LowStockProduct] {
        let dtos: [LowStockProductDTO] = try await client.send(
            .get("/admin/products/low-stock", query: ["lang": language], auth: true)
        )
        return dtos.map(LowStockMapper.map)
    }

    private struct StatusBody: Encodable {
        let status: String
        let note: String?
    }

    private struct ReplyBody: Encodable {
        let content: String
    }
}
