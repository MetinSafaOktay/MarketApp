import DesignSystem
import SwiftUI

/// Çevrimdışıyken kayıtlı içeriğin gösterildiğini belirten şerit.
struct OfflineBanner: View {
    var body: some View {
        Label("Çevrimdışısın — kayıtlı içerik gösteriliyor", systemImage: "wifi.slash")
            .font(.footnote.weight(.medium))
            .foregroundStyle(Palette.text)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(Spacing.md)
            .background(Palette.surfaceElevated, in: .rect(cornerRadius: Radius.button))
    }
}
