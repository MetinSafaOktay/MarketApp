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
    public let latitude: Double?
    public let longitude: Double?
    public let deliveryRadiusKm: Double?

    public init(
        name: String,
        city: String? = nil,
        tagline: String? = nil,
        description: String? = nil,
        phone: String? = nil,
        address: String? = nil,
        logoURL: URL? = nil,
        coverImageURL: URL? = nil,
        latitude: Double? = nil,
        longitude: Double? = nil,
        deliveryRadiusKm: Double? = nil
    ) {
        self.name = name
        self.city = city
        self.tagline = tagline
        self.description = description
        self.phone = phone
        self.address = address
        self.logoURL = logoURL
        self.coverImageURL = coverImageURL
        self.latitude = latitude
        self.longitude = longitude
        self.deliveryRadiusKm = deliveryRadiusKm
    }

    /// Üç alan da doluysa teslimat bölgesi, yoksa nil (kısıt yok).
    public var deliveryArea: DeliveryArea? {
        guard let latitude, let longitude, let deliveryRadiusKm, deliveryRadiusKm > 0 else {
            return nil
        }
        return DeliveryArea(latitude: latitude, longitude: longitude, radiusKm: deliveryRadiusKm)
    }
}

public struct DeliveryArea: Equatable, Sendable {
    public let latitude: Double
    public let longitude: Double
    public let radiusKm: Double

    public init(latitude: Double, longitude: Double, radiusKm: Double) {
        self.latitude = latitude
        self.longitude = longitude
        self.radiusKm = radiusKm
    }
}
