import Domain
import Foundation

// Anahtarlar JSONDecoder.api (.convertFromSnakeCase) ile eşlenir.

struct StoreProfileDTO: Decodable, Sendable {
    let name: String
    let city: String?
    let tagline: String?
    let description: String?
    let phone: String?
    let address: String?
    let logoURL: String?
    let coverImageURL: String?
}

enum StoreProfileMapper {
    static func map(_ dto: StoreProfileDTO) -> StoreProfile {
        StoreProfile(
            name: dto.name,
            city: dto.city?.nonEmpty,
            tagline: dto.tagline?.nonEmpty,
            description: dto.description?.nonEmpty,
            phone: dto.phone?.nonEmpty,
            address: dto.address?.nonEmpty,
            logoURL: dto.logoURL.flatMap(URL.init(string:)),
            coverImageURL: dto.coverImageURL.flatMap(URL.init(string:))
        )
    }
}

struct AnnouncementDTO: Decodable, Sendable {
    let id: String
    let title: String
    let content: String
    let imageURL: String?
    let createdAt: String?
}

enum AnnouncementMapper {
    /// "2026-09-02T17:29:11.131Z" gibi kesirli saniyeli ISO8601'i tolere eder.
    private static func parseDate(_ string: String) -> Date? {
        let withFraction = Date.ISO8601FormatStyle(includingFractionalSeconds: true)
        return (try? withFraction.parse(string))
            ?? (try? Date.ISO8601FormatStyle().parse(string))
    }

    static func map(_ dto: AnnouncementDTO) -> Announcement {
        Announcement(
            id: dto.id,
            title: dto.title,
            content: dto.content,
            imageURL: dto.imageURL.flatMap(URL.init(string:)),
            createdAt: dto.createdAt.flatMap(parseDate)
        )
    }
}

extension String {
    /// Boş/whitespace string'i nil'e indirger.
    fileprivate var nonEmpty: String? {
        let trimmed = trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}
