import DesignSystem
import SwiftUI

struct RootTabView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("Ana Sayfa", systemImage: "house.fill") }

            StoreView()
                .tabItem { Label("Mağaza", systemImage: "bag.fill") }

            CategoriesView()
                .tabItem { Label("Kategoriler", systemImage: "square.grid.2x2.fill") }
        }
        .tint(Palette.accent)
    }
}

#Preview {
    RootTabView()
        .environment(\.dependencies, .preview)
}
