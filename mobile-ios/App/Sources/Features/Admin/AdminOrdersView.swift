import DesignSystem
import Domain
import SwiftUI

struct AdminOrdersView: View {
    @Environment(\.dependencies) private var deps

    var body: some View {
        Inner(deps: deps)
            .navigationTitle("Siparişler")
            .navigationBarTitleDisplayMode(.inline)
    }
}

private struct Inner: View {
    @State private var model: AdminOrdersModel

    init(deps: AppDependencies) {
        _model = State(wrappedValue: AdminOrdersModel(deps: deps))
    }

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.sm) {
                    ForEach(AdminOrderFilter.allCases) { filter in
                        FilterChip(
                            title: filter.label,
                            isSelected: model.filter == filter
                        ) {
                            Task { await model.select(filter) }
                        }
                    }
                }
                .padding(.horizontal, Spacing.lg)
                .padding(.vertical, Spacing.sm)
            }

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
                ContentUnavailableView("Bu filtrede sipariş yok", systemImage: "shippingbox")
            case .loaded(let orders):
                list(orders)
            }
        }
        .background(Palette.background)
        .task { await model.loadIfNeeded() }
        .task { await model.startPolling() }
    }

    private func list(_ orders: [Order]) -> some View {
        ScrollView {
            LazyVStack(spacing: Spacing.md) {
                ForEach(orders) { order in
                    NavigationLink {
                        AdminOrderDetailView(orderID: order.id)
                    } label: {
                        AdminOrderRow(order: order)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(Spacing.lg)
        }
        .refreshable { await model.load() }
    }
}

private struct AdminOrderRow: View {
    let order: Order

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            HStack {
                Text("#\(order.reference)").font(.subheadline.weight(.semibold))
                    .foregroundStyle(Palette.text)
                Spacer()
                OrderStatusBadge(status: order.status)
            }
            if let name = order.customerName {
                Text(name).font(.footnote).foregroundStyle(Palette.text)
            }
            Text("\(order.itemCount) ürün · \(Money.string(order.totalAmount))")
                .font(.caption).foregroundStyle(Palette.textMuted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface()
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.footnote.weight(.medium))
                .padding(.horizontal, Spacing.md)
                .padding(.vertical, Spacing.xs)
                .background(isSelected ? Palette.accent : Palette.surface)
                .foregroundStyle(isSelected ? Palette.onAccent : Palette.textMuted)
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }
}
