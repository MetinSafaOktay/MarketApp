import Domain
import Foundation
import Networking
@testable import ErenlerMarket

// Testler arasında paylaşılan sahte repository'ler + AppDependencies kurucusu.

struct StubCatalog: CatalogRepository {
    var pages: [Page<Product>] = []
    var similar: [Product] = []
    var categoriesResult: [ProductCategory] = []

    func products(_ query: ProductQuery, language _: String) async throws -> Page<Product> {
        guard !pages.isEmpty else { return TestFixtures.page([]) }
        return pages[min(query.page - 1, pages.count - 1)]
    }

    func product(id: String, language _: String) async throws -> Product {
        TestFixtures.product(id: id)
    }

    func similarProducts(id _: String, language _: String) async throws -> [Product] {
        similar
    }

    func categories(language _: String) async throws -> [ProductCategory] {
        categoriesResult
    }
}

struct StubStorefront: StorefrontRepository {
    var profile = StoreProfile(name: "Erenler Market", tagline: "Taze")
    var announcementsResult: [Announcement] = []

    func storeProfile(language _: String) async throws -> StoreProfile {
        profile
    }

    func announcements(language _: String) async throws -> [Announcement] {
        announcementsResult
    }
}

/// Yapılandırılabilir sahte auth repository'si.
struct StubAuth: AuthRepository, @unchecked Sendable {
    var user = TestFixtures.user()
    var tokens = AuthTokens(accessToken: "access-1", refreshToken: "refresh-1")
    var loginError: Error?
    var meError: Error?

    func register(_: RegisterInput) async throws -> AuthenticatedUser {
        if let loginError {
            throw loginError
        }
        return AuthenticatedUser(user: user, tokens: tokens)
    }

    func login(email _: String, password _: String) async throws -> AuthenticatedUser {
        if let loginError {
            throw loginError
        }
        return AuthenticatedUser(user: user, tokens: tokens)
    }

    func refresh(refreshToken _: String) async throws -> AuthTokens {
        tokens
    }

    func currentUser() async throws -> User {
        if let meError {
            throw meError
        }
        return user
    }

    func logout(refreshToken _: String) async throws { }
}

enum TestFixtures {
    static func product(
        id: String,
        price: Decimal = 10,
        original: Decimal? = nil,
        new: Bool = false
    ) -> Product {
        Product(
            id: id, categoryID: "c1", name: "Ürün \(id)", sku: "SKU-\(id)",
            description: nil, price: price, originalPrice: original,
            isNewArrival: new, stockQuantity: 5, imageURLs: []
        )
    }

    static func page(_ items: [Product], page: Int = 1, totalPages: Int = 1) -> Page<Product> {
        Page(items: items, page: page, pageSize: 20, total: totalPages * 20, totalPages: totalPages)
    }

    static func user(role: UserRole = .customer) -> User {
        User(
            id: "u1", email: "test@example.com", phone: nil,
            profileName: "metin", firstName: "Metin", lastName: "Oktay",
            role: role
        )
    }
}

@MainActor
enum TestDeps {
    static func make(
        catalog: StubCatalog = StubCatalog(),
        storefront: StubStorefront = StubStorefront(),
        auth: StubAuth = StubAuth(),
        session: SessionStore? = nil
    ) -> AppDependencies {
        AppDependencies(
            catalog: catalog,
            storefront: storefront,
            auth: auth,
            session: session ??
                SessionStore(keychain: KeychainStore(service: "test.\(UUID().uuidString)")),
            language: "tr"
        )
    }
}
