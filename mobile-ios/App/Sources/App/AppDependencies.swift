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
    let admin: any AdminRepository

    let session: SessionStore
    let cartStore: CartStore
    let wishlistStore: WishlistStore
    let notificationsStore: NotificationsStore
    let localCatalog: LocalCatalogStore

    /// Backend'e gönderilecek dil kodu (tr/en/de/fr/ar/nl) — yerel tercihten
    /// (`AppLanguage`) her okunuşta taze gelir, uygulama yeniden başlamadan değişir.
    var language: String { AppLanguage.current }

    /// Canlı yapılandırma (Info.plist'ten API adresi).
    static func live() -> AppDependencies {
        make(baseURL: AppConfig.apiBaseURL())
    }

    /// Preview/test için sabit adres (Info.plist okumaz).
    static let preview = make(
        baseURL: URL(string: "https://backend-ruby-xi.vercel.app")!
    )

    private static func make(baseURL: URL) -> AppDependencies {
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
            admin: AdminRepositoryLive(client: client),
            session: session,
            cartStore: CartStore(repository: cart, session: session),
            wishlistStore: WishlistStore(repository: wishlist, session: session),
            notificationsStore: NotificationsStore(repository: notifications, session: session),
            localCatalog: LocalCatalogStore()
        )
    }
}
