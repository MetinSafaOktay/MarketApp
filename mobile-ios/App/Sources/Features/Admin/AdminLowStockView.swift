import DesignSystem
import Domain
import SwiftUI

struct AdminLowStockView: View {
    @Environment(\.dependencies) private var deps

    var body: some View {
        Inner(deps: deps)
            .navigationTitle("Azalan stok")
            .navigationBarTitleDisplayMode(.inline)
    }
}

private struct Inner: View {
    @State private var model: AdminLowStockModel

    init(deps: AppDependencies) {
        _model = State(wrappedValue: AdminLowStockModel(deps: deps))
    }

    var body: some View {
        Group {
            switch model.phase {
            case .loading:
                ProgressView().tint(Palette.textMuted)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            case .failed(let message):
                ContentUnavailableView {
                    Label(message, systemImage: "exclamationmark.triangle")
                } actions: {
                    Button("Tekrar dene") { Task { await model.load() } }
                        .buttonStyle(.bordered).tint(Palette.accent)
                }
            case .empty:
                ContentUnavailableView("Stok seviyeleri iyi görünüyor", systemImage: "checkmark.seal")
            case .loaded(let products):
                ScrollView {
                    LazyVStack(spacing: Spacing.md) {
                        ForEach(products) { product in
                            LowStockRow(product: product)
                        }
                    }
                    .padding(Spacing.lg)
                }
                .refreshable { await model.load() }
            }
        }
        .background(Palette.background)
        .task { await model.loadIfNeeded() }
    }
}

private struct LowStockRow: View {
    let product: LowStockProduct

    var body: some View {
        HStack(spacing: Spacing.md) {
            VStack(alignment: .leading, spacing: 2) {
                Text(product.name).font(.subheadline.weight(.medium)).foregroundStyle(Palette.text)
                let subtitle = [product.categoryName, product.sku]
                    .compactMap { $0 }.joined(separator: " · ")
                if !subtitle.isEmpty {
                    Text(subtitle).font(.caption).foregroundStyle(Palette.textMuted)
                }
            }
            Spacer()
            Badge(
                product.isOutOfStock ? "Tükendi" : "\(product.stockQuantity) adet",
                style: product.isOutOfStock ? .danger : .neutral
            )
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface()
    }
}
