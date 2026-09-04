/// Sepet (tümü sunucu tarafında).
public protocol CartRepository: Sendable {
    func cart(language: String) async throws -> [CartItem]
    func addItem(productID: String, quantity: Int) async throws
    func updateQuantity(productID: String, quantity: Int) async throws
    func removeItem(productID: String) async throws
    func clear() async throws
    func checkoutPreview(
    couponCode: String?,
    addressID: String?,
    language: String
  ) async throws -> CheckoutPreview
}

/// İstek listesi.
public protocol WishlistRepository: Sendable {
    func wishlist(language: String) async throws -> [Product]
    func add(productID: String) async throws
    func remove(productID: String) async throws
}

public protocol AddressRepository: Sendable {
    func addresses() async throws -> [Address]
    func create(_ address: NewAddress) async throws -> Address
    func delete(id: String) async throws
}

public protocol OrderRepository: Sendable {
    func orders(language: String) async throws -> [Order]
    func order(id: String, language: String) async throws -> Order
    func place(_ input: PlaceOrderInput, language: String) async throws -> Order
    func cancel(id: String, reason: String?, language: String) async throws -> Order
}
