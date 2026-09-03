import Foundation
import Testing
@testable import ErenlerMarket

@Suite(.serialized)
struct AppLanguageTests {
    private func withEphemeralStore(_ body: () -> Void) {
        let suite = "test.language.\(UUID().uuidString)"
        let defaults = UserDefaults(suiteName: suite)!
        let previous = AppLanguage.store
        AppLanguage.store = defaults
        defer {
            AppLanguage.store = previous
            defaults.removePersistentDomain(forName: suite)
        }
        body()
    }

    @Test func defaultsToTurkish() {
        withEphemeralStore {
            #expect(AppLanguage.current == "tr")
        }
    }

    @Test func persistsAValidChoice() {
        withEphemeralStore {
            AppLanguage.setCurrent("en")
            #expect(AppLanguage.current == "en")
        }
    }

    @Test func ignoresAnUnsupportedCode() {
        withEphemeralStore {
            AppLanguage.setCurrent("xx")
            #expect(AppLanguage.current == "tr")
        }
    }

    @Test func displayNamesAreLocalNames() {
        #expect(AppLanguage.displayName("tr") == "Türkçe")
        #expect(AppLanguage.displayName("en") == "English")
        #expect(AppLanguage.displayName("zz") == "zz")
    }
}
