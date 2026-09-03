import DesignSystem
import SwiftUI

/// Admin hub'ı — Profil'den yalnızca admin rolündeki kullanıcıya açılır.
struct AdminHomeView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.md) {
                NavigationLink { AdminOrdersView() } label: {
                    HubRow(
                        icon: "shippingbox",
                        title: "Siparişler",
                        subtitle: "Aktif siparişler ve durum güncelleme"
                    )
                }
                .buttonStyle(.plain)

                NavigationLink { AdminMessagesView() } label: {
                    HubRow(
                        icon: "bubble.left.and.bubble.right",
                        title: "Müşteri mesajları",
                        subtitle: "Gelen kutusu ve yanıtlama"
                    )
                }
                .buttonStyle(.plain)

                NavigationLink { AdminLowStockView() } label: {
                    HubRow(
                        icon: "exclamationmark.triangle",
                        title: "Azalan stok",
                        subtitle: "Yakında bitecek ürünler"
                    )
                }
                .buttonStyle(.plain)
            }
            .padding(Spacing.lg)
        }
        .background(Palette.background)
        .navigationTitle("Yönetim")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct HubRow: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: Spacing.md) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Palette.accent)
                .frame(width: 28)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.subheadline.weight(.semibold)).foregroundStyle(Palette.text)
                Text(subtitle).font(.caption).foregroundStyle(Palette.textMuted)
            }
            Spacer()
            Image(systemName: "chevron.right").font(.caption).foregroundStyle(Palette.textMuted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface()
    }
}
