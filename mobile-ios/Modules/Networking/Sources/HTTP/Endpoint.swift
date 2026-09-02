import Foundation

/// Tek bir API isteğinin tarifi. Sunucu adresi APIClient tarafından eklenir.
public struct Endpoint: Sendable {
    public var path: String
    public var method: HTTPMethod
    public var query: [String: String?]
    public var body: Data?
    public var requiresAuth: Bool

    public init(
        path: String,
        method: HTTPMethod = .get,
        query: [String: String?] = [:],
        body: Data? = nil,
        requiresAuth: Bool = false
    ) {
        self.path = path
        self.method = method
        self.query = query
        self.body = body
        self.requiresAuth = requiresAuth
    }

    public static func get(
        _ path: String,
        query: [String: String?] = [:],
        auth: Bool = false
    ) -> Endpoint {
        Endpoint(path: path, method: .get, query: query, requiresAuth: auth)
    }

    public static func post(
        _ path: String,
        json: some Encodable,
        auth: Bool = false
    ) throws -> Endpoint {
        try Endpoint(
            path: path,
            method: .post,
            body: JSONEncoder.api.encode(json),
            requiresAuth: auth
        )
    }
}

extension JSONEncoder {
    /// Backend snake_case beklediği için camelCase → snake_case dönüşümü.
    public static let api: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        return encoder
    }()
}

extension JSONDecoder {
    /// Backend snake_case döndürdüğü için snake_case → camelCase dönüşümü;
    /// DTO'lar camelCase property kullanır.
    public static let api: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return decoder
    }()
}
