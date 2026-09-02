import Domain
import Networking
import Observation

@MainActor
@Observable
final class CheckoutModel {
    enum Phase: Equatable {
        case loading
        case ready
        case failed(String)
    }

    private(set) var phase: Phase = .loading
    private(set) var addresses: [Address] = []
    var selectedAddressID: String?
    var couponInput = ""
    var paymentMethod: PaymentMethod = .cashOnDelivery
    private(set) var preview: CheckoutPreview?
    private(set) var isApplyingCoupon = false
    private(set) var isPlacing = false
    private(set) var placedOrder: Order?
    private(set) var placeError: String?

    @ObservationIgnored private let deps: AppDependencies

    init(deps: AppDependencies) {
        self.deps = deps
    }

    var canPlaceOrder: Bool {
        selectedAddressID != nil
            && !(preview?.hasStockIssues ?? true)
            && !deps.cartStore.isEmpty
            && !isPlacing
    }

    func load() async {
        phase = .loading
        do {
            addresses = try await deps.address.addresses()
            selectedAddressID = addresses.first(where: \.isDefault)?.id ?? addresses.first?.id
            await reloadPreview()
            phase = .ready
        } catch {
            phase = .failed((error as? APIError)?.displayMessage ?? "Ödeme bilgileri yüklenemedi")
        }
    }

    func addressAdded(_ address: Address) {
        addresses.insert(address, at: 0)
        selectedAddressID = address.id
    }

    func applyCoupon() async {
        isApplyingCoupon = true
        defer { isApplyingCoupon = false }
        await reloadPreview()
    }

    func clearCoupon() async {
        couponInput = ""
        await reloadPreview()
    }

    private func reloadPreview() async {
        let code = couponInput.trimmingCharacters(in: .whitespaces)
        preview = try? await deps.cart.checkoutPreview(
            couponCode: code.isEmpty ? nil : code,
            language: deps.language
        )
    }

    func place() async {
        guard let addressID = selectedAddressID, !deps.cartStore.isEmpty else { return }
        isPlacing = true
        placeError = nil
        defer { isPlacing = false }

        let code = couponInput.trimmingCharacters(in: .whitespaces)
        let input = PlaceOrderInput(
            addressID: addressID,
            items: deps.cartStore.items.map { ($0.product.id, $0.quantity) },
            couponCode: code.isEmpty ? nil : code,
            paymentMethod: paymentMethod
        )
        do {
            placedOrder = try await deps.order.place(input, language: deps.language)
            await deps.cartStore.refresh() // sunucu sepeti temizledi
        } catch {
            placeError = (error as? APIError)?.displayMessage ?? "Sipariş oluşturulamadı"
        }
    }
}
