import Domain
import Foundation
import Networking

// MARK: - Cart

public struct CartRepositoryLive: CartRepository {
    private let client: APIClient
    public init(client: APIClient) {
        self.client = client
    }

    public func cart(language: String) async throws -> [CartItem] {
        let dtos: [CartItemDTO] = try await client.send(
            .get("/cart", query: ["lang": language], auth: true)
        )
        return dtos.map(CartMapper.map)
    }

    public func addItem(productID: String, quantity: Int) async throws {
        try await client.send(.post(
            "/cart/items",
            json: AddCartItemBody(productID: productID, quantity: quantity),
            auth: true
        ))
    }

    public func updateQuantity(productID: String, quantity: Int) async throws {
        try await client.send(Endpoint(
            path: "/cart/items/\(productID)",
            method: .patch,
            body: JSONEncoder.api.encode(QuantityBody(quantity: quantity)),
            requiresAuth: true
        ))
    }

    public func removeItem(productID: String) async throws {
        try await client.send(Endpoint(
            path: "/cart/items/\(productID)", method: .delete, requiresAuth: true
        ))
    }

    public func clear() async throws {
        try await client.send(Endpoint(path: "/cart", method: .delete, requiresAuth: true))
    }

    public func checkoutPreview(
        couponCode: String?,
        language: String
    ) async throws -> CheckoutPreview {
        let dto: CheckoutPreviewDTO = try await client.send(Endpoint(
            path: "/cart/checkout-preview",
            method: .post,
            query: ["lang": language],
            body: JSONEncoder.api.encode(CouponBody(couponCode: couponCode)),
            requiresAuth: true
        ))
        return CheckoutPreviewMapper.map(dto)
    }

    private struct AddCartItemBody: Encodable { let productID: String; let quantity: Int }
    private struct QuantityBody: Encodable { let quantity: Int }
    private struct CouponBody: Encodable { let couponCode: String? }
}

// MARK: - Wishlist

public struct WishlistRepositoryLive: WishlistRepository {
    private let client: APIClient
    public init(client: APIClient) {
        self.client = client
    }

    public func wishlist(language: String) async throws -> [Product] {
        let dtos: [ProductWrapperDTO] = try await client.send(
            .get("/wishlist", query: ["lang": language], auth: true)
        )
        return dtos.map { ProductMapper.map($0.products) }
    }

    public func add(productID: String) async throws {
        try await client.send(.post(
            "/wishlist/items", json: ProductRefBody(productID: productID), auth: true
        ))
    }

    public func remove(productID: String) async throws {
        try await client.send(Endpoint(
            path: "/wishlist/items/\(productID)", method: .delete, requiresAuth: true
        ))
    }

    private struct ProductRefBody: Encodable { let productID: String }
}

// MARK: - Address

public struct AddressRepositoryLive: AddressRepository {
    private let client: APIClient
    public init(client: APIClient) {
        self.client = client
    }

    public func addresses() async throws -> [Address] {
        let dtos: [AddressDTO] = try await client.send(.get("/addresses", auth: true))
        return dtos.map(AddressMapper.map)
    }

    public func create(_ address: NewAddress) async throws -> Address {
        let dto: AddressDTO = try await client.send(.post(
            "/addresses",
            json: Body(
                label: address.label,
                fullAddress: address.fullAddress,
                city: address.city,
                district: address.district,
                isDefault: address.isDefault
            ),
            auth: true
        ))
        return AddressMapper.map(dto)
    }

    public func delete(id: String) async throws {
        try await client.send(Endpoint(
            path: "/addresses/\(id)", method: .delete, requiresAuth: true
        ))
    }

    private struct Body: Encodable {
        let label: String
        let fullAddress: String
        let city: String
        let district: String
        let isDefault: Bool
    }
}

// MARK: - Order

public struct OrderRepositoryLive: OrderRepository {
    private let client: APIClient
    public init(client: APIClient) {
        self.client = client
    }

    public func orders(language: String) async throws -> [Order] {
        let dtos: [OrderDTO] = try await client.send(
            .get("/orders", query: ["lang": language], auth: true)
        )
        return dtos.map(OrderMapper.map)
    }

    public func order(id: String, language: String) async throws -> Order {
        let dto: OrderDTO = try await client.send(
            .get("/orders/\(id)", query: ["lang": language], auth: true)
        )
        return OrderMapper.map(dto)
    }

    public func place(_ input: PlaceOrderInput, language: String) async throws -> Order {
        let body = CreateOrderBody(
            addressID: input.addressID,
            items: input.items.map { ItemBody(productID: $0.productID, quantity: $0.quantity) },
            couponCode: input.couponCode,
            paymentMethod: input.paymentMethod.rawValue
        )
        let dto: OrderDTO = try await client.send(Endpoint(
            path: "/orders",
            method: .post,
            query: ["lang": language],
            body: JSONEncoder.api.encode(body),
            requiresAuth: true
        ))
        return OrderMapper.map(dto)
    }

    public func cancel(id: String, reason: String?, language: String) async throws -> Order {
        let dto: OrderDTO = try await client.send(Endpoint(
            path: "/orders/\(id)/cancel",
            method: .patch,
            query: ["lang": language],
            body: JSONEncoder.api.encode(CancelBody(reason: reason)),
            requiresAuth: true
        ))
        return OrderMapper.map(dto)
    }

    private struct ItemBody: Encodable { let productID: String; let quantity: Int }
    private struct CreateOrderBody: Encodable {
        let addressID: String
        let items: [ItemBody]
        let couponCode: String?
        let paymentMethod: String
    }

    private struct CancelBody: Encodable { let reason: String? }
}
