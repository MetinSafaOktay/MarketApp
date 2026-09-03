import DesignSystem
import Domain
import SwiftUI

/// Oturum açmış kullanıcının hesap özeti + çıkış.
struct ProfileView: View {
    let user: User
    var onSignOut: () -> Void = { }

    @State private var isSigningOut = false

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.lg) {
                header

                VStack(spacing: 0) {
                    infoRow("Ad Soyad", user.fullName)
                    if let email = user.email {
                        Divider().overlay(Palette.border)
                        infoRow("E-posta", email)
                    }
                    if let phone = user.phone {
                        Divider().overlay(Palette.border)
                        infoRow("Telefon", phone)
                    }
                    Divider().overlay(Palette.border)
                    infoRow("Kullanıcı adı", "@\(user.profileName)")
                    if user.role == .admin {
                        Divider().overlay(Palette.border)
                        infoRow("Rol", "Yönetici")
                    }
                }
                .cardSurface(padding: nil)

                if let bio = user.bio, !bio.isEmpty {
                    Text(bio)
                        .font(.callout)
                        .foregroundStyle(Palette.text)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardSurface()
                }

                VStack(spacing: 0) {
                    NavigationLink { OrdersView() } label: {
                        menuRow("Siparişlerim", systemImage: "shippingbox")
                    }
                    Divider().overlay(Palette.border)
                    NavigationLink { WishlistView() } label: {
                        menuRow("Favorilerim", systemImage: "heart")
                    }
                    Divider().overlay(Palette.border)
                    NavigationLink { AddressesView() } label: {
                        menuRow("Adreslerim", systemImage: "mappin.and.ellipse")
                    }
                }
                .cardSurface(padding: nil)

                if user.role == .admin {
                    VStack(spacing: 0) {
                        NavigationLink { AdminHomeView() } label: {
                            menuRow("Yönetim", systemImage: "square.grid.2x2")
                        }
                    }
                    .cardSurface(padding: nil)
                }

                VStack(spacing: 0) {
                    NavigationLink { MessagesView() } label: {
                        menuRow("Mesajlar", systemImage: "bubble.left.and.bubble.right")
                    }
                    Divider().overlay(Palette.border)
                    NavigationLink { NotificationsView() } label: {
                        menuRow("Bildirimler", systemImage: "bell")
                    }
                    Divider().overlay(Palette.border)
                    NavigationLink { SettingsView() } label: {
                        menuRow("Ayarlar", systemImage: "gearshape")
                    }
                }
                .cardSurface(padding: nil)

                Button(role: .destructive) {
                    isSigningOut = true
                    Task { onSignOut() }
                } label: {
                    if isSigningOut {
                        ProgressView()
                    } else {
                        Text("Çıkış yap")
                    }
                }
                .buttonStyle(.bordered)
                .tint(Palette.danger)
                .disabled(isSigningOut)
            }
            .padding(Spacing.lg)
        }
        .background(Palette.background)
        .navigationTitle("Hesabım")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var header: some View {
        VStack(spacing: Spacing.sm) {
            RemoteImage(url: user.photoURL, contentMode: .fill) {
                Image(systemName: "person.crop.circle.fill")
                    .resizable()
                    .foregroundStyle(Palette.textMuted)
            }
            .frame(width: 84, height: 84)
            .clipShape(.circle)

            Text(user.fullName)
                .font(.title3.weight(.semibold))
                .foregroundStyle(Palette.text)
            Text("@\(user.profileName)")
                .font(.subheadline)
                .foregroundStyle(Palette.textMuted)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, Spacing.md)
    }

    private func menuRow(_ title: String, systemImage: String) -> some View {
        HStack(spacing: Spacing.md) {
            Image(systemName: systemImage).foregroundStyle(Palette.accent).frame(width: 24)
            Text(title).foregroundStyle(Palette.text)
            Spacer()
            Image(systemName: "chevron.right").font(.caption).foregroundStyle(Palette.textMuted)
        }
        .font(.subheadline)
        .padding(Spacing.md)
        .contentShape(.rect)
    }

    private func infoRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label).foregroundStyle(Palette.textMuted)
            Spacer(minLength: Spacing.md)
            Text(value).foregroundStyle(Palette.text).multilineTextAlignment(.trailing)
        }
        .font(.subheadline)
        .padding(Spacing.md)
    }
}
