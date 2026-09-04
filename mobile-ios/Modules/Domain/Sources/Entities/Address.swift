import Foundation

public struct Address: Identifiable, Equatable, Sendable {
    public let id: String
    public let label: String
    public let fullAddress: String
    public let city: String
    public let district: String
    public let isDefault: Bool
    public let latitude: Double?
    public let longitude: Double?

    public init(
        id: String,
        label: String,
        fullAddress: String,
        city: String,
        district: String,
        isDefault: Bool,
        latitude: Double? = nil,
        longitude: Double? = nil
    ) {
        self.id = id
        self.label = label
        self.fullAddress = fullAddress
        self.city = city
        self.district = district
        self.isDefault = isDefault
        self.latitude = latitude
        self.longitude = longitude
    }

    public var summary: String {
        "\(district), \(city)"
    }
}

/// Yeni adres girişi.
public struct NewAddress: Sendable, Equatable {
    public var label: String
    public var fullAddress: String
    public var city: String
    public var district: String
    public var isDefault: Bool
    public var latitude: Double?
    public var longitude: Double?

    public init(
        label: String,
        fullAddress: String,
        city: String,
        district: String,
        isDefault: Bool = false,
        latitude: Double? = nil,
        longitude: Double? = nil
    ) {
        self.label = label
        self.fullAddress = fullAddress
        self.city = city
        self.district = district
        self.isDefault = isDefault
        self.latitude = latitude
        self.longitude = longitude
    }
}
