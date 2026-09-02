import Data
import Domain
import Foundation
import Networking

/// Kompozisyon kökü. Uygulama açılışında bir kez kurulur, `@Environment` ile
/// view ağacına verilir. Bağımlılıklar constructor injection ile aşağı akar.
struct AppDependencies: Sendable {
    let catalogRepository: any CatalogRepository

    /// Canlı yapılandırma (Info.plist'ten API adresi).
    static func live() -> AppDependencies {
        make(baseURL: AppConfig.apiBaseURL())
    }

    /// Preview/test için sabit adres (Info.plist okumaz).
    static let preview = make(
        baseURL: URL(string: "https://backend-ruby-xi.vercel.app")!
    )

    private static func make(baseURL: URL) -> AppDependencies {
        // M1: yalnızca herkese açık endpoint'ler → anonim token sağlayıcı.
        // M3'te gerçek oturum yöneticisiyle değiştirilecek.
        let client = LiveAPIClient(
            baseURL: baseURL,
            tokenProvider: AnonymousTokenProvider()
        )
        return AppDependencies(
            catalogRepository: CatalogRepositoryLive(client: client)
        )
    }
}
