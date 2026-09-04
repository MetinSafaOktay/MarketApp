import DesignSystem
import Domain
import SwiftUI

struct CheckoutView: View {
    @Environment(\.dependencies) private var deps
    /// Sipariş verilince sepet sayfasını kapatmak için.
    var onOrderPlaced: () -> Void = { }

    var body: some View {
        Inner(deps: deps, onOrderPlaced: onOrderPlaced)
    }
}

private struct Inner: View {
    @State private var model: CheckoutModel
    @State private var showingAddAddress = false
    private let onOrderPlaced: () -> Void

    init(deps: AppDependencies, onOrderPlaced: @escaping () -> Void) {
        _model = State(wrappedValue: CheckoutModel(deps: deps))
        self.onOrderPlaced = onOrderPlaced
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
            case .ready:
                form
            }
        }
        .background(Palette.background)
        .navigationTitle("Ödeme")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showingAddAddress) {
            NavigationStack {
                AddAddressView { address in model.addressAdded(address) }
            }
        }
        .navigationDestination(isPresented: Binding(
            get: { model.placedOrder != nil },
            set: { _ in }
        )) {
            if let order = model.placedOrder {
                OrderPlacedView(order: order, onDone: onOrderPlaced)
            }
        }
        .task { await model.load() }
    }

    private var form: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.xl) {
                addressSection
                paymentSection
                couponSection
                summarySection

                if let error = model.placeError {
                    Text(error).font(.footnote).foregroundStyle(Palette.danger)
                }

                Button {
                    Task { await model.place() }
                } label: {
                    if model.isPlacing {
                        ProgressView().tint(Palette.onAccent)
                    } else {
                        Text("Siparişi Onayla")
                    }
                }
                .buttonStyle(.primary)
                .disabled(!model.canPlaceOrder)
            }
            .padding(Spacing.lg)
        }
    }

    // MARK: Sections

    private var addressSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            SectionHeader("Teslimat Adresi") {
                Button("Yeni") { showingAddAddress = true }
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Palette.accent)
            }

            if model.addresses.isEmpty {
                Text("Kayıtlı adresin yok, bir tane ekle.")
                    .font(.footnote).foregroundStyle(Palette.textMuted)
            } else {
                ForEach(model.addresses) { address in
                    Button {
                        model.selectAddress(address.id)
                    } label: {
                        AddressRow(
                            address: address,
                            isSelected: model.selectedAddressID == address.id
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            if let deliveryAreaError = model.deliveryAreaError {
                Text(deliveryAreaError)
                    .font(.footnote).foregroundStyle(Palette.danger)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    private var paymentSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            SectionHeader("Ödeme Yöntemi")
            Picker("Ödeme Yöntemi", selection: $model.paymentMethod) {
                ForEach(PaymentMethod.allCases, id: \.self) { method in
                    Text(method.displayName).tag(method)
                }
            }
            .pickerStyle(.segmented)
        }
    }

    private var couponSection: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            SectionHeader("Kupon kodu")
            HStack(spacing: Spacing.sm) {
                TextField("Kupon kodu", text: $model.couponInput)
                    .textInputAutocapitalization(.characters)
                    .autocorrectionDisabled()
                    .padding(Spacing.md)
                    .background(Palette.surface, in: .rect(cornerRadius: Radius.button))
                    .overlay(
                        RoundedRectangle(cornerRadius: Radius.button)
                            .stroke(Palette.border, lineWidth: 1)
                    )
                Button("Uygula") { Task { await model.applyCoupon() } }
                    .buttonStyle(.bordered)
                    .tint(Palette.accent)
                    .disabled(model.isApplyingCoupon)
            }
            if let coupon = model.preview?.coupon {
                Text("“\(coupon.code)” uygulandı")
                    .font(.caption).foregroundStyle(Palette.success)
            }
            if let couponError = model.preview?.couponError {
                Text(couponError).font(.caption).foregroundStyle(Palette.danger)
            }
        }
    }

    @ViewBuilder
    private var summarySection: some View {
        if let preview = model.preview {
            VStack(spacing: Spacing.sm) {
                summaryRow("Ara toplam", Money.string(preview.subtotal))
                if preview.discountAmount > 0 {
                    summaryRow(
                        "İndirim",
                        "−\(Money.string(preview.discountAmount))",
                        tint: Palette.success
                    )
                }
                Divider().overlay(Palette.border)
                summaryRow("Toplam", Money.string(preview.total), emphasized: true)
                if preview.hasStockIssues {
                    Text("Bazı ürünlerde stok yetersiz, sepeti güncelle.")
                        .font(.caption).foregroundStyle(Palette.danger)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .cardSurface()
        }
    }

    private func summaryRow(
        _ label: String,
        _ value: String,
        tint: Color = Palette.text,
        emphasized: Bool = false
    ) -> some View {
        HStack {
            Text(label).foregroundStyle(Palette.textMuted)
            Spacer()
            Text(value)
                .foregroundStyle(tint)
                .font(emphasized ? .headline : .subheadline)
        }
    }
}

private struct AddressRow: View {
    let address: Address
    let isSelected: Bool

    var body: some View {
        HStack(alignment: .top, spacing: Spacing.md) {
            Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                .foregroundStyle(isSelected ? Palette.accent : Palette.textMuted)
            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text(address.label).font(.subheadline.weight(.semibold))
                    .foregroundStyle(Palette.text)
                Text(address.fullAddress).font(.footnote).foregroundStyle(Palette.textMuted)
                Text(address.summary).font(.caption).foregroundStyle(Palette.textMuted)
            }
            Spacer(minLength: 0)
        }
        .padding(Spacing.md)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Palette.surface, in: .rect(cornerRadius: Radius.card))
        .overlay(
            RoundedRectangle(cornerRadius: Radius.card)
                .stroke(isSelected ? Palette.accent : Palette.border, lineWidth: 1)
        )
    }
}
