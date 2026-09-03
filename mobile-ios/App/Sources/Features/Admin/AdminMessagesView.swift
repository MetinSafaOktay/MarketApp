import DesignSystem
import Domain
import SwiftUI

struct AdminMessagesView: View {
    @Environment(\.dependencies) private var deps

    var body: some View {
        Inner(deps: deps)
            .navigationTitle("Müşteri mesajları")
            .navigationBarTitleDisplayMode(.inline)
    }
}

private struct Inner: View {
    @State private var model: AdminMessagesModel

    init(deps: AppDependencies) {
        _model = State(wrappedValue: AdminMessagesModel(deps: deps))
    }

    var body: some View {
        Group {
            switch model.phase {
            case .loading:
                ProgressView().tint(Palette.textMuted)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            case .failed(let message):
                ContentUnavailableView {
                    Label(message, systemImage: "exclamationmark.triangle")
                } actions: {
                    Button("Tekrar dene") { Task { await model.load() } }
                        .buttonStyle(.bordered).tint(Palette.accent)
                }
            case .empty:
                ContentUnavailableView("Henüz mesaj yok", systemImage: "bubble.left.and.bubble.right")
            case .loaded(let conversations):
                ScrollView {
                    LazyVStack(spacing: Spacing.md) {
                        ForEach(conversations) { conversation in
                            NavigationLink {
                                AdminConversationView(
                                    conversationID: conversation.id,
                                    customerName: conversation.customerName
                                )
                            } label: {
                                ConversationRow(conversation: conversation)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(Spacing.lg)
                }
                .refreshable { await model.load() }
            }
        }
        .background(Palette.background)
        .task { await model.loadIfNeeded() }
        .task { await model.startPolling() }
    }
}

private struct ConversationRow: View {
    let conversation: AdminConversation

    var body: some View {
        HStack(spacing: Spacing.md) {
            RemoteImage(url: conversation.photoURL, contentMode: .fill) {
                Image(systemName: "person.crop.circle.fill")
                    .resizable().foregroundStyle(Palette.textMuted)
            }
            .frame(width: 40, height: 40)
            .clipShape(.circle)

            VStack(alignment: .leading, spacing: 2) {
                Text(conversation.customerName)
                    .font(.subheadline.weight(conversation.awaitingReply ? .bold : .regular))
                    .foregroundStyle(Palette.text)
                if let last = conversation.lastMessage {
                    Text(last).font(.caption).foregroundStyle(Palette.textMuted).lineLimit(1)
                }
            }
            Spacer()
            if conversation.awaitingReply {
                Circle().fill(Palette.accent).frame(width: 10, height: 10)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface()
    }
}
