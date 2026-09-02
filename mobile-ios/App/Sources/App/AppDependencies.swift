import Data
import Domain
import Foundation
import Networking

/// Kompozisyon kökü. Uygulama açılışında bir kez kurulur, `@Environment` ile
/// view ağacına verilir. Bağımlılıklar constructor injection ile aşağı akar.
struct AppDependencies {
    let catalog: any CatalogRepository
    let storefront: any StorefrontRepository
    let auth: any AuthRepository
    let cart: any CartRepository
    let wishlist: any WishlistRepository
    let address: any AddressRepository
    let order: any OrderRepository
    let messaging: any MessagingRepository
    let notifications: any NotificationsRepository
    let settings: any SettingsRepository

    let session: SessionStore
    let cartStore: CartStore
    let wishlistStore: WishlistStore
    let notificationsStore: NotificationsStore

    /// Backend'e gönderilecek dil kodu (tr/en/de/fr/ar/nl).
    let language: String

    /// Canlı yapılandırma (Info.plist'ten API adresi).
    static func live() -> AppDependencies {
        make(baseURL: AppConfig.apiBaseURL(), language: AppLanguage.current)
    }

    /// Preview/test için sabit adres (Info.plist okumaz).
    static let preview = make(
        baseURL: URL(string: "https://backend-ruby-xi.vercel.app")!,
        language: "tr"
    )

    private static func make(baseURL: URL, language: String) -> AppDependencies {
        let session = SessionStore()
        let client = LiveAPIClient(baseURL: baseURL, tokenProvider: session)
        let auth = AuthRepositoryLive(client: client)
        session.attach(authRepository: auth)

        let cart = CartRepositoryLive(client: client)
        let wishlist = WishlistRepositoryLive(client: client)
        let notifications = NotificationsRepositoryLive(client: client)

        return AppDependencies(
            catalog: CatalogRepositoryLive(client: client),
            storefront: StorefrontRepositoryLive(client: client),
            auth: auth,
            cart: cart,
            wishlist: wishlist,
            address: AddressRepositoryLive(client: client),
            order: OrderRepositoryLive(client: client),
            messaging: MessagingRepositoryLive(client: client),
            notifications: notifications,
            settings: SettingsRepositoryLive(client: client),
            session: session,
            cartStore: CartStore(repository: cart, session: session, language: language),
            wishlistStore: WishlistStore(
                repository: wishlist,
                session: session,
                language: language
            ),
            notificationsStore: NotificationsStore(repository: notifications, session: session),
            language: language
        )
    }
}
