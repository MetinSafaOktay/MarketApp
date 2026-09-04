import Foundation

/// İki koordinat arası kuş uçuşu mesafe (km). Backend'deki haversineKm ile aynı.
public func haversineKm(
    _ lat1: Double,
    _ lon1: Double,
    _ lat2: Double,
    _ lon2: Double
) -> Double {
    let earthRadiusKm = 6371.0
    let toRad = { (deg: Double) in deg * .pi / 180 }
    let dLat = toRad(lat2 - lat1)
    let dLon = toRad(lon2 - lon1)
    let a =
        sin(dLat / 2) * sin(dLat / 2)
        + cos(toRad(lat1)) * cos(toRad(lat2)) * sin(dLon / 2) * sin(dLon / 2)
    return 2 * earthRadiusKm * asin(min(1, sqrt(a)))
}

extension DeliveryArea {
    /// Verilen koordinat bu bölgenin içinde mi?
    public func contains(latitude: Double, longitude: Double) -> Bool {
        haversineKm(self.latitude, self.longitude, latitude, longitude) <= radiusKm
    }
}
