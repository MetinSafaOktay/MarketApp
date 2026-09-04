import CoreLocation
import DesignSystem
import Domain
import MapKit
import Observation
import SwiftUI

/// Koordinattan çözülen adres — form bunlarla ön-doldurulur.
struct ResolvedAddress {
    var fullAddress = ""
    var city = ""
    var district = ""
}

/// Adres için haritadan konum seçimi. Pin ekranın ortasında sabittir; kullanıcı
/// haritayı kaydırır, merkez koordinat `coordinate`'a yazılır. Teslimat bölgesi
/// (varsa) kesikli daire olarak çizilir. Pin durunca `CLGeocoder` ile ters
/// geocode yapılıp `onResolved` çağrılır.
struct LocationPickerView: View {
    @Binding var coordinate: CLLocationCoordinate2D?
    let area: DeliveryArea?
    var onResolved: ((ResolvedAddress) -> Void)?

    // Konum bilinmiyorsa harita buraya ortalanır (Afyonkarahisar merkez).
    private static let fallback = CLLocationCoordinate2D(latitude: 38.7507, longitude: 30.5433)

    @State private var camera: MapCameraPosition
    @State private var center: CLLocationCoordinate2D
    @State private var location = LocationProvider()
    @State private var geocodeTask: Task<Void, Never>?
    @State private var geocoder = CLGeocoder()

    init(
        coordinate: Binding<CLLocationCoordinate2D?>,
        area: DeliveryArea?,
        onResolved: ((ResolvedAddress) -> Void)? = nil
    ) {
        _coordinate = coordinate
        self.area = area
        self.onResolved = onResolved
        let start =
            coordinate.wrappedValue
            ?? area.map { CLLocationCoordinate2D(latitude: $0.latitude, longitude: $0.longitude) }
            ?? Self.fallback
        _center = State(initialValue: start)
        let span = area.map { max(0.03, $0.radiusKm / 45) } ?? 0.04
        _camera = State(
            initialValue: .region(
                MKCoordinateRegion(
                    center: start,
                    span: MKCoordinateSpan(latitudeDelta: span, longitudeDelta: span)
                )
            )
        )
    }

    private var distanceKm: Double? {
        guard let area else { return nil }
        return haversineKm(area.latitude, area.longitude, center.latitude, center.longitude)
    }

    private var outside: Bool {
        guard let area, let distanceKm else { return false }
        return distanceKm > area.radiusKm
    }

    /// Pin durunca ~0.8 sn sonra ters geocode. Yeni hareket olursa iptal edilir.
    private func scheduleReverseGeocode(_ coord: CLLocationCoordinate2D) {
        guard onResolved != nil else { return }
        geocodeTask?.cancel()
        geocodeTask = Task {
            try? await Task.sleep(for: .seconds(0.8))
            guard !Task.isCancelled else { return }
            geocoder.cancelGeocode()
            let location = CLLocation(latitude: coord.latitude, longitude: coord.longitude)
            let placemarks = try? await geocoder.reverseGeocodeLocation(
                location, preferredLocale: Locale(identifier: "tr_TR")
            )
            guard !Task.isCancelled, let p = placemarks?.first else { return }

            let neighbourhood = p.subLocality ?? ""
            let road = p.thoroughfare ?? ""
            let houseNumber = p.subThoroughfare ?? ""
            let full = [
                neighbourhood.isEmpty ? nil : "\(neighbourhood) Mah.",
                road.isEmpty ? nil : road,
                houseNumber.isEmpty ? nil : "No \(houseNumber)",
            ]
            .compactMap { $0 }
            .joined(separator: " ")

            onResolved?(
                ResolvedAddress(
                    fullAddress: full,
                    city: p.administrativeArea ?? "",
                    district: p.subAdministrativeArea ?? p.locality ?? ""
                )
            )
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            ZStack {
                Map(position: $camera) {
                    if let area {
                        MapCircle(
                            center: CLLocationCoordinate2D(
                                latitude: area.latitude, longitude: area.longitude
                            ),
                            radius: area.radiusKm * 1000
                        )
                        .foregroundStyle(Palette.accent.opacity(0.12))
                        .stroke(Palette.danger, lineWidth: 1.5)
                    }
                }
                .mapControls { MapUserLocationButton() }
                .onMapCameraChange(frequency: .onEnd) { context in
                    center = context.region.center
                    coordinate = context.region.center
                    scheduleReverseGeocode(context.region.center)
                }
                .frame(height: 240)
                .clipShape(RoundedRectangle(cornerRadius: Radius.card))

                // Sabit merkez pini (ucu tam merkezde).
                Image(systemName: "mappin")
                    .font(.title)
                    .foregroundStyle(Palette.danger)
                    .offset(y: -14)
                    .allowsHitTesting(false)

                Button {
                    location.request { coord in
                        withAnimation {
                            camera = .region(
                                MKCoordinateRegion(
                                    center: coord,
                                    span: MKCoordinateSpan(latitudeDelta: 0.01, longitudeDelta: 0.01)
                                )
                            )
                        }
                    }
                } label: {
                    Label("Konumumu kullan", systemImage: "location.fill")
                        .font(.caption.weight(.medium))
                        .padding(.horizontal, Spacing.sm)
                        .padding(.vertical, 6)
                        .background(.regularMaterial, in: Capsule())
                }
                .buttonStyle(.plain)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .padding(Spacing.sm)
            }

            Text(
                "Haritayı kaydırarak pini tam konumunuza getirin."
                    + (distanceKm.map { String(format: " Mağazaya ~%.1f km.", $0) } ?? "")
            )
            .font(.caption).foregroundStyle(Palette.textMuted)

            if outside, let area {
                Text("Bu konum teslimat bölgesinin dışında (en fazla \(Int(area.radiusKm)) km).")
                    .font(.caption).foregroundStyle(Palette.danger)
            }
            if let error = location.error {
                Text(error).font(.caption).foregroundStyle(Palette.danger)
            }
        }
    }
}

/// `CLLocationManager` etrafında ince sarmalayıcı — tek seferlik konum isteği.
@MainActor
@Observable
final class LocationProvider: NSObject, CLLocationManagerDelegate {
    private(set) var error: String?
    @ObservationIgnored private let manager = CLLocationManager()
    @ObservationIgnored private var onFix: ((CLLocationCoordinate2D) -> Void)?

    override init() {
        super.init()
        manager.delegate = self
    }

    func request(_ completion: @escaping (CLLocationCoordinate2D) -> Void) {
        error = nil
        onFix = completion
        switch manager.authorizationStatus {
        case .notDetermined:
            manager.requestWhenInUseAuthorization()
        case .denied, .restricted:
            error = "Konum izni kapalı. Ayarlar'dan açabilirsiniz."
        default:
            manager.requestLocation()
        }
    }

    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor in
            switch self.manager.authorizationStatus {
            case .authorizedWhenInUse, .authorizedAlways:
                self.manager.requestLocation()
            case .denied, .restricted:
                self.error = "Konum izni kapalı. Ayarlar'dan açabilirsiniz."
            default:
                break
            }
        }
    }

    nonisolated func locationManager(
        _ manager: CLLocationManager,
        didUpdateLocations locations: [CLLocation]
    ) {
        guard let coord = locations.last?.coordinate else { return }
        Task { @MainActor in
            self.onFix?(coord)
            self.onFix = nil
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in self.error = "Konum alınamadı." }
    }
}
