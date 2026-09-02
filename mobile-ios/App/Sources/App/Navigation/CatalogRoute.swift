import Domain
import SwiftUI

/// Katalog akışındaki değer-tabanlı yönlendirme hedefleri.
enum CatalogRoute: Hashable {
    case product(id: String, name: String)
    case productList(ProductListSpec)
}

/// Filtrelenmiş bir ürün listesi ekranının tanımı (başlık + sorgu).
struct ProductListSpec: Hashable {
    var title: String
    var query: ProductQuery
    /// true → arama çubuğu ve filtre düğmesi gösterilir (Mağaza sekmesi).
    var showsControls = false
}

extension View {
    /// Katalog hedeflerini bir NavigationStack'e bağlar.
    func catalogDestinations() -> some View {
        navigationDestination(for: CatalogRoute.self) { route in
            switch route {
            case .product(let id, let name):
                ProductDetailView(productID: id, fallbackTitle: name)
            case .productList(let spec):
                ProductListScreen(spec: spec)
            }
        }
    }
}
