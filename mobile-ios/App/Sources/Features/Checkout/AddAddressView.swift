import CoreLocation
import DesignSystem
import Domain
import Networking
import SwiftUI

/// Yeni teslimat adresi formu.
struct AddAddressView: View {
    @Environment(\.dependencies) private var deps
    @Environment(\.dismiss) private var dismiss
    var onCreated: (Address) -> Void

    @State private var label = ""
    @State private var fullAddress = ""
    @State private var city = "Afyonkarahisar"
    @State private var district = ""
    @State private var makeDefault = true
    @State private var coordinate: CLLocationCoordinate2D?
    @State private var deliveryArea: DeliveryArea?
    @State private var isSaving = false
    @State private var errorMessage: String?

    private var outside: Bool {
        guard let deliveryArea, let coordinate else { return false }
        return !deliveryArea.contains(
            latitude: coordinate.latitude,
            longitude: coordinate.longitude
        )
    }

    private var canSave: Bool {
        !label.trimmed.isEmpty && !fullAddress.trimmed.isEmpty
            && !city.trimmed.isEmpty && !district.trimmed.isEmpty
            && coordinate != nil && !outside && !isSaving
    }

    var body: some View {
        Form {
            Section {
                TextField("Adres başlığı (ev, iş...)", text: $label)
                TextField("Açık adres", text: $fullAddress, axis: .vertical)
                    .lineLimit(2 ... 4)
                TextField("Şehir", text: $city)
                TextField("İlçe", text: $district)
                Toggle("Varsayılan adres yap", isOn: $makeDefault)
            }
            Section("Harita üzerinde konum") {
                LocationPickerView(coordinate: $coordinate, area: deliveryArea)
                    .listRowInsets(EdgeInsets())
                    .padding(.vertical, Spacing.xs)
            }
            if let errorMessage {
                Section { Text(errorMessage).foregroundStyle(Palette.danger).font(.footnote) }
            }
        }
        .tint(Palette.accent)
        .navigationTitle("Yeni adres")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            deliveryArea = (try? await deps.storefront.storeProfile(language: deps.language))?
                .deliveryArea
        }
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button("Vazgeç") { dismiss() }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button("Kaydet") { Task { await save() } }
                    .fontWeight(.semibold)
                    .disabled(!canSave)
            }
        }
    }

    private func save() async {
        guard let coordinate else { return }
        isSaving = true
        errorMessage = nil
        defer { isSaving = false }
        do {
            let address = try await deps.address.create(NewAddress(
                label: label.trimmed,
                fullAddress: fullAddress.trimmed,
                city: city.trimmed,
                district: district.trimmed,
                isDefault: makeDefault,
                latitude: coordinate.latitude,
                longitude: coordinate.longitude
            ))
            onCreated(address)
            dismiss()
        } catch {
            errorMessage = (error as? APIError)?.displayMessage ?? "Adres kaydedilemedi"
        }
    }
}

extension String {
    fileprivate var trimmed: String {
        trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
