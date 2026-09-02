import Domain
import Foundation
import Testing
@testable import ErenlerMarket

@MainActor
struct CartStoreTests {
    private func signedInDeps(cart: StubCart) async throws -> AppDependencies {
        let deps = TestDeps.make(cart: cart)
        try await deps.session.signIn(email: "test@example.com", password: "parola1234")
        return deps
    }

    @Test func refreshLoadsItemsWhenSignedIn() async throws {
        let cart = StubCart()
        cart.items = [CartItem(id: "ci1", product: TestFixtures.product(id: "p1"), quantity: 2)]
        let deps = try await signedInDeps(cart: cart)

        await deps.cartStore.refresh()

        #expect(deps.cartStore.itemCount == 2)
        #expect(deps.cartStore.subtotal == Decimal(20))
    }

    @Test func refreshIsNoOpWhenSignedOut() async {
        let deps = TestDeps.make()
        await deps.cartStore.refresh()
        #expect(deps.cartStore.isEmpty)
    }

    @Test func setQuantityUpdatesOptimisticallyAndCallsRepo() async throws {
        let cart = StubCart()
        cart.items = [CartItem(id: "ci1", product: TestFixtures.product(id: "p1"), quantity: 1)]
        let deps = try await signedInDeps(cart: cart)
        await deps.cartStore.refresh()

        await deps.cartStore.setQuantity(productID: "p1", quantity: 4)

        #expect(deps.cartStore.items.first?.quantity == 4)
        #expect(cart.updateCalls.contains { $0 == ("p1", 4) })
    }

    @Test func removeDropsItemLocally() async throws {
        let cart = StubCart()
        cart.items = [CartItem(id: "ci1", product: TestFixtures.product(id: "p1"), quantity: 1)]
        let deps = try await signedInDeps(cart: cart)
        await deps.cartStore.refresh()

        await deps.cartStore.remove(productID: "p1")
        #expect(deps.cartStore.isEmpty)
    }
}

@MainActor
struct WishlistStoreTests {
    @Test func toggleReturnsFalseWhenSignedOut() async {
        let deps = TestDeps.make()
        let handled = await deps.wishlistStore.toggle(TestFixtures.product(id: "p1"))
        #expect(!handled)
    }

    @Test func toggleAddsThenRemovesWhenSignedIn() async throws {
        let deps = TestDeps.make()
        try await deps.session.signIn(email: "test@example.com", password: "parola1234")
        let product = TestFixtures.product(id: "p1")

        _ = await deps.wishlistStore.toggle(product)
        #expect(deps.wishlistStore.isWishlisted("p1"))

        _ = await deps.wishlistStore.toggle(product)
        #expect(!deps.wishlistStore.isWishlisted("p1"))
    }
}

@MainActor
struct CheckoutModelTests {
    @Test func loadPicksDefaultAddress() async {
        var address = StubAddress()
        address.addressesResult = [
            Address(
                id: "a1",
                label: "İş",
                fullAddress: "x",
                city: "Afyon",
                district: "M",
                isDefault: false
            ),
            Address(
                id: "a2",
                label: "Ev",
                fullAddress: "y",
                city: "Afyon",
                district: "M",
                isDefault: true
            )
        ]
        let deps = TestDeps.make(address: address)
        let model = CheckoutModel(deps: deps)

        await model.load()

        #expect(model.phase == .ready)
        #expect(model.selectedAddressID == "a2")
    }
}
