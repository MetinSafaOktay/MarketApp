import Domain
import Networking
import Observation

/// İstek listesi durumu. Kalp düğmeleri her ekranda buradan senkron kalır.
@MainActor
@Observable
final class WishlistStore {
    private(set) var products: [Product] = []
    private(set) var productIDs: Set<String> = []
    private(set) var isLoading = false

    @ObservationIgnored private let repository: any WishlistRepository
    @ObservationIgnored private let session: SessionStore

    nonisolated init(repository: any WishlistRepository, session: SessionStore) {
        self.repository = repository
        self.session = session
    }

    func isWishlisted(_ productID: String) -> Bool {
        productIDs.contains(productID)
    }

    func refresh() async {
        guard session.isSignedIn else {
            products = []
            productIDs = []
            return
        }
        isLoading = true
        defer { isLoading = false }
        do {
            products = try await repository.wishlist(language: AppLanguage.current)
            productIDs = Set(products.map(\.id))
        } catch {
            // sessizce geç
        }
    }

    /// Değişiklik uygulandıysa `true`; oturum yoksa `false` (çağıran giriş sunar).
    @discardableResult
    func toggle(_ product: Product) async -> Bool {
        guard session.isSignedIn else { return false }
        let wasWishlisted = productIDs.contains(product.id)
        if wasWishlisted {
            productIDs.remove(product.id)
            products.removeAll { $0.id == product.id }
        } else {
            productIDs.insert(product.id)
            products.insert(product, at: 0)
        }
        do {
            if wasWishlisted {
                try await repository.remove(productID: product.id)
            } else {
                try await repository.add(productID: product.id)
            }
        } catch {
            await refresh()
        }
        return true
    }

    func clearLocal() {
        products = []
        productIDs = []
    }
}
