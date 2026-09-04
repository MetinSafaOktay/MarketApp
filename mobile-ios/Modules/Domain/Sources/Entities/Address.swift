import Foundation

public struct Address: Identifiable, Equatable, Sendable {
    public let id: String
    public let label: String
    public let fullAddress: String
    public let city: String
    public let district: String
    public let buildingName: String
    public let buildingNo: String
    public let floor: String
    public let apartmentNo: String
    public let isDefault: Bool
    public let latitude: Double?
    public let longitude: Double?

    public init(
        id: String,
        label: String,
        fullAddress: String,
        city: String,
        district: String,
        buildingName: String = "",
        buildingNo: String = "",
        floor: String = "",
        apartmentNo: String = "",
        isDefault: Bool,
        latitude: Double? = nil,
        longitude: Double? = nil
    ) {
        self.id = id
        self.label = label
        self.fullAddress = fullAddress
        self.city = city
        self.district = district
        self.buildingName = buildingName
        self.buildingNo = buildingNo
        self.floor = floor
        self.apartmentNo = apartmentNo
        self.isDefault = isDefault
        self.latitude = latitude
        self.longitude = longitude
    }

    public var summary: String {
        "\(district), \(city)"
    }

    /// Bina/kat/daire kısmı — "Erenler Apt, No 12, Kat 3, Daire 7".
    public var buildingLine: String {
        [
            buildingName.isEmpty ? nil : buildingName,
            buildingNo.isEmpty ? nil : "No \(buildingNo)",
            floor.isEmpty ? nil : "Kat \(floor)",
            apartmentNo.isEmpty ? nil : "Daire \(apartmentNo)",
        ].compactMap { $0 }.joined(separator: ", ")
    }

    /// Tek satırlık tam adres (bina/kat/daire dahil).
    public var fullLine: String {
        [
            fullAddress.isEmpty ? nil : fullAddress,
            buildingLine.isEmpty ? nil : buildingLine,
            "\(district)/\(city)",
        ].compactMap { $0 }.joined(separator: " · ")
    }
}

/// Yeni adres girişi.
public struct NewAddress: Sendable, Equatable {
    public var label: String
    public var fullAddress: String
    public var city: String
    public var district: String
    public var buildingName: String
    public var buildingNo: String
    public var floor: String
    public var apartmentNo: String
    public var isDefault: Bool
    public var latitude: Double?
    public var longitude: Double?

    public init(
        label: String,
        fullAddress: String,
        city: String,
        district: String,
        buildingName: String = "",
        buildingNo: String = "",
        floor: String = "",
        apartmentNo: String = "",
        isDefault: Bool = false,
        latitude: Double? = nil,
        longitude: Double? = nil
    ) {
        self.label = label
        self.fullAddress = fullAddress
        self.city = city
        self.district = district
        self.buildingName = buildingName
        self.buildingNo = buildingNo
        self.floor = floor
        self.apartmentNo = apartmentNo
        self.isDefault = isDefault
        self.latitude = latitude
        self.longitude = longitude
    }
}
