import Foundation
import Testing
@testable import Domain

struct ProductTests {
    private func make(price: Decimal, original: Decimal?, stock: Int = 5) -> Product {
        Product(
            id: "1", categoryID: "c1", name: "Test", sku: "SKU",
            description: nil, price: price, originalPrice: original,
            isNewArrival: false, stockQuantity: stock, imageURLs: []
        )
    }

    @Test func discountedWhenOriginalPriceHigher() {
        #expect(make(price: 8, original: 10).isDiscounted)
    }

    @Test func notDiscountedWithoutOriginalPrice() {
        #expect(!make(price: 8, original: nil).isDiscounted)
    }

    @Test func notDiscountedWhenOriginalPriceEqualOrLower() {
        #expect(!make(price: 10, original: 10).isDiscounted)
        #expect(!make(price: 10, original: 8).isDiscounted)
    }

    @Test func stockReflectsQuantity() {
        #expect(make(price: 1, original: nil, stock: 0).isInStock == false)
        #expect(make(price: 1, original: nil, stock: 1).isInStock)
    }
}
