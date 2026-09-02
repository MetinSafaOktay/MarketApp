import Foundation

public enum APIError: Error, Equatable, Sendable {
    /// Sunucudan gelen 4xx/5xx yanıtı; backend hata zarfındaki mesajla birlikte.
    case http(status: Int, message: String)
    /// Ağ katmanı hatası (bağlantı yok, zaman aşımı vb.)
    case transport(String)
    /// Yanıt beklenen biçimde değil.
    case decoding(String)
    /// Oturum gerektiren bir istek ama geçerli token yok.
    case unauthenticated

    public var isUnauthorized: Bool {
        if case .http(let status, _) = self {
            return status == 401
        }
        return self == .unauthenticated
    }

    public var isForbidden: Bool {
        if case .http(let status, _) = self {
            return status == 403
        }
        return false
    }

    /// Kullanıcıya gösterilebilir mesaj.
    public var displayMessage: String {
        switch self {
        case .http(_, let message): message
        case .transport: "İnternet bağlantını kontrol et"
        case .decoding: "Beklenmeyen bir yanıt alındı"
        case .unauthenticated: "Oturum açman gerekiyor"
        }
    }
}
