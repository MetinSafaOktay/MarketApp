/// Mobil uygulamadaki admin ekranlarının veri kaynağı (yalnızca admin rolü).
public protocol AdminRepository: Sendable {
    func orders(status: OrderStatus?, language: String) async throws -> [Order]
    func order(id: String, language: String) async throws -> Order
    func updateOrderStatus(id: String, status: OrderStatus, note: String?, language: String)
        async throws -> Order

    func conversations() async throws -> [AdminConversation]
    func conversationMessages(id: String) async throws -> [Message]
    func reply(conversationID: String, content: String) async throws -> Message

    func lowStock(language: String) async throws -> [LowStockProduct]
}
