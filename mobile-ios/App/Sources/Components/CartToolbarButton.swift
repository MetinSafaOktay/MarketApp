import DesignSystem
import SwiftUI

/// Üst çubuktaki sepet düğmesi + ürün adedi rozeti.
struct CartToolbarButton: View {
    @Environment(\.dependencies) private var deps
    @State private var showingCart = false

    var body: some View {
        Button {
            showingCart = true
        } label: {
            Image(systemName: "bag")
                .foregroundStyle(Palette.accent)
                .overlay(alignment: .topTrailing) {
                    if deps.cartStore.itemCount > 0 {
                        Text("\(deps.cartStore.itemCount)")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(Palette.onAccent)
                            .padding(2)
                            .frame(minWidth: 16)
                            .background(Palette.accent, in: .circle)
                            .offset(x: 8, y: -8)
                    }
                }
        }
        .accessibilityLabel("Sepet")
        .sheet(isPresented: $showingCart) {
            NavigationStack {
                CartView()
            }
        }
    }
}
