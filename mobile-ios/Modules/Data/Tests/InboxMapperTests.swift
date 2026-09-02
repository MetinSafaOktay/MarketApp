import Domain
import Foundation
import Networking
import Testing
@testable import Data

struct InboxMapperTests {
    private let decoder = JSONDecoder.api

    @Test func messageMapsSenderType() throws {
        let json = Data("""
        [{ "id": "m1", "conversation_id": "c1", "sender_type": "store",
           "content": "Merhaba", "is_read": false,
           "created_at": "2026-09-02T15:58:13.304Z" },
         { "id": "m2", "conversation_id": "c1", "sender_type": "user",
           "content": "Selam", "is_read": true, "created_at": null }]
        """.utf8)
        let messages = try decoder.decode([MessageDTO].self, from: json).map(MessageMapper.map)

        #expect(messages[0].sender == .store)
        #expect(messages[1].sender == .customer)
        #expect(messages.unreadFromStore == 1)
        #expect(messages[0].createdAt != nil)
    }

    @Test func notificationMapsFields() throws {
        let json = Data("""
        [{ "id": "n1", "user_id": "u1", "type": "order_status_update",
           "title": "Sipariş Onaylandı", "body": "Hazırlanıyor",
           "is_read": false, "related_order_id": "o1",
           "created_at": "2026-09-02T15:00:00.000Z" }]
        """.utf8)
        let notifications = try decoder.decode([NotificationDTO].self, from: json)
            .map(NotificationMapper.map)

        #expect(notifications[0].relatedOrderID == "o1")
        #expect(notifications[0].icon == "shippingbox")
        #expect(notifications.unreadCount == 1)
    }

    @Test func settingsRoundTrip() throws {
        let json = Data("""
        { "id": "s1", "user_id": "u1", "language": "tr", "theme": "light",
          "push_notifications_enabled": false, "order_notifications_enabled": true }
        """.utf8)
        let settings = try UserSettingsMapper.map(decoder.decode(UserSettingsDTO.self, from: json))
        #expect(settings.theme == "light")
        #expect(!settings.pushNotificationsEnabled)
        #expect(settings.orderNotificationsEnabled)
    }
}
