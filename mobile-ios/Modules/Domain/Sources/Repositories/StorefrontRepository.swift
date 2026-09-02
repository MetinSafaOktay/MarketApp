/// Mağaza vitrini içeriği (profil + duyurular). Katalogdan ayrı tutulur.
public protocol StorefrontRepository: Sendable {
    func storeProfile(language: String) async throws -> StoreProfile
    func announcements(language: String) async throws -> [Announcement]
}
