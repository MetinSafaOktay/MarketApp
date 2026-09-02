import Domain
import Foundation

struct MessageDTO: Decodable, Sendable {
    let id: String
    let senderType: String
    let content: String
    let isRead: Bool
    let createdAt: String?
}

enum MessageMapper {
    static func map(_ dto: MessageDTO) -> Message {
        Message(
            id: dto.id,
            sender: MessageSender(rawValue: dto.senderType) ?? .store,
            content: dto.content,
            isRead: dto.isRead,
            createdAt: DateParsing.iso8601(dto.createdAt)
        )
    }
}

struct NotificationDTO: Decodable, Sendable {
    let id: String
    let type: String
    let title: String
    let body: String?
    let isRead: Bool
    let relatedOrderID: String?
    let createdAt: String?

    private enum CodingKeys: String, CodingKey {
        case id, type, title, body, isRead, createdAt
        case relatedOrderID = "relatedOrderId"
    }
}

enum NotificationMapper {
    static func map(_ dto: NotificationDTO) -> AppNotification {
        AppNotification(
            id: dto.id,
            type: dto.type,
            title: dto.title,
            body: dto.body,
            isRead: dto.isRead,
            relatedOrderID: dto.relatedOrderID,
            createdAt: DateParsing.iso8601(dto.createdAt)
        )
    }
}

struct UserSettingsDTO: Decodable, Sendable {
    let language: String
    let theme: String
    let pushNotificationsEnabled: Bool
    let orderNotificationsEnabled: Bool
}

enum UserSettingsMapper {
    static func map(_ dto: UserSettingsDTO) -> UserSettings {
        UserSettings(
            language: dto.language,
            theme: dto.theme,
            pushNotificationsEnabled: dto.pushNotificationsEnabled,
            orderNotificationsEnabled: dto.orderNotificationsEnabled
        )
    }
}
