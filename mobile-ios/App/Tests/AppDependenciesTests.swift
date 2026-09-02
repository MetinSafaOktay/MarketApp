import Domain
import Testing
@testable import ErenlerMarket

struct AppDependenciesTests {
    @Test func previewDependenciesExposeCatalogRepository() {
        let repo: any CatalogRepository = AppDependencies.preview.catalogRepository
        _ = repo
    }

    @Test func appearanceColorSchemeMapping() {
        #expect(Appearance.system.colorScheme == nil)
        #expect(Appearance.light.colorScheme == .light)
        #expect(Appearance.dark.colorScheme == .dark)
    }
}
