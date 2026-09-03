import Domain
import Foundation

// Anahtarlar JSONDecoder.api (.convertFromSnakeCase) ile eşlenir.

struct ConversationUserDTO: Decodable, Sendable {
    let id: String
    let profileName: String?
    let profilePhotoURL: String?

    private enum CodingKeys: String, CodingKey {
        case id, profileName
        case profilePhotoURL = "profilePhotoUrl"
    }
}

struct ConversationDTO: Decodable, Sendable {
    let id: String
    let users: ConversationUserDTO?
    let messages: [MessageDTO]?
    let createdAt: String?
}

enum ConversationMapper {
    static func map(_ dto: ConversationDTO) -> AdminConversation {
        let last = dto.messages?.first
        return AdminConversation(
            id: dto.id,
            customerName: dto.users?.profileName?.nilIfBlank ?? "Müşteri",
            photoURL: dto.users?.profilePhotoURL.flatMap(URL.init(string:)),
            lastMessage: last?.content,
            awaitingReply: last.map { $0.senderType == "user" && !$0.isRead } ?? false,
            createdAt: DateParsing.iso8601(last?.createdAt ?? dto.createdAt)
        )
    }
}

struct LowStockCategoryDTO: Decodable, Sendable {
    let name: String?
}

struct LowStockProductDTO: Decodable, Sendable {
    let id: String
    let name: String
    let sku: String
    let stockQuantity: Int
    let categories: LowStockCategoryDTO?
}

enum LowStockMapper {
    static func map(_ dto: LowStockProductDTO) -> LowStockProduct {
        LowStockProduct(
            id: dto.id,
            name: dto.name,
            sku: dto.sku,
            stockQuantity: dto.stockQuantity,
            categoryName: dto.categories?.name?.nilIfBlank
        )
    }
}

private extension String {
    var nilIfBlank: String? {
        let trimmed = trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}
