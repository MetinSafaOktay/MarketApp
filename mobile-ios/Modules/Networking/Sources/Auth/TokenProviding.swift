/// APIClient'a token sağlar ve 401/403'te yenileme dener.
/// Implementasyon (oturum yönetimi) Data/App katmanında.
public protocol TokenProviding: Sendable {
    func accessToken() async -> String?
    /// Yeni token alındıysa `true`. Başarısızsa oturum temizlenmeli.
    func refreshTokens() async -> Bool
}

/// Oturum yokken kullanılan no-op sağlayıcı (yalnızca herkese açık endpoint'ler).
public struct AnonymousTokenProvider: TokenProviding {
    public init() { }
    public func accessToken() async -> String? {
        nil
    }

    public func refreshTokens() async -> Bool {
        false
    }
}
