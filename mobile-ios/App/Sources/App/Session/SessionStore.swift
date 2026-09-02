import Domain
import Networking
import Observation

/// Oturum durumu + token saklama. `TokenProviding` olarak `APIClient`'a verilir,
/// böylece 401'de sessiz yenileme buradan yürür.
@MainActor
@Observable
final class SessionStore: TokenProviding {
    enum Phase: Equatable {
        case loading
        case signedOut
        case signedIn(User)
    }

    private(set) var phase: Phase = .loading

    @ObservationIgnored private let keychain: KeychainStore
    @ObservationIgnored private var accessTokenValue: String?
    @ObservationIgnored private var refreshTokenValue: String?
    @ObservationIgnored private var refreshTask: Task<Bool, Never>?
    /// Kurulum sırasında bir kez yazılır (kompozisyon kökü), sonra salt-okunur.
    @ObservationIgnored private nonisolated(unsafe) var authRepository: (any AuthRepository)?

    private nonisolated static let accessKey = "accessToken"
    private nonisolated static let refreshKey = "refreshToken"

    nonisolated init(keychain: KeychainStore = KeychainStore()) {
        self.keychain = keychain
        accessTokenValue = keychain.string(for: Self.accessKey)
        refreshTokenValue = keychain.string(for: Self.refreshKey)
    }

    /// Kompozisyon kökü, döngüyü kırmak için repository'yi sonradan bağlar.
    nonisolated func attach(authRepository: any AuthRepository) {
        self.authRepository = authRepository
    }

    var currentUser: User? {
        if case .signedIn(let user) = phase {
            return user
        }
        return nil
    }

    var isSignedIn: Bool {
        currentUser != nil
    }

    // MARK: - Launch

    /// Saklı token varsa `/auth/me` ile doğrular (gerekirse APIClient yeniler).
    func restore() async {
        guard authRepository != nil else { phase = .signedOut; return }
        guard accessTokenValue != nil || refreshTokenValue != nil else {
            phase = .signedOut
            return
        }
        do {
            phase = try await .signedIn(requireRepository().currentUser())
        } catch {
            clearSession()
        }
    }

    // MARK: - Auth actions

    func signIn(email: String, password: String) async throws {
        let result = try await requireRepository().login(email: email, password: password)
        persist(result.tokens)
        phase = .signedIn(result.user)
    }

    func register(_ input: RegisterInput) async throws {
        let result = try await requireRepository().register(input)
        persist(result.tokens)
        phase = .signedIn(result.user)
    }

    func signOut() async {
        if let token = refreshTokenValue {
            try? await authRepository?.logout(refreshToken: token)
        }
        clearSession()
    }

    /// Profil güncellendiyse `true`. Oturumdaki kullanıcıyı tazeler.
    func updateProfile(_ update: ProfileUpdate) async -> Bool {
        guard let authRepository, case .signedIn = phase else { return false }
        do {
            phase = try await .signedIn(authRepository.updateProfile(update))
            return true
        } catch {
            return false
        }
    }

    // MARK: - TokenProviding

    func accessToken() async -> String? {
        accessTokenValue
    }

    func refreshTokens() async -> Bool {
        if let refreshTask {
            return await refreshTask.value
        }
        let task = Task { await performRefresh() }
        refreshTask = task
        defer { refreshTask = nil }
        return await task.value
    }

    // MARK: - Private

    private func performRefresh() async -> Bool {
        guard let authRepository, let token = refreshTokenValue else {
            clearSession()
            return false
        }
        do {
            try await persist(authRepository.refresh(refreshToken: token))
            return true
        } catch {
            clearSession()
            return false
        }
    }

    private func requireRepository() throws -> any AuthRepository {
        guard let authRepository else { throw SessionError.notConfigured }
        return authRepository
    }

    private func persist(_ tokens: AuthTokens) {
        accessTokenValue = tokens.accessToken
        refreshTokenValue = tokens.refreshToken
        keychain.set(tokens.accessToken, for: Self.accessKey)
        keychain.set(tokens.refreshToken, for: Self.refreshKey)
    }

    private func clearSession() {
        accessTokenValue = nil
        refreshTokenValue = nil
        refreshTask = nil
        keychain.removeAll()
        phase = .signedOut
    }
}

enum SessionError: Error {
    case notConfigured
}
