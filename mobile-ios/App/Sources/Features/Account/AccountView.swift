import DesignSystem
import SwiftUI

/// Oturum durumuna göre giriş formu veya hesap özeti gösterir.
struct AccountView: View {
    @Environment(\.dependencies) private var deps
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Group {
            switch deps.session.phase {
            case .loading:
                ProgressView().tint(Palette.textMuted)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Palette.background)

            case .signedOut:
                AuthView(onAuthenticated: { dismiss() })

            case .signedIn(let user):
                ProfileView(user: user) {
                    Task { await deps.session.signOut() }
                }
            }
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Kapat") { dismiss() }
            }
        }
    }
}
