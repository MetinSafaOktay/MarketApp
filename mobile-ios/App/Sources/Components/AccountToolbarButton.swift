import DesignSystem
import SwiftUI

/// Üst çubuktaki hesap düğmesi. Dokununca hesap sayfasını sunar.
struct AccountToolbarButton: View {
    @Environment(\.dependencies) private var deps
    @State private var showingAccount = false

    var body: some View {
        Button {
            showingAccount = true
        } label: {
            Image(systemName: deps.session
                .isSignedIn ? "person.crop.circle.fill" : "person.crop.circle")
                .foregroundStyle(Palette.accent)
        }
        .accessibilityLabel("Hesap")
        .sheet(isPresented: $showingAccount) {
            NavigationStack {
                AccountView()
            }
        }
    }
}
