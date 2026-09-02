import NukeUI
import SwiftUI

/// Nuke tabanlı uzak görsel. İleride `ImageLoading` protokolü arkasına alınabilir.
public struct RemoteImage<Placeholder: View>: View {
    private let url: URL?
    private let contentMode: ContentMode
    private let placeholder: () -> Placeholder

    public init(
        url: URL?,
        contentMode: ContentMode = .fit,
        @ViewBuilder placeholder: @escaping () -> Placeholder = { EmptyView() }
    ) {
        self.url = url
        self.contentMode = contentMode
        self.placeholder = placeholder
    }

    public var body: some View {
        LazyImage(url: url) { state in
            if let image = state.image {
                image.resizable().aspectRatio(contentMode: contentMode)
            } else if state.error != nil {
                fallback
            } else {
                ZStack {
                    Palette.surfaceElevated
                    ProgressView().tint(Palette.textMuted)
                }
            }
        }
    }

    private var fallback: some View {
        ZStack {
            Palette.surfaceElevated
            placeholder()
        }
    }
}
