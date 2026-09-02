import Foundation
import Networking
import Testing
@testable import Data

struct ProductMapperTests {
    private let decoder = JSONDecoder.api

    @Test func mapsCoreFields() throws {
        let json = Data("""
        {
          "id": "p1", "category_id": "c1", "name": "Koska Helva", "sku": "KOSKA-200",
          "description": "Doğal lif", "price": "95", "original_price": "120",
          "is_new_arrival": true, "stock_quantity": 8,
          "product_images": [{ "image_url": "https://cdn.test/a.jpg" }]
        }
        """.utf8)

        let dto = try decoder.decode(ProductDTO.self, from: json)
        let product = ProductMapper.map(dto)

        #expect(product.name == "Koska Helva")
        #expect(product.price == Decimal(95))
        #expect(product.originalPrice == Decimal(120))
        #expect(product.isDiscounted)
        #expect(product.imageURLs.count == 1)
    }

    @Test func emptyDescriptionBecomesNil() throws {
        let json = Data("""
        { "id": "p1", "category_id": "c1", "name": "X", "sku": "S", "description": "",
          "price": "10", "original_price": null, "is_new_arrival": false,
          "stock_quantity": 0 }
        """.utf8)
        let dto = try decoder.decode(ProductDTO.self, from: json)
        #expect(ProductMapper.map(dto).description == nil)
    }
}
