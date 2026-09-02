import DesignSystem
import SwiftUI

/// M1 yer tutucu. M2'de ürün listesi + arama + filtre + sayfalama.
struct StoreView: View {
    var body: some View {
        NavigationStack {
            ContentUnavailableView(
                "Mağaza",
                systemImage: "bag",
                description: Text("Ürün listesi yakında (M2)")
            )
            .background(Palette.background)
            .navigationTitle("Mağaza")
        }
    }
}

#Preview { StoreView() }
