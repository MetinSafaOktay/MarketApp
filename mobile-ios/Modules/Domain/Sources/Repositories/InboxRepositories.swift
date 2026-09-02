/// Müşteri ↔ mağaza sohbeti (tek konuşma).
public protocol MessagingRepository: Sendable {
    func messages() async throws -> [Message]
    func send(_ content: String) async throws -> Message
}

public protocol NotificationsRepository: Sendable {
    func notifications() async throws -> [AppNotification]
    func markRead(id: String) async throws
    func markAllRead() async throws
}

public protocol SettingsRepository: Sendable {
    func settings() async throws -> UserSettings
    func update(_ update: SettingsUpdate) async throws -> UserSettings
}
