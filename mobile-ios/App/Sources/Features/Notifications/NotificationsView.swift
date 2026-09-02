import DesignSystem
import Domain
import SwiftUI

struct NotificationsView: View {
    @Environment(\.dependencies) private var deps

    var body: some View {
        Group {
            if !deps.session.isSignedIn {
                SignInPrompt(message: "Bildirimlerini görmek için giriş yap.")
            } else if deps.notificationsStore.items.isEmpty {
                ContentUnavailableView(
                    "Bildirim yok",
                    systemImage: "bell.slash",
                    description: Text("Sipariş güncellemeleri ve duyurular burada görünür.")
                )
            } else {
                list
            }
        }
        .background(Palette.background)
        .navigationTitle("Bildirimler")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if deps.notificationsStore.unreadCount > 0 {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Tümünü okundu işaretle") {
                        Task { await deps.notificationsStore.markAllRead() }
                    }
                    .font(.footnote)
                }
            }
        }
        .task { await deps.notificationsStore.refresh() }
    }

    private var list: some View {
        ScrollView {
            LazyVStack(spacing: Spacing.md) {
                ForEach(deps.notificationsStore.items) { notification in
                    Button {
                        Task { await deps.notificationsStore.markRead(id: notification.id) }
                    } label: {
                        NotificationRow(notification: notification)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(Spacing.lg)
        }
        .refreshable { await deps.notificationsStore.refresh() }
    }
}

private struct NotificationRow: View {
    let notification: AppNotification

    var body: some View {
        HStack(alignment: .top, spacing: Spacing.md) {
            Image(systemName: notification.icon)
                .foregroundStyle(Palette.accent)
                .frame(width: 28)

            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text(notification.title)
                    .font(.subheadline.weight(notification.isRead ? .regular : .semibold))
                    .foregroundStyle(Palette.text)
                if let body = notification.body {
                    Text(body).font(.footnote).foregroundStyle(Palette.textMuted)
                }
                if let date = notification.createdAt {
                    Text(date.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption2).foregroundStyle(Palette.textMuted)
                }
            }
            Spacer(minLength: 0)
            if !notification.isRead {
                Circle().fill(Palette.accent).frame(width: 8, height: 8).padding(.top, Spacing.xs)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Spacing.md)
        .background(
            notification.isRead ? Palette.surface : Palette.surfaceElevated,
            in: .rect(cornerRadius: Radius.card)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Radius.card).stroke(Palette.border, lineWidth: 1)
        )
    }
}
