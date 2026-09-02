import DesignSystem
import Domain
import SwiftUI

struct WishlistView: View {
    @Environment(\.dependencies) private var deps

    private let columns = [
        GridItem(.flexible(), spacing: Spacing.md),
        GridItem(.flexible(), spacing: Spacing.md)
    ]

    var body: some View {
        Group {
            if !deps.session.isSignedIn {
                SignInPrompt(message: "Favorilerini görmek için giriş yap.")
            } else if deps.wishlistStore.products.isEmpty {
                ContentUnavailableView(
                    "Favori listen boş",
                    systemImage: "heart",
                    description: Text("Beğendiğin ürünleri kalbe dokunarak ekle.")
                )
            } else {
                ScrollView {
                    LazyVGrid(columns: columns, spacing: Spacing.md) {
                        ForEach(deps.wishlistStore.products) { product in
                            ProductCardView(product: product)
                        }
                    }
                    .padding(Spacing.lg)
                }
                .refreshable { await deps.wishlistStore.refresh() }
            }
        }
        .background(Palette.background)
        .navigationTitle("Favorilerim")
        .navigationBarTitleDisplayMode(.inline)
        .catalogDestinations()
        .task { await deps.wishlistStore.refresh() }
    }
}
