import SwiftUI
import Testing
@testable import DesignSystem

struct PaletteTests {
    @Test func hexInitProducesExpectedComponents() {
        let color = Color(hex: 0xE23744)
        let resolved = color.resolve(in: .init())
        #expect(abs(resolved.red - 0xE2 / 255) < 0.01)
        #expect(abs(resolved.green - 0x37 / 255) < 0.01)
        #expect(abs(resolved.blue - 0x44 / 255) < 0.01)
    }
}
