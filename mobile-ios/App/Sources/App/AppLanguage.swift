import Foundation

/// Backend içeriğinin (ürün adı, kategori, duyuru…) hangi dilde isteneceği.
/// Tema gibi YEREL bir tercih — profile veya cihaz diline bağlı değil, cihazda kalır.
/// Varsayılan Türkçe. `UserDefaults` anahtarı `SettingsView`'daki `@AppStorage`
/// ile aynı ("contentLanguage").
enum AppLanguage {
    static let supported = ["tr", "en", "de", "fr", "ar", "nl"]
    static let fallback = "tr"
    static let storageKey = "contentLanguage"

    /// Üretimde `.standard` (SwiftUI `@AppStorage` ile aynı depo). Yalnızca testler
    /// geçici bir suite ile değiştirir — bu yüzden `nonisolated(unsafe)`.
    nonisolated(unsafe) static var store: UserDefaults = .standard

    static var current: String {
        let stored = store.string(forKey: storageKey)
        if let stored, supported.contains(stored) { return stored }
        return fallback
    }

    static func setCurrent(_ code: String) {
        guard supported.contains(code) else { return }
        store.set(code, forKey: storageKey)
    }

    /// Ayarlar ekranında gösterilecek yerel dil adı.
    static func displayName(_ code: String) -> String {
        switch code {
        case "tr": "Türkçe"
        case "en": "English"
        case "de": "Deutsch"
        case "fr": "Français"
        case "ar": "العربية"
        case "nl": "Nederlands"
        default: code
        }
    }
}
