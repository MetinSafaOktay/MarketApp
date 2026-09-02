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
    let session: SessionStore
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
        return AppDependencies(
            catalog: CatalogRepositoryLive(client: client),
            storefront: StorefrontRepositoryLive(client: client),
            auth: auth,
            session: session,
            language: language
        )
    }
}
