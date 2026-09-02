import Foundation

/// Mağaza profili. Çevrilebilir alanlar (tagline, description) backend
/// tarafından istenen dile çözülmüş string olarak gelir.
public struct StoreProfile: Equatable, Sendable {
    public let name: String
    public let city: String?
    public let tagline: String?
    public let description: String?
    public let phone: String?
    public let address: String?
    public let logoURL: URL?
    public let coverImageURL: URL?

    public init(
        name: String,
        city: String? = nil,
        tagline: String? = nil,
        description: String? = nil,
        phone: String? = nil,
        address: String? = nil,
        logoURL: URL? = nil,
        coverImageURL: URL? = nil
    ) {
        self.name = name
        self.city = city
        self.tagline = tagline
        self.description = description
        self.phone = phone
        self.address = address
        self.logoURL = logoURL
        self.coverImageURL = coverImageURL
    }
}
