import DesignSystem
import SwiftUI

/// M1 yer tutucu. M2'de mağaza hero + duyurular + ürün rafları eklenecek.
struct HomeView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Spacing.lg) {
                    Text("Erenler Market")
                        .font(.largeTitle.bold())
                        .foregroundStyle(Palette.text)
                    Text("Online sipariş ver, kapıda öde!")
                        .foregroundStyle(Palette.textMuted)
                }
                .frame(maxWidth: .infinity)
                .padding(Spacing.xl)
            }
            .background(Palette.background)
            .navigationTitle("Ana Sayfa")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

#Preview { HomeView() }
