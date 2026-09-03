import DesignSystem
import Domain
import SwiftUI

struct AdminConversationView: View {
    @Environment(\.dependencies) private var deps
    let conversationID: String
    let customerName: String

    var body: some View {
        Inner(deps: deps, conversationID: conversationID, customerName: customerName)
            .navigationTitle(customerName)
            .navigationBarTitleDisplayMode(.inline)
    }
}

private struct Inner: View {
    @State private var model: AdminConversationModel

    init(deps: AppDependencies, conversationID: String, customerName: String) {
        _model = State(wrappedValue: AdminConversationModel(
            deps: deps, conversationID: conversationID, customerName: customerName
        ))
    }

    var body: some View {
        VStack(spacing: 0) {
            content
            composer
        }
        .background(Palette.background)
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
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: Spacing.sm) {
                        if model.messages.isEmpty {
                            Text("Henüz mesaj yok.")
                                .font(.footnote).foregroundStyle(Palette.textMuted)
                                .frame(maxWidth: .infinity).padding(.top, Spacing.xxl)
                        }
                        ForEach(model.messages) { message in
                            AdminBubble(message: message).id(message.id)
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
    }

    private var composer: some View {
        HStack(spacing: Spacing.sm) {
            TextField("Yanıt yaz", text: $model.draft, axis: .vertical)
                .lineLimit(1 ... 4)
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

/// Admin görünümü: mağaza (kendi) sağda accent, müşteri solda.
private struct AdminBubble: View {
    let message: Message

    private var fromStore: Bool { message.sender == .store }

    var body: some View {
        HStack {
            if fromStore { Spacer(minLength: Spacing.xxl) }
            Text(message.content)
                .font(.subheadline)
                .foregroundStyle(fromStore ? Palette.onAccent : Palette.text)
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.sm)
                .background(
                    fromStore ? Palette.accent : Palette.surface,
                    in: .rect(cornerRadius: Radius.card)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Radius.card)
                        .stroke(fromStore ? .clear : Palette.border, lineWidth: 1)
                )
            if !fromStore { Spacer(minLength: Spacing.xxl) }
        }
    }
}
