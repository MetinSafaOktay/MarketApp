import DesignSystem
import SwiftUI

/// Oturum gerektiren ekranlarda gösterilen giriş çağrısı.
struct SignInPrompt: View {
    let message: String
    @State private var showingAuth = false

    var body: some View {
        ContentUnavailableView {
            Label("Giriş gerekli", systemImage: "person.crop.circle.badge.exclamationmark")
        } description: {
            Text(message)
        } actions: {
            Button("Giriş yap / Kayıt ol") { showingAuth = true }
                .buttonStyle(.bordered)
                .tint(Palette.accent)
        }
        .sheet(isPresented: $showingAuth) {
            NavigationStack {
                AuthView(onAuthenticated: { showingAuth = false })
            }
        }
    }
}
