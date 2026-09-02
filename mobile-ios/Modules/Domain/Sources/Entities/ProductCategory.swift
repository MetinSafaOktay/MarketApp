import Foundation

public struct ProductCategory: Identifiable, Equatable, Sendable {
    public let id: String
    public let name: String
    public let imageURL: URL?
    public let displayOrder: Int

    public init(id: String, name: String, imageURL: URL?, displayOrder: Int) {
        self.id = id
        self.name = name
        self.imageURL = imageURL
        self.displayOrder = displayOrder
    }
}
