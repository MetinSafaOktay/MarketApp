import DesignSystem
import SwiftUI

/// M1 yer tutucu. M2'de kategori grid'i.
struct CategoriesView: View {
    var body: some View {
        NavigationStack {
            ContentUnavailableView(
                "Kategoriler",
                systemImage: "square.grid.2x2",
                description: Text("Kategori listesi yakında (M2)")
            )
            .background(Palette.background)
            .navigationTitle("Kategoriler")
        }
    }
}

#Preview { CategoriesView() }
