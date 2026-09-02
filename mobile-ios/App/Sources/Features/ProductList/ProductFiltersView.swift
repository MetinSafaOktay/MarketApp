import DesignSystem
import Domain
import SwiftUI

/// Sıralama + hızlı filtreler için alt sayfa.
struct ProductFiltersView: View {
    @Environment(\.dismiss) private var dismiss

    @State private var sort: ProductSort
    @State private var onlyDiscounted: Bool
    @State private var onlyNew: Bool
    @State private var inStock: Bool

    private let base: ProductQuery
    private let onApply: (ProductQuery) -> Void

    init(query: ProductQuery, onApply: @escaping (ProductQuery) -> Void) {
        base = query
        self.onApply = onApply
        _sort = State(initialValue: query.sort)
        _onlyDiscounted = State(initialValue: query.onlyDiscounted)
        _onlyNew = State(initialValue: query.onlyNew)
        _inStock = State(initialValue: query.inStock)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Sıralama") {
                    Picker("Sıralama", selection: $sort) {
                        Text("En yeni").tag(ProductSort.newest)
                        Text("Fiyat: düşükten yükseğe").tag(ProductSort.priceAscending)
                        Text("Fiyat: yüksekten düşüğe").tag(ProductSort.priceDescending)
                    }
                    .pickerStyle(.inline)
                    .labelsHidden()
                }

                Section("Filtreler") {
                    Toggle("Sadece indirimli", isOn: $onlyDiscounted)
                    Toggle("Sadece yeni ürünler", isOn: $onlyNew)
                    Toggle("Sadece stokta olanlar", isOn: $inStock)
                }
            }
            .tint(Palette.accent)
            .navigationTitle("Filtrele")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Sıfırla", action: reset)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Uygula", action: apply).fontWeight(.semibold)
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func reset() {
        sort = .newest
        onlyDiscounted = false
        onlyNew = false
        inStock = false
    }

    private func apply() {
        var updated = base
        updated.sort = sort
        updated.onlyDiscounted = onlyDiscounted
        updated.onlyNew = onlyNew
        updated.inStock = inStock
        updated.page = 1
        onApply(updated)
        dismiss()
    }
}
