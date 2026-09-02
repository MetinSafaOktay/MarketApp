import SwiftUI

/// Küçük yuvarlak etiket (indirim, yeni, stok yok vb.).
public struct Badge: View {
    public enum Style {
        case accent
        case danger
        case neutral
    }

    private let text: String
    private let style: Style

    public init(_ text: String, style: Style = .accent) {
        self.text = text
        self.style = style
    }

    public var body: some View {
        Text(text)
            .font(.caption2.weight(.bold))
            .foregroundStyle(foreground)
            .padding(.horizontal, Spacing.sm)
            .padding(.vertical, Spacing.xs)
            .background(background, in: .rect(cornerRadius: Radius.button))
    }

    private var foreground: Color {
        switch style {
        case .accent: Palette.onAccent
        case .danger: .white
        case .neutral: Palette.text
        }
    }

    private var background: Color {
        switch style {
        case .accent: Palette.accent
        case .danger: Palette.danger
        case .neutral: Palette.surfaceElevated
        }
    }
}
