import Domain
import Foundation
import Networking

public struct MessagingRepositoryLive: MessagingRepository {
    private let client: APIClient
    public init(client: APIClient) {
        self.client = client
    }

    public func messages() async throws -> [Message] {
        let dtos: [MessageDTO] = try await client.send(.get("/conversations/me", auth: true))
        return dtos.map(MessageMapper.map)
    }

    public func send(_ content: String) async throws -> Message {
        let dto: MessageDTO = try await client.send(.post(
            "/conversations/me/messages", json: Body(content: content), auth: true
        ))
        return MessageMapper.map(dto)
    }

    private struct Body: Encodable { let content: String }
}

public struct NotificationsRepositoryLive: NotificationsRepository {
    private let client: APIClient
    public init(client: APIClient) {
        self.client = client
    }

    public func notifications() async throws -> [AppNotification] {
        let dtos: [NotificationDTO] = try await client.send(.get("/notifications/me", auth: true))
        return dtos.map(NotificationMapper.map)
    }

    public func markRead(id: String) async throws {
        try await client.send(Endpoint(
            path: "/notifications/\(id)/read", method: .patch, requiresAuth: true
        ))
    }

    public func markAllRead() async throws {
        try await client.send(Endpoint(
            path: "/notifications/me/read-all", method: .patch, requiresAuth: true
        ))
    }
}

public struct SettingsRepositoryLive: SettingsRepository {
    private let client: APIClient
    public init(client: APIClient) {
        self.client = client
    }

    public func settings() async throws -> UserSettings {
        let dto: UserSettingsDTO = try await client.send(.get("/users/me/settings", auth: true))
        return UserSettingsMapper.map(dto)
    }

    public func update(_ update: SettingsUpdate) async throws -> UserSettings {
        let dto: UserSettingsDTO = try await client.send(Endpoint(
            path: "/users/me/settings",
            method: .patch,
            body: JSONEncoder.api.encode(Body(
                pushNotificationsEnabled: update.pushNotificationsEnabled,
                orderNotificationsEnabled: update.orderNotificationsEnabled
            )),
            requiresAuth: true
        ))
        return UserSettingsMapper.map(dto)
    }

    private struct Body: Encodable {
        let pushNotificationsEnabled: Bool?
        let orderNotificationsEnabled: Bool?
    }
}
