import Foundation

public protocol APIClient: Sendable {
    func send<Response: Decodable & Sendable>(
        _ endpoint: Endpoint,
        as type: Response.Type
    ) async throws -> Response
}

/// `Void` yanıtlar için.
public struct EmptyResponse: Decodable, Sendable {
    public init() { }
    public init(from _: Decoder) throws { }
}

extension APIClient {
    public func send<Response: Decodable & Sendable>(
        _ endpoint: Endpoint
    ) async throws -> Response {
        try await send(endpoint, as: Response.self)
    }

    public func send(_ endpoint: Endpoint) async throws {
        _ = try await send(endpoint, as: EmptyResponse.self)
    }
}

/// Backend hata zarfı: `{ statusCode, path, timestamp, message }`
/// `message` string veya string dizisi olabilir.
private struct ErrorEnvelope: Decodable {
    let text: String

    private enum CodingKeys: String, CodingKey { case message }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        if let single = try? container.decode(String.self, forKey: .message) {
            text = single
        } else if let many = try? container.decode([String].self, forKey: .message) {
            text = many.joined(separator: ", ")
        } else {
            text = ""
        }
    }
}

public actor LiveAPIClient: APIClient {
    private let baseURL: URL
    private let session: URLSession
    private let tokenProvider: TokenProviding
    private let decoder = JSONDecoder.api

    public init(baseURL: URL, session: URLSession = .shared, tokenProvider: TokenProviding) {
        self.baseURL = baseURL
        self.session = session
        self.tokenProvider = tokenProvider
    }

    public func send<Response: Decodable & Sendable>(
        _ endpoint: Endpoint,
        as _: Response.Type
    ) async throws -> Response {
        try await perform(endpoint, allowAuthRetry: true)
    }

    private func perform<Response: Decodable & Sendable>(
        _ endpoint: Endpoint,
        allowAuthRetry: Bool
    ) async throws -> Response {
        let request = try await makeRequest(endpoint)

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.transport(error.localizedDescription)
        }

        guard let http = response as? HTTPURLResponse else {
            throw APIError.transport("Geçersiz yanıt")
        }

        if (200 ..< 300).contains(http.statusCode) {
            return try decode(Response.self, from: data)
        }

        // Süresi dolmuş (401) veya bayat rol (403) → bir kez refresh dene
        let recoverable = http.statusCode == 401
            || (http.statusCode == 403 && endpoint.requiresAuth)
        let shouldRetry = recoverable && allowAuthRetry && endpoint.requiresAuth
        if shouldRetry, await tokenProvider.refreshTokens() {
            return try await perform(endpoint, allowAuthRetry: false)
        }

        throw apiError(status: http.statusCode, data: data)
    }

    private func decode<Response: Decodable>(
        _ type: Response.Type,
        from data: Data
    ) throws -> Response {
        if type == EmptyResponse.self, let empty = EmptyResponse() as? Response {
            return empty
        }
        do {
            return try decoder.decode(type, from: data)
        } catch {
            throw APIError.decoding(String(describing: error))
        }
    }

    private func makeRequest(_ endpoint: Endpoint) async throws -> URLRequest {
        var components = URLComponents(
            url: baseURL.appendingPathComponent(endpoint.path),
            resolvingAgainstBaseURL: false
        )
        let items = endpoint.query.compactMap { key, value in
            value.map { URLQueryItem(name: key, value: $0) }
        }
        if !items.isEmpty {
            components?.queryItems = items
        }

        guard let url = components?.url else {
            throw APIError.transport("URL oluşturulamadı: \(endpoint.path)")
        }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.httpBody = endpoint.body
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if endpoint.requiresAuth {
            guard let token = await tokenProvider.accessToken() else {
                throw APIError.unauthenticated
            }
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        return request
    }

    private func apiError(status: Int, data: Data) -> APIError {
        let envelopeText = (try? decoder.decode(ErrorEnvelope.self, from: data))?.text
        let message = (envelopeText?.isEmpty == false ? envelopeText : nil)
            ?? HTTPURLResponse.localizedString(forStatusCode: status)
        return .http(status: status, message: message)
    }
}
