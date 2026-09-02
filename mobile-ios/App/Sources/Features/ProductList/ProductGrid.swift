import DesignSystem
import Domain
import SwiftUI

/// Ürün ızgarası + sonsuz kaydırma + boş/hata/yükleniyor durumları.
struct ProductGrid: View {
    @Bindable var model: ProductListModel

    private let columns = [
        GridItem(.flexible(), spacing: Spacing.md),
        GridItem(.flexible(), spacing: Spacing.md)
    ]

    var body: some View {
        switch model.phase {
        case .loading:
            ProgressView()
                .tint(Palette.textMuted)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Palette.background)

        case .failed(let message):
            ContentUnavailableView {
                Label(message, systemImage: "wifi.slash")
            } actions: {
                Button("Tekrar dene") { Task { await model.reload() } }
                    .buttonStyle(.bordered)
                    .tint(Palette.accent)
            }
            .background(Palette.background)

        case .empty:
            ContentUnavailableView(
                "Ürün bulunamadı",
                systemImage: "magnifyingglass",
                description: Text("Filtreleri değiştirmeyi dene.")
            )
            .background(Palette.background)

        case .loaded:
            grid
        }
    }

    private var grid: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: Spacing.md) {
                ForEach(model.products) { product in
                    ProductCardView(product: product)
                        .task { await model.loadMore(after: product) }
                }
            }
            .padding(Spacing.lg)

            if model.isLoadingMore {
                ProgressView().tint(Palette.textMuted).padding(.bottom, Spacing.xl)
            }
        }
        .background(Palette.background)
        .refreshable { await model.reload() }
    }
}
