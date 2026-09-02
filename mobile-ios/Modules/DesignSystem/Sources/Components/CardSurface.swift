import SwiftUI

/// Kart yüzeyi: `Palette.surface` + kenarlık + köşe yuvarlama.
public struct CardSurface: ViewModifier {
    private let padding: CGFloat?

    public init(padding: CGFloat? = Spacing.lg) {
        self.padding = padding
    }

    public func body(content: Content) -> some View {
        content
            .padding(padding ?? 0)
            .background(Palette.surface, in: .rect(cornerRadius: Radius.card))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.card)
                    .stroke(Palette.border, lineWidth: 1)
            )
    }
}

extension View {
    public func cardSurface(padding: CGFloat? = Spacing.lg) -> some View {
        modifier(CardSurface(padding: padding))
    }
}
