import Domain
import Foundation
import Networking
import Observation

/// Sepetin uygulama genelindeki durumu (araç çubuğu rozeti + sepet ekranı).
@MainActor
@Observable
final class CartStore {
    private(set) var items: [CartItem] = []
    private(set) var isLoading = false
    private(set) var errorMessage: String?

    @ObservationIgnored private let repository: any CartRepository
    @ObservationIgnored private let session: SessionStore

    nonisolated init(repository: any CartRepository, session: SessionStore) {
        self.repository = repository
        self.session = session
    }

    var itemCount: Int {
        items.totalQuantity
    }

    var subtotal: Decimal {
        items.subtotal
    }

    var isEmpty: Bool {
        items.isEmpty
    }

    func refresh() async {
        guard session.isSignedIn else {
            items = []
            return
        }
        isLoading = true
        defer { isLoading = false }
        do {
            items = try await repository.cart(language: AppLanguage.current)
            errorMessage = nil
        } catch {
            errorMessage = message(error)
        }
    }

    func add(productID: String, quantity: Int = 1) async {
        do {
            try await repository.addItem(productID: productID, quantity: quantity)
            await refresh()
        } catch {
            errorMessage = message(error)
        }
    }

    func setQuantity(productID: String, quantity: Int) async {
        guard quantity >= 1 else { return }
        // iyimser güncelleme
        if let index = items.firstIndex(where: { $0.product.id == productID }) {
            items[index] = CartItem(
                id: items[index].id, product: items[index].product, quantity: quantity
            )
        }
        do {
            try await repository.updateQuantity(productID: productID, quantity: quantity)
        } catch {
            await refresh()
        }
    }

    func remove(productID: String) async {
        items.removeAll { $0.product.id == productID }
        do {
            try await repository.removeItem(productID: productID)
        } catch {
            await refresh()
        }
    }

    func clearLocal() {
        items = []
        errorMessage = nil
    }

    private func message(_ error: Error) -> String {
        (error as? APIError)?.displayMessage ?? "Sepet güncellenemedi"
    }
}
