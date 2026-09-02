import Domain
import Networking
import Observation

@MainActor
@Observable
final class AuthFormModel {
    enum Mode: String, CaseIterable {
        case login
        case register

        var title: String {
            self == .login ? "Giriş yap" : "Kayıt ol"
        }
    }

    var mode: Mode = .login

    var email = ""
    var password = ""
    var profileName = ""
    var firstName = ""
    var lastName = ""

    private(set) var isSubmitting = false
    private(set) var errorMessage: String?

    private let session: SessionStore

    init(session: SessionStore) {
        self.session = session
    }

    var canSubmit: Bool {
        guard isValidEmail, password.count >= 8 else { return false }
        if mode == .register {
            return !profileName.trimmed.isEmpty
                && !firstName.trimmed.isEmpty
                && !lastName.trimmed.isEmpty
        }
        return true
    }

    private var isValidEmail: Bool {
        let value = email.trimmed
        return value.contains("@") && value.contains(".") && value.count >= 5
    }

    /// Başarılıysa `true` (çağıran ekranı kapatabilir).
    func submit() async -> Bool {
        guard canSubmit, !isSubmitting else { return false }
        isSubmitting = true
        errorMessage = nil
        defer { isSubmitting = false }

        do {
            switch mode {
            case .login:
                try await session.signIn(email: email.trimmed, password: password)
            case .register:
                try await session.register(RegisterInput(
                    email: email.trimmed,
                    password: password,
                    profileName: profileName.trimmed,
                    firstName: firstName.trimmed,
                    lastName: lastName.trimmed
                ))
            }
            return true
        } catch {
            errorMessage = (error as? APIError)?.displayMessage ?? "Bir şeyler ters gitti"
            return false
        }
    }
}

extension String {
    fileprivate var trimmed: String {
        trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
