import Data
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

    func updateProfile(_ update: ProfileUpdate) async throws -> User {
        User(
            id: user.id, email: user.email, phone: user.phone,
            profileName: update.profileName ?? user.profileName,
            firstName: user.firstName, lastName: user.lastName,
            bio: update.bio ?? user.bio,
            isPrivate: update.isPrivate ?? user.isPrivate, role: user.role
        )
    }

    func deleteAccount() async throws { }
}

struct StubMessaging: MessagingRepository, @unchecked Sendable {
    var result: [Message] = []
    func messages() async throws -> [Message] {
        result
    }

    func send(_ content: String) async throws -> Message {
        Message(
            id: "m\(result.count)", sender: .customer,
            content: content, isRead: false, createdAt: nil
        )
    }
}

struct StubNotifications: NotificationsRepository, @unchecked Sendable {
    var result: [AppNotification] = []
    func notifications() async throws -> [AppNotification] {
        result
    }

    func markRead(id _: String) async throws { }
    func markAllRead() async throws { }
}

struct StubSettings: SettingsRepository, @unchecked Sendable {
    var result = UserSettings(
        language: "tr", theme: "dark",
        pushNotificationsEnabled: true, orderNotificationsEnabled: true
    )
    func settings() async throws -> UserSettings {
        result
    }

    func update(_ update: SettingsUpdate) async throws -> UserSettings {
        UserSettings(
            language: result.language, theme: result.theme,
            pushNotificationsEnabled: update.pushNotificationsEnabled
                ?? result.pushNotificationsEnabled,
            orderNotificationsEnabled: update.orderNotificationsEnabled
                ?? result.orderNotificationsEnabled
        )
    }
}

/// Sepet çağrılarını sayan ve son durumu tutan sahte repository.
final class StubCart: CartRepository, @unchecked Sendable {
    var items: [CartItem] = []
    private(set) var updateCalls: [(String, Int)] = []

    func cart(language _: String) async throws -> [CartItem] {
        items
    }

    func addItem(productID: String, quantity: Int) async throws {
        items.append(CartItem(
            id: "ci-\(productID)",
            product: TestFixtures.product(id: productID),
            quantity: quantity
        ))
    }

    func updateQuantity(productID: String, quantity: Int) async throws {
        updateCalls.append((productID, quantity))
    }

    func removeItem(productID: String) async throws {
        items.removeAll { $0.product.id == productID }
    }

    func clear() async throws {
        items = []
    }

    func checkoutPreview(
        couponCode _: String?,
        language _: String
    ) async throws -> CheckoutPreview {
        CheckoutPreview(
            lines: [], subtotal: 0, discountAmount: 0, total: 0,
            coupon: nil, couponError: nil, hasStockIssues: false
        )
    }
}

struct StubWishlist: WishlistRepository, @unchecked Sendable {
    var products: [Product] = []
    func wishlist(language _: String) async throws -> [Product] {
        products
    }

    func add(productID _: String) async throws { }
    func remove(productID _: String) async throws { }
}

struct StubAddress: AddressRepository {
    var addressesResult: [Address] = []
    func addresses() async throws -> [Address] {
        addressesResult
    }

    func create(_ address: NewAddress) async throws -> Address {
        Address(
            id: "new", label: address.label, fullAddress: address.fullAddress,
            city: address.city, district: address.district, isDefault: address.isDefault
        )
    }

    func delete(id _: String) async throws { }
}

struct StubOrder: OrderRepository, @unchecked Sendable {
    var ordersResult: [Order] = []
    func orders(language _: String) async throws -> [Order] {
        ordersResult
    }

    func order(id: String, language _: String) async throws -> Order {
        ordersResult.first { $0.id == id } ?? TestFixtures.order(id: id)
    }

    func place(_: PlaceOrderInput, language _: String) async throws -> Order {
        TestFixtures.order(id: "placed", status: .pending)
    }

    func cancel(id: String, reason _: String?, language _: String) async throws -> Order {
        TestFixtures.order(id: id, status: .cancelled)
    }
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

    static func order(id: String, status: OrderStatus = .pending) -> Order {
        Order(
            id: id, status: status, paymentMethod: .cashOnDelivery,
            subtotal: 36, discountAmount: 0, totalAmount: 36, createdAt: nil,
            lines: [OrderLine(
                id: "l1",
                productID: "p1",
                name: "Ekmek",
                quantity: 2,
                unitPrice: 18,
                lineSubtotal: 36
            )],
            statusHistory: [], address: nil
        )
    }
}

@MainActor
enum TestDeps {
    static func make(
        catalog: any CatalogRepository = StubCatalog(),
        storefront: StubStorefront = StubStorefront(),
        auth: StubAuth = StubAuth(),
        cart: any CartRepository = StubCart(),
        wishlist: any WishlistRepository = StubWishlist(),
        address: any AddressRepository = StubAddress(),
        order: any OrderRepository = StubOrder(),
        messaging: any MessagingRepository = StubMessaging(),
        notifications: any NotificationsRepository = StubNotifications(),
        settings: any SettingsRepository = StubSettings(),
        local: LocalCatalogStore? = nil,
        session: SessionStore? = nil
    ) -> AppDependencies {
        let session = session ??
            SessionStore(keychain: KeychainStore(service: "test.\(UUID().uuidString)"))
        session.attach(authRepository: auth)
        return AppDependencies(
            catalog: catalog,
            storefront: storefront,
            auth: auth,
            cart: cart,
            wishlist: wishlist,
            address: address,
            order: order,
            messaging: messaging,
            notifications: notifications,
            settings: settings,
            session: session,
            cartStore: CartStore(repository: cart, session: session, language: "tr"),
            wishlistStore: WishlistStore(repository: wishlist, session: session, language: "tr"),
            notificationsStore: NotificationsStore(repository: notifications, session: session),
            localCatalog: local ?? LocalCatalogStore(inMemory: true),
            language: "tr"
        )
    }
}
