import DesignSystem
import SwiftUI

/// Üst çubuktaki bildirim (zil) düğmesi + okunmamış rozeti.
struct NotificationsToolbarButton: View {
    @Environment(\.dependencies) private var deps
    @State private var showing = false

    var body: some View {
        Button {
            showing = true
        } label: {
            Image(systemName: "bell")
                .foregroundStyle(Palette.accent)
                .overlay(alignment: .topTrailing) { badge }
        }
        .accessibilityLabel("Bildirimler")
        .sheet(isPresented: $showing) {
            NavigationStack { NotificationsView() }
                .presentationDragIndicator(.visible)
        }
    }

    @ViewBuilder
    private var badge: some View {
        let count = deps.notificationsStore.unreadCount
        if count > 0 {
            Text("\(count)")
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(Palette.onAccent)
                .padding(2)
                .frame(minWidth: 16)
                .background(Palette.accent, in: .circle)
                .offset(x: 8, y: -8)
        }
    }
}

/// Üst çubuktaki mesaj düğmesi.
struct MessagesToolbarButton: View {
    @State private var showing = false

    var body: some View {
        Button {
            showing = true
        } label: {
            Image(systemName: "bubble.left.and.bubble.right")
                .foregroundStyle(Palette.accent)
        }
        .accessibilityLabel("Mesajlar")
        .sheet(isPresented: $showing) {
            NavigationStack { MessagesView() }
                .presentationDragIndicator(.visible)
        }
    }
}
