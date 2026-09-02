import Foundation

public enum MessageSender: String, Sendable {
    case customer = "user"
    case store

    public var isCustomer: Bool {
        self == .customer
    }
}

/// Müşteri ↔ mağaza sohbetinde tek mesaj.
public struct Message: Identifiable, Equatable, Sendable {
    public let id: String
    public let sender: MessageSender
    public let content: String
    public let isRead: Bool
    public let createdAt: Date?

    public init(
        id: String,
        sender: MessageSender,
        content: String,
        isRead: Bool,
        createdAt: Date?
    ) {
        self.id = id
        self.sender = sender
        self.content = content
        self.isRead = isRead
        self.createdAt = createdAt
    }
}

extension [Message] {
    /// Mağazadan gelen okunmamış mesaj sayısı.
    public var unreadFromStore: Int {
        count { $0.sender == .store && !$0.isRead }
    }
}
