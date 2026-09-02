import SwiftUI

/// Bölüm başlığı + isteğe bağlı "tümünü gör" eylemi.
public struct SectionHeader<Trailing: View>: View {
    private let title: String
    private let trailing: Trailing

    public init(_ title: String, @ViewBuilder trailing: () -> Trailing = { EmptyView() }) {
        self.title = title
        self.trailing = trailing()
    }

    public var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(title)
                .font(.title3.weight(.bold))
                .foregroundStyle(Palette.text)
            Spacer(minLength: Spacing.sm)
            trailing
        }
    }
}
