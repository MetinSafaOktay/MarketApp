import Domain
import Networking
import Observation

@MainActor
@Observable
final class SettingsModel {
    private(set) var settings: UserSettings?
    private(set) var isDeleting = false
    private(set) var errorMessage: String?

    @ObservationIgnored private let deps: AppDependencies

    init(deps: AppDependencies) {
        self.deps = deps
    }

    var pushEnabled: Bool {
        settings?.pushNotificationsEnabled ?? true
    }

    var orderNotificationsEnabled: Bool {
        settings?.orderNotificationsEnabled ?? true
    }

    func load() async {
        settings = try? await deps.settings.settings()
    }

    func setPush(_ enabled: Bool) async {
        await apply(SettingsUpdate(pushNotificationsEnabled: enabled))
    }

    func setOrderNotifications(_ enabled: Bool) async {
        await apply(SettingsUpdate(orderNotificationsEnabled: enabled))
    }

    /// Hesabı kalıcı olarak devre dışı bırakır ve oturumu kapatır.
    func deleteAccount() async {
        isDeleting = true
        errorMessage = nil
        defer { isDeleting = false }
        do {
            try await deps.auth.deleteAccount()
            await deps.session.signOut()
        } catch {
            errorMessage = (error as? APIError)?.displayMessage ?? "Hesap silinemedi"
        }
    }

    private func apply(_ update: SettingsUpdate) async {
        let previous = settings
        do {
            settings = try await deps.settings.update(update)
        } catch {
            settings = previous
            errorMessage = "Ayar kaydedilemedi"
        }
    }
}
