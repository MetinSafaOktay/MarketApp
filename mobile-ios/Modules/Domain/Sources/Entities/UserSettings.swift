public struct UserSettings: Equatable, Sendable {
    public var language: String
    public var theme: String
    public var pushNotificationsEnabled: Bool
    public var orderNotificationsEnabled: Bool

    public init(
        language: String,
        theme: String,
        pushNotificationsEnabled: Bool,
        orderNotificationsEnabled: Bool
    ) {
        self.language = language
        self.theme = theme
        self.pushNotificationsEnabled = pushNotificationsEnabled
        self.orderNotificationsEnabled = orderNotificationsEnabled
    }
}

/// `PATCH /users/me/settings` gövdesi (yalnızca değişen alanlar).
public struct SettingsUpdate: Sendable, Equatable {
    public var pushNotificationsEnabled: Bool?
    public var orderNotificationsEnabled: Bool?

    public init(pushNotificationsEnabled: Bool? = nil, orderNotificationsEnabled: Bool? = nil) {
        self.pushNotificationsEnabled = pushNotificationsEnabled
        self.orderNotificationsEnabled = orderNotificationsEnabled
    }
}

/// `PATCH /users/me` gövdesi (profil düzenleme).
public struct ProfileUpdate: Sendable, Equatable {
    public var profileName: String?
    public var bio: String?
    public var isPrivate: Bool?

    public init(profileName: String? = nil, bio: String? = nil, isPrivate: Bool? = nil) {
        self.profileName = profileName
        self.bio = bio
        self.isPrivate = isPrivate
    }
}
