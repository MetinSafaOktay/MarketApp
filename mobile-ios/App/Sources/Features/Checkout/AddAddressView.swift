import CoreLocation
import DesignSystem
import Domain
import Networking
import SwiftUI

/// Teslimat adresi formu — yeni ekleme veya (`editing` verilirse) düzenleme.
struct AddAddressView: View {
    @Environment(\.dependencies) private var deps
    @Environment(\.dismiss) private var dismiss
    var editing: Address?
    var onSaved: (Address) -> Void

    @State private var label = ""
    @State private var fullAddress = ""
    @State private var city = "Afyonkarahisar"
    @State private var district = ""
    @State private var buildingName = ""
    @State private var buildingNo = ""
    @State private var floor = ""
    @State private var apartmentNo = ""
    @State private var makeDefault = true
    @State private var coordinate: CLLocationCoordinate2D?
    @State private var deliveryArea: DeliveryArea?
    @State private var touched: Set<String> = []
    @State private var autofilled = false
    @State private var isSaving = false
    @State private var errorMessage: String?

    init(editing: Address? = nil, onSaved: @escaping (Address) -> Void) {
        self.editing = editing
        self.onSaved = onSaved
        if let a = editing {
            _label = State(initialValue: a.label)
            _fullAddress = State(initialValue: a.fullAddress)
            _city = State(initialValue: a.city)
            _district = State(initialValue: a.district)
            _buildingName = State(initialValue: a.buildingName)
            _buildingNo = State(initialValue: a.buildingNo)
            _floor = State(initialValue: a.floor)
            _apartmentNo = State(initialValue: a.apartmentNo)
            _makeDefault = State(initialValue: a.isDefault)
            _touched = State(initialValue: ["fullAddress", "city", "district"])
            if let lat = a.latitude, let lng = a.longitude {
                _coordinate = State(
                    initialValue: CLLocationCoordinate2D(latitude: lat, longitude: lng)
                )
            }
        }
    }

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
            && !buildingName.trimmed.isEmpty && !buildingNo.trimmed.isEmpty
            && !floor.trimmed.isEmpty && !apartmentNo.trimmed.isEmpty
            && coordinate != nil && !outside && !isSaving
    }

    private func applyResolved(_ r: ResolvedAddress) {
        if !touched.contains("fullAddress"), !r.fullAddress.isEmpty { fullAddress = r.fullAddress }
        if !touched.contains("city"), !r.city.isEmpty { city = r.city }
        if !touched.contains("district"), !r.district.isEmpty { district = r.district }
        if !r.fullAddress.isEmpty || !r.city.isEmpty || !r.district.isEmpty { autofilled = true }
    }

    var body: some View {
        Form {
            Section {
                TextField("Adres başlığı (ev, iş...)", text: $label)
            }
            Section("Harita üzerinde konum") {
                LocationPickerView(
                    coordinate: $coordinate,
                    area: deliveryArea,
                    onResolved: applyResolved
                )
                .listRowInsets(EdgeInsets())
                .padding(.vertical, Spacing.xs)
                if autofilled {
                    Text("Adres alanları haritadan dolduruldu — gerekirse düzeltin.")
                        .font(.caption).foregroundStyle(Palette.textMuted)
                }
            }
            Section {
                TextField("Açık adres", text: $fullAddress, axis: .vertical)
                    .lineLimit(2 ... 4)
                    .onChange(of: fullAddress) { touched.insert("fullAddress") }
                TextField("Şehir", text: $city)
                    .onChange(of: city) { touched.insert("city") }
                TextField("İlçe", text: $district)
                    .onChange(of: district) { touched.insert("district") }
            }
            Section {
                TextField("Bina adı", text: $buildingName)
                TextField("Bina no", text: $buildingNo)
                TextField("Kat", text: $floor)
                TextField("Daire no", text: $apartmentNo)
            } footer: {
                Text("Bina, kat ve daire bilgisi haritadan doldurulmaz — elle girin.")
            }
            Section {
                Toggle("Varsayılan adres yap", isOn: $makeDefault)
            }
            if let errorMessage {
                Section { Text(errorMessage).foregroundStyle(Palette.danger).font(.footnote) }
            }
        }
        .tint(Palette.accent)
        .navigationTitle(editing == nil ? "Yeni adres" : "Adresi düzenle")
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
        let input = NewAddress(
            label: label.trimmed,
            fullAddress: fullAddress.trimmed,
            city: city.trimmed,
            district: district.trimmed,
            buildingName: buildingName.trimmed,
            buildingNo: buildingNo.trimmed,
            floor: floor.trimmed,
            apartmentNo: apartmentNo.trimmed,
            isDefault: makeDefault,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude
        )
        do {
            let address =
                if let editing {
                    try await deps.address.update(id: editing.id, input)
                } else {
                    try await deps.address.create(input)
                }
            onSaved(address)
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
