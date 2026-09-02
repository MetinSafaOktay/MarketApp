/// Kayıt için gerekli alanlar (backend `POST /auth/register`).
public struct RegisterInput: Sendable, Equatable {
    public var email: String
    public var password: String
    public var profileName: String
    public var firstName: String
    public var lastName: String

    public init(
        email: String,
        password: String,
        profileName: String,
        firstName: String,
        lastName: String
    ) {
        self.email = email
        self.password = password
        self.profileName = profileName
        self.firstName = firstName
        self.lastName = lastName
    }
}

public struct AuthTokens: Sendable, Equatable {
    public var accessToken: String
    public var refreshToken: String

    public init(accessToken: String, refreshToken: String) {
        self.accessToken = accessToken
        self.refreshToken = refreshToken
    }
}

/// Kullanıcı + o oturuma ait token çifti.
public struct AuthenticatedUser: Sendable, Equatable {
    public var user: User
    public var tokens: AuthTokens

    public init(user: User, tokens: AuthTokens) {
        self.user = user
        self.tokens = tokens
    }
}

public protocol AuthRepository: Sendable {
    func register(_ input: RegisterInput) async throws -> AuthenticatedUser
    func login(email: String, password: String) async throws -> AuthenticatedUser
    func refresh(refreshToken: String) async throws -> AuthTokens
    func currentUser() async throws -> User
    func logout(refreshToken: String) async throws
}
