import DesignSystem
import SwiftUI

@main
struct ErenlerApp: App {
    @AppStorage("appearance") private var appearance: Appearance = .system

    private let dependencies = AppDependencies.live()

    var body: some Scene {
        WindowGroup {
            RootTabView()
                .environment(\.dependencies, dependencies)
                .tint(Palette.accent)
                .preferredColorScheme(appearance.colorScheme)
                .environment(\.layoutDirection, .leftToRight) // karar: zorla LTR
        }
    }
}

enum Appearance: String, CaseIterable {
    case system, light, dark

    var colorScheme: ColorScheme? {
        switch self {
        case .system: nil
        case .light: .light
        case .dark: .dark
        }
    }
}
