import Foundation

/// Mağaza duyurusu. `title` / `content` backend tarafından çözülmüş gelir.
public struct Announcement: Identifiable, Equatable, Sendable {
    public let id: String
    public let title: String
    public let content: String
    public let imageURL: URL?
    public let createdAt: Date?

    public init(
        id: String,
        title: String,
        content: String,
        imageURL: URL? = nil,
        createdAt: Date? = nil
    ) {
        self.id = id
        self.title = title
        self.content = content
        self.imageURL = imageURL
        self.createdAt = createdAt
    }
}
