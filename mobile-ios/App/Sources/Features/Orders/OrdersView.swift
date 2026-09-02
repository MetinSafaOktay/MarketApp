import DesignSystem
import Domain
import SwiftUI

struct OrdersView: View {
    @Environment(\.dependencies) private var deps

    var body: some View {
        Inner(deps: deps)
            .navigationTitle("Siparişlerim")
            .navigationBarTitleDisplayMode(.inline)
    }
}

private struct Inner: View {
    @State private var model: OrdersModel

    init(deps: AppDependencies) {
        _model = State(wrappedValue: OrdersModel(deps: deps))
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
                ContentUnavailableView(
                    "Henüz siparişin yok",
                    systemImage: "shippingbox",
                    description: Text("İlk siparişini vermek için mağazaya göz at.")
                )
            case .loaded(let orders):
                list(orders)
            }
        }
        .background(Palette.background)
        .task { await model.loadIfNeeded() }
    }

    private func list(_ orders: [Order]) -> some View {
        ScrollView {
            LazyVStack(spacing: Spacing.md) {
                ForEach(orders) { order in
                    NavigationLink {
                        OrderDetailView(orderID: order.id)
                    } label: {
                        OrderSummaryCard(order: order)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(Spacing.lg)
        }
        .refreshable { await model.load() }
    }
}

struct OrderSummaryCard: View {
    let order: Order

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            HStack {
                Text("Sipariş #\(order.reference)")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Palette.text)
                Spacer()
                OrderStatusBadge(status: order.status)
            }
            Text("\(order.itemCount) ürün · \(Money.string(order.totalAmount))")
                .font(.footnote)
                .foregroundStyle(Palette.textMuted)
            if let date = order.createdAt {
                Text(date.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
                    .foregroundStyle(Palette.textMuted)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface()
    }
}

struct OrderStatusBadge: View {
    let status: OrderStatus

    var body: some View {
        Badge(status.displayName, style: status == .cancelled ? .danger : .neutral)
    }
}
