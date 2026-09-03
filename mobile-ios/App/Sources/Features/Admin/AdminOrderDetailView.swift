import DesignSystem
import Domain
import SwiftUI

struct AdminOrderDetailView: View {
    @Environment(\.dependencies) private var deps
    let orderID: String

    var body: some View {
        Inner(deps: deps, orderID: orderID)
            .navigationTitle("Sipariş #\(String(orderID.prefix(8)).uppercased())")
            .navigationBarTitleDisplayMode(.inline)
    }
}

private struct Inner: View {
    @State private var model: AdminOrderDetailModel
    @State private var showingCancelConfirm = false

    init(deps: AppDependencies, orderID: String) {
        _model = State(wrappedValue: AdminOrderDetailModel(deps: deps, orderID: orderID))
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
        .task { await model.loadIfNeeded() }
        .task { await model.startPolling() }
    }

    private func detail(_ order: Order) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.xl) {
                statusSection(order)
                customerSection(order)
                itemsSection(order)
            }
            .padding(Spacing.lg)
        }
        .confirmationDialog(
            "Siparişi iptal etmek istiyor musun?",
            isPresented: $showingCancelConfirm,
            titleVisibility: .visible
        ) {
            Button("Siparişi iptal et", role: .destructive) {
                Task { await model.update(to: .cancelled) }
            }
            Button("Vazgeç", role: .cancel) { }
        }
    }

    @ViewBuilder
    private func statusSection(_ order: Order) -> some View {
        card("Durum") {
            HStack {
                OrderStatusBadge(status: order.status)
                Spacer()
            }
            if order.status == .delivered || order.status == .cancelled {
                Text("Bu sipariş kapandı.")
                    .font(.footnote).foregroundStyle(Palette.textMuted)
            } else {
                TextField("Not (opsiyonel, müşteri görür)", text: $model.note, axis: .vertical)
                    .lineLimit(1...3)
                    .textFieldStyle(.roundedBorder)

                if let next = order.nextStatus {
                    Button {
                        Task { await model.update(to: next) }
                    } label: {
                        Text("İleri: \(next.displayName)")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.primary)
                    .disabled(model.isUpdating)
                }
                Button(role: .destructive) {
                    showingCancelConfirm = true
                } label: {
                    Text("Siparişi iptal et").frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .tint(Palette.danger)
                .disabled(model.isUpdating)
            }
            if let error = model.actionError {
                Text(error).font(.footnote).foregroundStyle(Palette.danger)
            }
        }
    }

    @ViewBuilder
    private func customerSection(_ order: Order) -> some View {
        if order.customerName != nil || order.customerPhone != nil || order.address != nil {
            card("Müşteri") {
                if let name = order.customerName {
                    Text(name).font(.subheadline).foregroundStyle(Palette.text)
                }
                if let phone = order.customerPhone {
                    Text(phone).font(.subheadline).foregroundStyle(Palette.accent)
                }
                if let address = order.address {
                    Text(address.fullAddress).font(.footnote).foregroundStyle(Palette.textMuted)
                    Text(address.summary).font(.caption).foregroundStyle(Palette.textMuted)
                }
            }
        }
    }

    private func itemsSection(_ order: Order) -> some View {
        card("Ürünler") {
            ForEach(order.lines) { line in
                HStack {
                    Text("\(line.quantity)×").foregroundStyle(Palette.textMuted)
                    Text(line.name).foregroundStyle(Palette.text)
                    Spacer()
                    Text(Money.string(line.lineSubtotal)).foregroundStyle(Palette.text)
                }
                .font(.subheadline)
            }
            Divider().overlay(Palette.border)
            HStack {
                Text("Toplam").font(.subheadline.weight(.semibold))
                Spacer()
                Text(Money.string(order.totalAmount)).font(.subheadline.weight(.semibold))
            }
        }
    }

    private func card(_ title: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text(title).font(.headline).foregroundStyle(Palette.text)
            content()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface()
    }
}
