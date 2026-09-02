import Domain
import Foundation
import Networking
import Testing
@testable import ErenlerMarket

@MainActor
struct SessionStoreTests {
    private func makeSession(auth: StubAuth) -> SessionStore {
        let store =
            SessionStore(keychain: KeychainStore(service: "test.session.\(UUID().uuidString)"))
        store.attach(authRepository: auth)
        return store
    }

    @Test func signInMovesToSignedIn() async throws {
        let store = makeSession(auth: StubAuth(user: TestFixtures.user()))
        try await store.signIn(email: "test@example.com", password: "parola1234")

        #expect(store.isSignedIn)
        #expect(store.currentUser?.id == "u1")
    }

    @Test func signInPropagatesError() async {
        let store = makeSession(auth: StubAuth(loginError: APIError.http(
            status: 401,
            message: "Geçersiz"
        )))
        await #expect(throws: APIError.self) {
            try await store.signIn(email: "x@y.com", password: "parola1234")
        }
        #expect(!store.isSignedIn)
    }

    @Test func signOutClearsUser() async throws {
        let store = makeSession(auth: StubAuth())
        try await store.signIn(email: "test@example.com", password: "parola1234")
        await store.signOut()

        #expect(!store.isSignedIn)
        #expect(store.phase == .signedOut)
    }

    @Test func restoreWithoutTokensSignsOut() async {
        let store = makeSession(auth: StubAuth())
        await store.restore()
        #expect(store.phase == .signedOut)
    }

    @Test func accessTokenAvailableAfterSignIn() async throws {
        let store = makeSession(auth: StubAuth(
            tokens: AuthTokens(accessToken: "abc", refreshToken: "def")
        ))
        try await store.signIn(email: "test@example.com", password: "parola1234")
        let token = await store.accessToken()
        #expect(token == "abc")
    }
}
