import Domain
import Foundation
import Networking

public struct AuthRepositoryLive: AuthRepository {
    private let client: APIClient

    public init(client: APIClient) {
        self.client = client
    }

    public func register(_ input: RegisterInput) async throws -> AuthenticatedUser {
        let body = RegisterBody(
            email: input.email,
            password: input.password,
            profileName: input.profileName,
            firstName: input.firstName,
            lastName: input.lastName
        )
        let dto: AuthResponseDTO = try await client.send(.post("/auth/register", json: body))
        return authenticated(from: dto)
    }

    public func login(email: String, password: String) async throws -> AuthenticatedUser {
        let dto: AuthResponseDTO = try await client.send(
            .post("/auth/login", json: LoginBody(email: email, password: password))
        )
        return authenticated(from: dto)
    }

    public func refresh(refreshToken: String) async throws -> AuthTokens {
        let dto: TokensDTO = try await client.send(refreshEndpoint("/auth/refresh", refreshToken))
        return AuthTokens(accessToken: dto.accessToken, refreshToken: dto.refreshToken)
    }

    public func currentUser() async throws -> User {
        let dto: UserDTO = try await client.send(.get("/auth/me", auth: true))
        return UserMapper.map(dto)
    }

    public func logout(refreshToken: String) async throws {
        try await client.send(refreshEndpoint("/auth/logout", refreshToken))
    }

    private func authenticated(from dto: AuthResponseDTO) -> AuthenticatedUser {
        AuthenticatedUser(
            user: UserMapper.map(dto.user),
            tokens: AuthTokens(accessToken: dto.accessToken, refreshToken: dto.refreshToken)
        )
    }

    /// `/auth/refresh` ve `/auth/logout` gövdesi camelCase `refreshToken` bekler
    /// (snake_case dönüşümü yok), bu yüzden düz kodlanır.
    private func refreshEndpoint(_ path: String, _ token: String) -> Endpoint {
        let body = try? JSONSerialization.data(withJSONObject: ["refreshToken": token])
        return Endpoint(path: path, method: .post, body: body)
    }
}
