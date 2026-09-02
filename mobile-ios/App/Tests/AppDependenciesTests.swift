import Domain
import Testing
@testable import ErenlerMarket

struct AppDependenciesTests {
    @Test func previewDependenciesExposeRepositories() {
        let catalog: any CatalogRepository = AppDependencies.preview.catalog
        let storefront: any StorefrontRepository = AppDependencies.preview.storefront
        let auth: any AuthRepository = AppDependencies.preview.auth
        _ = (catalog, storefront, auth)
        #expect(AppDependencies.preview.language == "tr")
    }

    @Test func appearanceColorSchemeMapping() {
        #expect(Appearance.system.colorScheme == nil)
        #expect(Appearance.light.colorScheme == .light)
        #expect(Appearance.dark.colorScheme == .dark)
    }
}
