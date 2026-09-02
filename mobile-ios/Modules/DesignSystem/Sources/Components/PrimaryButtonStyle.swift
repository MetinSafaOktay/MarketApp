import SwiftUI

/// Mercan dolgulu birincil buton (web'deki `bg-accent` karşılığı).
public struct PrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    public init() { }

    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(Palette.onAccent)
            .frame(maxWidth: .infinity)
            .padding(.vertical, Spacing.md)
            .background(Palette.accent, in: .rect(cornerRadius: Radius.button))
            .opacity(configuration.isPressed ? 0.85 : 1)
            .opacity(isEnabled ? 1 : 0.5)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

extension ButtonStyle where Self == PrimaryButtonStyle {
    public static var primary: PrimaryButtonStyle {
        PrimaryButtonStyle()
    }
}
