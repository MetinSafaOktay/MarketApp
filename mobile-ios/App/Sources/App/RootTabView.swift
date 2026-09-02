import DesignSystem
import SwiftUI

struct RootTabView: View {
    @Environment(\.dependencies) private var deps

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
        .task { await deps.session.restore() }
        .task(id: deps.session.isSignedIn) {
            if deps.session.isSignedIn {
                await deps.cartStore.refresh()
                await deps.wishlistStore.refresh()
                await deps.notificationsStore.refresh()
            } else {
                deps.cartStore.clearLocal()
                deps.wishlistStore.clearLocal()
                deps.notificationsStore.clearLocal()
            }
        }
    }
}

#Preview {
    RootTabView()
        .environment(\.dependencies, .preview)
}
