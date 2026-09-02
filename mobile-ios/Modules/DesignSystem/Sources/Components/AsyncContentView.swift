import SwiftUI

/// Yükleniyor / boş / hata / içerik durumlarını tek yerde yöneten sarmalayıcı.
public enum LoadState<Value: Sendable>: Sendable {
    case idle
    case loading
    case loaded(Value)
    case failed(String)
}

public struct AsyncContentView<Value: Sendable, Content: View>: View {
    private let state: LoadState<Value>
    private let onRetry: (() -> Void)?
    private let content: (Value) -> Content

    public init(
        state: LoadState<Value>,
        onRetry: (() -> Void)? = nil,
        @ViewBuilder content: @escaping (Value) -> Content
    ) {
        self.state = state
        self.onRetry = onRetry
        self.content = content
    }

    public var body: some View {
        switch state {
        case .idle, .loading:
            ProgressView()
                .tint(Palette.textMuted)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case .loaded(let value):
            content(value)
        case .failed(let message):
            ContentUnavailableView {
                Label(message, systemImage: "exclamationmark.triangle")
            } actions: {
                if let onRetry {
                    Button("Tekrar dene", action: onRetry)
                        .buttonStyle(.bordered)
                        .tint(Palette.accent)
                }
            }
        }
    }
}
