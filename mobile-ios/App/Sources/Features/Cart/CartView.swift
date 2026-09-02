import DesignSystem
import Domain
import SwiftUI

struct CartView: View {
    @Environment(\.dependencies) private var deps
    @Environment(\.dismiss) private var dismiss
    @State private var goToCheckout = false

    var body: some View {
        Group {
            if !deps.session.isSignedIn {
                SignInPrompt(message: "Sepetini görmek için giriş yap.")
            } else if deps.cartStore.isEmpty {
                ContentUnavailableView(
                    "Sepetin boş",
                    systemImage: "bag",
                    description: Text("Beğendiğin ürünleri sepete ekle.")
                )
            } else {
                content
            }
        }
        .background(Palette.background)
        .navigationTitle("Sepet")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Kapat") { dismiss() }
            }
        }
        .navigationDestination(isPresented: $goToCheckout) {
            CheckoutView { dismiss() }
        }
        .task { await deps.cartStore.refresh() }
    }

    private var content: some View {
        VStack(spacing: 0) {
            ScrollView {
                LazyVStack(spacing: Spacing.md) {
                    ForEach(deps.cartStore.items) { item in
                        CartRow(
                            item: item,
                            onQuantityChange: { quantity in
                                Task { await deps.cartStore.setQuantity(
                                    productID: item.product.id,
                                    quantity: quantity
                                ) }
                            },
                            onRemove: {
                                Task { await deps.cartStore.remove(productID: item.product.id) }
                            }
                        )
                    }
                }
                .padding(Spacing.lg)
            }

            summaryBar
        }
    }

    private var summaryBar: some View {
        VStack(spacing: Spacing.md) {
            HStack {
                Text("Ara toplam").foregroundStyle(Palette.textMuted)
                Spacer()
                Text(Money.string(deps.cartStore.subtotal))
                    .font(.headline)
                    .foregroundStyle(Palette.text)
            }
            Button("Siparişi tamamla") { goToCheckout = true }
                .buttonStyle(.primary)
        }
        .padding(Spacing.lg)
        .background(Palette.surface)
        .overlay(alignment: .top) { Divider().overlay(Palette.border) }
    }
}

private struct CartRow: View {
    let item: CartItem
    let onQuantityChange: (Int) -> Void
    let onRemove: () -> Void

    var body: some View {
        HStack(spacing: Spacing.md) {
            RemoteImage(url: item.product.imageURLs.first, contentMode: .fill) {
                Image(systemName: "photo").foregroundStyle(Palette.textMuted)
            }
            .frame(width: 64, height: 64)
            .clipShape(.rect(cornerRadius: Radius.button))

            VStack(alignment: .leading, spacing: Spacing.xs) {
                Text(item.product.name)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Palette.text)
                    .lineLimit(2)
                Text(Money.string(item.lineTotal))
                    .font(.callout.weight(.semibold))
                    .foregroundStyle(Palette.text)
                if !item.isAvailable {
                    Text("Stok yetersiz").font(.caption).foregroundStyle(Palette.danger)
                }
            }

            Spacer(minLength: Spacing.sm)

            VStack(alignment: .trailing, spacing: Spacing.sm) {
                Stepper(
                    "Adet: \(item.quantity)",
                    value: Binding(get: { item.quantity }, set: { onQuantityChange($0) }),
                    in: 1 ... 99
                )
                .font(.caption)
                .fixedSize()

                Button(role: .destructive, action: onRemove) {
                    Label("Kaldır", systemImage: "trash").font(.caption)
                }
                .buttonStyle(.borderless)
                .tint(Palette.danger)
            }
        }
        .padding(Spacing.md)
        .cardSurface(padding: nil)
    }
}
