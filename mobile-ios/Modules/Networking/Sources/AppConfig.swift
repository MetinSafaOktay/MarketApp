import Foundation

public enum AppConfig {
    /// Info.plist'teki `APIBaseURL` ($(API_BASE_URL) xcconfig'den gelir).
    public static func apiBaseURL(bundle: Bundle = .main) -> URL {
        guard
            let raw = bundle.object(forInfoDictionaryKey: "APIBaseURL") as? String,
            let url = URL(string: raw.trimmingCharacters(in: .whitespaces))
        else {
            fatalError("Info.plist içinde geçerli APIBaseURL yok")
        }
        return url
    }
}
