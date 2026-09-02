import Foundation

public struct AppNotification: Identifiable, Equatable, Sendable {
    public let id: String
    public let type: String
    public let title: String
    public let body: String?
    public let isRead: Bool
    public let relatedOrderID: String?
    public let createdAt: Date?

    public init(
        id: String,
        type: String,
        title: String,
        body: String?,
        isRead: Bool,
        relatedOrderID: String?,
        createdAt: Date?
    ) {
        self.id = id
        self.type = type
        self.title = title
        self.body = body
        self.isRead = isRead
        self.relatedOrderID = relatedOrderID
        self.createdAt = createdAt
    }

    public var icon: String {
        switch type {
        case "order_status_update": "shippingbox"
        case "announcement": "megaphone"
        default: "bell"
        }
    }
}

extension [AppNotification] {
    public var unreadCount: Int {
        count { !$0.isRead }
    }
}
