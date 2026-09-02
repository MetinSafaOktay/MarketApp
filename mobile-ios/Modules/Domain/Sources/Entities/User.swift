import Foundation

public enum UserRole: String, Sendable, Equatable {
    case customer
    case admin
}

/// Oturum açmış kullanıcı.
public struct User: Identifiable, Equatable, Sendable {
    public let id: String
    public let email: String?
    public let phone: String?
    public let profileName: String
    public let firstName: String
    public let lastName: String
    public let photoURL: URL?
    public let bio: String?
    public let isPrivate: Bool
    public let role: UserRole

    public init(
        id: String,
        email: String?,
        phone: String?,
        profileName: String,
        firstName: String,
        lastName: String,
        photoURL: URL? = nil,
        bio: String? = nil,
        isPrivate: Bool = false,
        role: UserRole = .customer
    ) {
        self.id = id
        self.email = email
        self.phone = phone
        self.profileName = profileName
        self.firstName = firstName
        self.lastName = lastName
        self.photoURL = photoURL
        self.bio = bio
        self.isPrivate = isPrivate
        self.role = role
    }

    public var fullName: String {
        "\(firstName) \(lastName)".trimmingCharacters(in: .whitespaces)
    }

    /// E-posta yoksa telefon; ikisi de yoksa profil adı.
    public var contactLabel: String {
        email ?? phone ?? profileName
    }
}
