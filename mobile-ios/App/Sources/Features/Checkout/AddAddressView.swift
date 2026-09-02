import DesignSystem
import Domain
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
    @State private var isSaving = false
    @State private var errorMessage: String?

    private var canSave: Bool {
        !label.trimmed.isEmpty && !fullAddress.trimmed.isEmpty
            && !city.trimmed.isEmpty && !district.trimmed.isEmpty && !isSaving
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
            if let errorMessage {
                Section { Text(errorMessage).foregroundStyle(Palette.danger).font(.footnote) }
            }
        }
        .tint(Palette.accent)
        .navigationTitle("Yeni adres")
        .navigationBarTitleDisplayMode(.inline)
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
        isSaving = true
        errorMessage = nil
        defer { isSaving = false }
        do {
            let address = try await deps.address.create(NewAddress(
                label: label.trimmed,
                fullAddress: fullAddress.trimmed,
                city: city.trimmed,
                district: district.trimmed,
                isDefault: makeDefault
            ))
            onCreated(address)
            dismiss()
        } catch {
            errorMessage = "Adres kaydedilemedi"
        }
    }
}

extension String {
    fileprivate var trimmed: String {
        trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
