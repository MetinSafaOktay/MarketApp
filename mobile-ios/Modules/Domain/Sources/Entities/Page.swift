/// Sayfalı liste sonucu (backend `{ data, meta }` biçimine karşılık gelir).
public struct Page<Element: Sendable>: Sendable {
    public let items: [Element]
    public let page: Int
    public let pageSize: Int
    public let total: Int
    public let totalPages: Int

    public init(items: [Element], page: Int, pageSize: Int, total: Int, totalPages: Int) {
        self.items = items
        self.page = page
        self.pageSize = pageSize
        self.total = total
        self.totalPages = totalPages
    }

    public var hasNextPage: Bool {
        page < totalPages
    }
}
