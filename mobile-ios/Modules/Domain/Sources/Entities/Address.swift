import Foundation

public struct Address: Identifiable, Equatable, Sendable {
    public let id: String
    public let label: String
    public let fullAddress: String
    public let city: String
    public let district: String
    public let isDefault: Bool

    public init(
        id: String,
        label: String,
        fullAddress: String,
        city: String,
        district: String,
        isDefault: Bool
    ) {
        self.id = id
        self.label = label
        self.fullAddress = fullAddress
        self.city = city
        self.district = district
        self.isDefault = isDefault
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

    public init(
        label: String,
        fullAddress: String,
        city: String,
        district: String,
        isDefault: Bool = false
    ) {
        self.label = label
        self.fullAddress = fullAddress
        self.city = city
        self.district = district
        self.isDefault = isDefault
    }
}
