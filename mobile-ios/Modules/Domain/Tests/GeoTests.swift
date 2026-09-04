import Testing
@testable import Domain

struct GeoTests {
    @Test func samepoint() {
        #expect(haversineKm(38.75, 30.54, 38.75, 30.54) == 0)
    }

    @Test func oneDegreeLatitude() {
        let d = haversineKm(38, 30, 39, 30)
        #expect(d > 110 && d < 112)
    }

    @Test func deliveryAreaContains() {
        let area = DeliveryArea(latitude: 38.7569, longitude: 30.5387, radiusKm: 5)
        #expect(area.contains(latitude: 38.7569 + 0.02, longitude: 30.5387)) // ~2.2 km
        #expect(!area.contains(latitude: 38.7569 + 0.1, longitude: 30.5387)) // ~11 km
    }

    @Test func storeProfileDeliveryArea() {
        let configured = StoreProfile(
            name: "X", latitude: 38.7, longitude: 30.5, deliveryRadiusKm: 4
        )
        #expect(configured.deliveryArea != nil)

        let partial = StoreProfile(name: "X", latitude: 38.7)
        #expect(partial.deliveryArea == nil)

        let zeroRadius = StoreProfile(
            name: "X", latitude: 38.7, longitude: 30.5, deliveryRadiusKm: 0
        )
        #expect(zeroRadius.deliveryArea == nil)
    }
}
