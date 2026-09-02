import DesignSystem
import Domain
import SwiftUI

/// Kategoriler sekmesi: ızgara; dokununca o kategorinin ürün listesi açılır.
struct CategoriesView: View {
    @Environment(\.dependencies) private var deps

    var body: some View {
        NavigationStack {
            Inner(deps: deps)
                .navigationTitle("Kategoriler")
                .catalogDestinations()
        }
    }
}

private struct Inner: View {
    @State private var model: CategoriesModel

    init(deps: AppDependencies) {
        _model = State(wrappedValue: CategoriesModel(deps: deps))
    }

    private let columns = [
        GridItem(.flexible(), spacing: Spacing.md),
        GridItem(.flexible(), spacing: Spacing.md)
    ]

    var body: some View {
        Group {
            switch model.phase {
            case .loading:
                ProgressView().tint(Palette.textMuted)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)

            case .failed(let message):
                ContentUnavailableView {
                    Label(message, systemImage: "wifi.slash")
                } actions: {
                    Button("Tekrar dene") { Task { await model.load() } }
                        .buttonStyle(.bordered)
                        .tint(Palette.accent)
                }

            case .loaded(let categories):
                grid(categories)
            }
        }
        .background(Palette.background)
        .task { await model.loadIfNeeded() }
    }

    private func grid(_ categories: [ProductCategory]) -> some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: Spacing.md) {
                ForEach(categories) { category in
                    NavigationLink(value: route(for: category)) {
                        CategoryTile(category: category)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(Spacing.lg)
        }
        .refreshable { await model.load() }
    }

    private func route(for category: ProductCategory) -> CatalogRoute {
        .productList(ProductListSpec(
            title: category.name,
            query: ProductQuery(categoryID: category.id)
        ))
    }
}

private struct CategoryTile: View {
    let category: ProductCategory

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            RemoteImage(url: category.imageURL, contentMode: .fill) {
                Image(systemName: "square.grid.2x2")
                    .font(.title2)
                    .foregroundStyle(Palette.textMuted)
            }
            .frame(height: 100)
            .frame(maxWidth: .infinity)
            .clipShape(.rect(cornerRadius: Radius.button))

            Text(category.name)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Palette.text)
                .lineLimit(2)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(Spacing.sm)
        .cardSurface(padding: nil)
    }
}
