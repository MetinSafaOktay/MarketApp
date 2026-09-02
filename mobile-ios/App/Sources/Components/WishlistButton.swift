import DesignSystem
import Domain
import SwiftUI

/// Kalp düğmesi. Oturum yoksa girişe yönlendirir.
struct WishlistButton: View {
    @Environment(\.dependencies) private var deps
    let product: Product
    var size: Font = .body

    @State private var showingAuth = false

    var body: some View {
        Button {
            Task {
                let handled = await deps.wishlistStore.toggle(product)
                if !handled {
                    showingAuth = true
                }
            }
        } label: {
            Image(systemName: deps.wishlistStore.isWishlisted(product.id) ? "heart.fill" : "heart")
                .font(size)
                .foregroundStyle(deps.wishlistStore.isWishlisted(product.id) ? Palette
                    .brand : Palette.textMuted)
                .padding(Spacing.xs)
                .background(Palette.surface.opacity(0.9), in: .circle)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("İstek listesi")
        .sheet(isPresented: $showingAuth) {
            NavigationStack {
                AuthView(onAuthenticated: {
                    showingAuth = false
                    Task { await deps.wishlistStore.toggle(product) }
                })
            }
        }
    }
}
