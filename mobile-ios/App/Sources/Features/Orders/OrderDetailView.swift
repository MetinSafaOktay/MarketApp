import DesignSystem
import Domain
import SwiftUI

struct OrderDetailView: View {
    @Environment(\.dependencies) private var deps
    let orderID: String

    var body: some View {
        Inner(deps: deps, orderID: orderID)
    }
}

private struct Inner: View {
    @State private var model: OrderDetailModel
    @State private var showingCancelConfirm = false

    init(deps: AppDependencies, orderID: String) {
        _model = State(wrappedValue: OrderDetailModel(deps: deps, orderID: orderID))
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
            case .loaded(let order):
                detail(order)
            }
        }
        .background(Palette.background)
        .navigationTitle("Sipariş #\(model.reference)")
        .navigationBarTitleDisplayMode(.inline)
        .task { await model.loadIfNeeded() }
        .task { await model.startPolling() }
    }

    private func detail(_ order: Order) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.xl) {
                OrderTimeline(order: order)
                itemsSection(order)
                addressSection(order)
                summarySection(order)
                cancelSection(order)
                if let error = model.actionError {
                    Text(error).font(.footnote).foregroundStyle(Palette.danger)
                }
            }
            .padding(Spacing.lg)
        }
        .confirmationDialog(
            "Siparişi iptal etmek istiyor musun?",
            isPresented: $showingCancelConfirm,
            titleVisibility: .visible
        ) {
            Button("Siparişi iptal et", role: .destructive) {
                Task { await model.cancel() }
            }
            Button("Vazgeç", role: .cancel) { }
        }
    }

    private func itemsSection(_ order: Order) -> some View {
        section("Ürünler") {
            ForEach(order.lines) { line in
                HStack {
                    Text("\(line.quantity)×").foregroundStyle(Palette.textMuted)
                    Text(line.name).foregroundStyle(Palette.text)
                    Spacer()
                    Text(Money.string(line.lineSubtotal)).foregroundStyle(Palette.text)
                }
                .font(.subheadline)
            }
        }
    }

    @ViewBuilder
    private func addressSection(_ order: Order) -> some View {
        if let address = order.address {
            section("Teslimat Adresi") {
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text(address.label).font(.subheadline.weight(.semibold))
                    Text(address.fullAddress).font(.footnote).foregroundStyle(Palette.textMuted)
                    if !address.buildingLine.isEmpty {
                        Text(address.buildingLine).font(.caption).foregroundStyle(Palette.textMuted)
                    }
                    Text(address.summary).font(.caption).foregroundStyle(Palette.textMuted)
                }
            }
        }
    }

    private func summarySection(_ order: Order) -> some View {
        section("Özet") {
            row("Ara toplam", Money.string(order.subtotal))
            if order.discountAmount > 0 {
                row("İndirim", "−\(Money.string(order.discountAmount))")
            }
            row("Ödeme", order.paymentMethod.displayName)
            Divider().overlay(Palette.border)
            row("Toplam", Money.string(order.totalAmount), emphasized: true)
        }
    }

    @ViewBuilder
    private func cancelSection(_ order: Order) -> some View {
        if order.status.isCancellableByCustomer {
            Button(role: .destructive) {
                showingCancelConfirm = true
            } label: {
                if model.isCancelling {
                    ProgressView()
                } else {
                    Text("Siparişi iptal et")
                }
            }
            .buttonStyle(.bordered)
            .tint(Palette.danger)
            .disabled(model.isCancelling)
        }
    }

    private func section(_ title: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text(title).font(.headline).foregroundStyle(Palette.text)
            content()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface()
    }

    private func row(_ label: String, _ value: String, emphasized: Bool = false) -> some View {
        HStack {
            Text(label).foregroundStyle(Palette.textMuted)
            Spacer()
            Text(value)
                .foregroundStyle(Palette.text)
                .font(emphasized ? .headline : .subheadline)
        }
    }
}

struct OrderTimeline: View {
    let order: Order

    private var reachedStatuses: Set<OrderStatus> {
        Set(order.statusHistory.map(\.status))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text("Sipariş Takibi").font(.headline).foregroundStyle(Palette.text)

            if order.status == .cancelled {
                Label("İptal edildi", systemImage: "xmark.circle.fill")
                    .foregroundStyle(Palette.danger)
                    .font(.subheadline.weight(.semibold))
            } else {
                ForEach(OrderStatus.deliveryFlow, id: \.self) { status in
                    let done = reachedStatuses.contains(status) || isBefore(
                        status,
                        than: order.status
                    )
                    HStack(spacing: Spacing.md) {
                        Image(systemName: done ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(done ? Palette.accent : Palette.textMuted)
                        Text(status.displayName)
                            .font(.subheadline)
                            .foregroundStyle(done ? Palette.text : Palette.textMuted)
                        Spacer()
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface()
    }

    private func isBefore(_ status: OrderStatus, than current: OrderStatus) -> Bool {
        guard let statusIndex = OrderStatus.deliveryFlow.firstIndex(of: status),
              let currentIndex = OrderStatus.deliveryFlow.firstIndex(of: current)
        else { return false }
        return statusIndex <= currentIndex
    }
}
