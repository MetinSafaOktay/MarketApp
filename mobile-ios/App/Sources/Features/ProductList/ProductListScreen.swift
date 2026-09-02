import Domain
import SwiftUI

/// Filtrelenmiş ürün listesi ekranı: kategori detayı, ana sayfa "tümünü gör"
/// hedefi ve (`showsControls` ile) Mağaza sekmesinin gövdesi.
struct ProductListScreen: View {
    @Environment(\.dependencies) private var deps
    let spec: ProductListSpec

    var body: some View {
        Inner(spec: spec, deps: deps)
    }
}

private struct Inner: View {
    @State private var model: ProductListModel
    @State private var searchText: String
    @State private var showingFilters = false

    private let showsControls: Bool
    private let title: String

    init(spec: ProductListSpec, deps: AppDependencies) {
        _model = State(wrappedValue: ProductListModel(deps: deps, query: spec.query))
        _searchText = State(initialValue: spec.query.search ?? "")
        showsControls = spec.showsControls
        title = spec.title
    }

    var body: some View {
        ProductGrid(model: model)
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(showsControls ? .large : .inline)
            .toolbar {
                if showsControls {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button {
                            showingFilters = true
                        } label: {
                            Label(
                                "Filtrele",
                                systemImage: model.query.hasActiveFilters
                                    ? "line.3.horizontal.decrease.circle.fill"
                                    : "line.3.horizontal.decrease.circle"
                            )
                        }
                    }
                }
            }
            .conditionalSearchable(enabled: showsControls, text: $searchText)
            .task(id: searchText) { await debounceSearch() }
            .sheet(isPresented: $showingFilters) {
                ProductFiltersView(query: model.query) { updated in
                    model.query = updated
                    Task { await model.applyQueryChange() }
                }
            }
            .task { await model.loadIfNeeded() }
    }

    private func debounceSearch() async {
        let trimmed = searchText.trimmingCharacters(in: .whitespaces)
        let normalized = trimmed.isEmpty ? nil : trimmed
        guard normalized != model.query.search else { return }
        try? await Task.sleep(for: .milliseconds(350))
        guard !Task.isCancelled else { return }
        model.query.search = normalized
        await model.applyQueryChange()
    }
}

extension View {
    @ViewBuilder
    fileprivate func conditionalSearchable(enabled: Bool, text: Binding<String>) -> some View {
        if enabled {
            searchable(text: text, prompt: "Ürün ara")
        } else {
            self
        }
    }
}
