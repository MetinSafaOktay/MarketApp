import SwiftUI

/// Web istemcisiyle aynı marka paleti (globals.css). Koyu tema öncelikli;
/// açık tema değerleri light trait için verilir.
public enum Palette {
    public static let background = dynamic(dark: 0x0D0E12, light: 0xF4F4F5)
    public static let surface = dynamic(dark: 0x16181E, light: 0xFFFFFF)
    public static let surfaceElevated = dynamic(dark: 0x1E2027, light: 0xF0F0F1)
    public static let border = dynamic(dark: 0x2A2D38, light: 0xE2E2E5)
    public static let text = dynamic(dark: 0xE8E8EC, light: 0x1A1A1E)
    public static let textMuted = dynamic(dark: 0x9A9BA3, light: 0x6B6B73)
    public static let accent = dynamic(dark: 0xEF8B86, light: 0xE8756F)
    public static let accentHover = dynamic(dark: 0xE8756F, light: 0xD9645E)
    public static let onAccent = dynamic(dark: 0x1A1113, light: 0xFFFFFF)
    public static let brand = Color(hex: 0xE23744)
    public static let success = Color(hex: 0x3FB27F)
    public static let danger = Color(hex: 0xE5564B)

    private static func dynamic(dark: UInt32, light: UInt32) -> Color {
        Color(uiColor: UIColor { traits in
            UIColor(Color(hex: traits.userInterfaceStyle == .light ? light : dark))
        })
    }
}

extension Color {
    public init(hex: UInt32) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: 1
        )
    }
}
