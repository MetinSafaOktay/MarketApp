import Domain
import SwiftUI

/// Mağaza sekmesi: arama + filtre + sayfalı tüm ürün listesi.
struct StoreView: View {
    var body: some View {
        NavigationStack {
            ProductListScreen(
                spec: ProductListSpec(
                    title: "Mağaza",
                    query: ProductQuery(),
                    showsControls: true
                )
            )
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) { CartToolbarButton() }
            }
            .catalogDestinations()
        }
    }
}

#Preview {
    StoreView().environment(\.dependencies, .preview)
}
