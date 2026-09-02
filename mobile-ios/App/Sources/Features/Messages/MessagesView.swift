import DesignSystem
import Domain
import SwiftUI

struct MessagesView: View {
    @Environment(\.dependencies) private var deps

    var body: some View {
        Group {
            if deps.session.isSignedIn {
                Inner(repository: deps.messaging)
            } else {
                SignInPrompt(message: "Mağazayla yazışmak için giriş yap.")
            }
        }
        .background(Palette.background)
        .navigationTitle("Mesajlar")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct Inner: View {
    @State private var model: MessagesModel
    @FocusState private var composerFocused: Bool

    init(repository: any MessagingRepository) {
        _model = State(wrappedValue: MessagesModel(repository: repository))
    }

    var body: some View {
        VStack(spacing: 0) {
            content
            composer
        }
        .task { await model.loadInitial() }
        .task { await model.startPolling() }
    }

    @ViewBuilder
    private var content: some View {
        switch model.phase {
        case .loading:
            ProgressView().tint(Palette.textMuted)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        case .failed(let message):
            ContentUnavailableView {
                Label(message, systemImage: "exclamationmark.triangle")
            } actions: {
                Button("Tekrar dene") { Task { await model.loadInitial() } }
                    .buttonStyle(.bordered).tint(Palette.accent)
            }
        case .ready:
            thread
        }
    }

    private var thread: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: Spacing.sm) {
                    if model.messages.isEmpty {
                        Text("Henüz mesaj yok. Mağazaya bir şeyler yaz!")
                            .font(.footnote)
                            .foregroundStyle(Palette.textMuted)
                            .frame(maxWidth: .infinity)
                            .padding(.top, Spacing.xxl)
                    }
                    ForEach(model.messages) { message in
                        MessageBubble(message: message).id(message.id)
                    }
                }
                .padding(Spacing.lg)
            }
            .onChange(of: model.messages.count) {
                if let last = model.messages.last {
                    withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                }
            }
        }
    }

    private var composer: some View {
        HStack(spacing: Spacing.sm) {
            TextField("Mesaj yaz", text: $model.draft, axis: .vertical)
                .lineLimit(1 ... 4)
                .focused($composerFocused)
                .padding(Spacing.md)
                .background(Palette.surface, in: .rect(cornerRadius: Radius.pill))
                .overlay(
                    RoundedRectangle(cornerRadius: Radius.pill)
                        .stroke(Palette.border, lineWidth: 1)
                )

            Button {
                Task { await model.send() }
            } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.title)
                    .foregroundStyle(model.canSend ? Palette.accent : Palette.textMuted)
            }
            .disabled(!model.canSend)
        }
        .padding(Spacing.md)
        .background(Palette.background)
        .overlay(alignment: .top) { Divider().overlay(Palette.border) }
    }
}

private struct MessageBubble: View {
    let message: Message

    var body: some View {
        HStack {
            if message.sender.isCustomer {
                Spacer(minLength: Spacing.xxl)
            }
            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text(message.content)
                    .font(.subheadline)
                    .foregroundStyle(message.sender.isCustomer ? Palette.onAccent : Palette.text)
                if let date = message.createdAt {
                    Text(date.formatted(date: .omitted, time: .shortened))
                        .font(.caption2)
                        .foregroundStyle(message.sender.isCustomer
                            ? Palette.onAccent.opacity(0.7)
                            : Palette.textMuted)
                }
            }
            .padding(.horizontal, Spacing.md)
            .padding(.vertical, Spacing.sm)
            .background(
                message.sender.isCustomer ? Palette.accent : Palette.surface,
                in: .rect(cornerRadius: Radius.card)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Radius.card)
                    .stroke(message.sender.isCustomer ? .clear : Palette.border, lineWidth: 1)
            )
            if !message.sender.isCustomer {
                Spacer(minLength: Spacing.xxl)
            }
        }
    }
}
