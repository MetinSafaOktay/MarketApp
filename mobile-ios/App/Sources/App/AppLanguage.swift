import Foundation

/// Cihaz dilini backend'in desteklediği koda eşler.
enum AppLanguage {
    static let supported = ["tr", "en", "de", "fr", "ar", "nl"]
    static let fallback = "tr"

    static var current: String {
        for identifier in Locale.preferredLanguages {
            let code = Locale(identifier: identifier).language.languageCode?.identifier
            if let code, supported.contains(code) {
                return code
            }
        }
        return fallback
    }
}
