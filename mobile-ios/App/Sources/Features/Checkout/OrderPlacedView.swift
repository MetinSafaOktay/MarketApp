import DesignSystem
import Domain
import SwiftUI

/// Sipariş başarıyla oluşturulunca gösterilen onay ekranı.
struct OrderPlacedView: View {
    let order: Order
    var onDone: () -> Void = { }

    @State private var goToDetail = false

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.lg) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 64))
                    .foregroundStyle(Palette.success)
                    .padding(.top, Spacing.xxl)

                Text("Siparişin alındı!")
                    .font(.title2.bold())
                    .foregroundStyle(Palette.text)

                Text("Sipariş #\(order.reference) · \(Money.string(order.totalAmount))")
                    .font(.subheadline)
                    .foregroundStyle(Palette.textMuted)

                OrderSummaryCard(order: order)

                VStack(spacing: Spacing.sm) {
                    Button("Sipariş detayına git") { goToDetail = true }
                        .buttonStyle(.primary)
                    Button("Alışverişe devam et") { onDone() }
                        .buttonStyle(.bordered)
                        .tint(Palette.accent)
                }
            }
            .padding(Spacing.lg)
        }
        .background(Palette.background)
        .navigationTitle("Sipariş Onayı")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .navigationDestination(isPresented: $goToDetail) {
            OrderDetailView(orderID: order.id)
        }
    }
}
