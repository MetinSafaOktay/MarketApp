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
            .catalogDestinations()
        }
    }
}

#Preview {
    StoreView().environment(\.dependencies, .preview)
}
