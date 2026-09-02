import Domain
import Foundation
import Networking
import Testing
@testable import Data

struct CommerceMapperTests {
    private let decoder = JSONDecoder.api

    @Test func cartItemDecodesEmbeddedProduct() throws {
        let json = Data("""
        [{
          "id": "ci1", "quantity": 3,
          "products": {
            "id": "p1", "category_id": "c1", "name": "Ekmek", "sku": "EKM",
            "description": "taze", "price": "18", "original_price": null,
            "is_new_arrival": false, "stock_quantity": 100,
            "product_images": [{ "image_url": "https://cdn/x.jpg" }]
          }
        }]
        """.utf8)
        let dtos = try decoder.decode([CartItemDTO].self, from: json)
        let item = CartMapper.map(dtos[0])

        #expect(item.quantity == 3)
        #expect(item.product.name == "Ekmek")
        #expect(item.lineTotal == Decimal(54))
        #expect([item].subtotal == Decimal(54))
    }

    @Test func checkoutPreviewAcceptsNumericAmounts() throws {
        let json = Data("""
        {
          "items": [{ "product_id": "p1", "name": "Ekmek", "quantity": 2,
                      "unit_price": 18, "line_total": 36, "in_stock": true,
                      "stock_quantity": 100 }],
          "subtotal": 36, "discount_amount": 0, "total": 36,
          "coupon": null, "coupon_error": null, "has_stock_issues": false
        }
        """.utf8)
        let dto = try decoder.decode(CheckoutPreviewDTO.self, from: json)
        let preview = CheckoutPreviewMapper.map(dto)

        #expect(preview.subtotal == Decimal(36))
        #expect(preview.lines.first?.unitPrice == Decimal(18))
        #expect(!preview.hasStockIssues)
    }

    @Test func orderDecodesStringAmountsAndStatus() throws {
        let json = Data("""
        {
          "id": "o1", "status": "out_for_delivery", "payment_method": "card",
          "subtotal": "36", "discount_amount": "4", "total_amount": "32",
          "created_at": "2026-09-02T15:29:04.307Z",
          "order_items": [{ "id": "oi1", "product_id": "p1", "quantity": 2,
            "unit_price_snapshot": "18", "subtotal": "36",
            "products": { "id": "p1", "category_id": "c1", "name": "Ekmek",
              "sku": "EKM", "price": "18", "is_new_arrival": false,
              "stock_quantity": 100 } }],
          "order_status_history": [
            { "id": "h1", "status": "pending", "note": "Sipariş oluşturuldu",
              "created_at": "2026-09-02T15:29:04.307Z" }],
          "addresses": { "id": "a1", "label": "Ev", "full_address": "X",
            "city": "Afyon", "district": "Merkez", "is_default": true }
        }
        """.utf8)
        let dto = try decoder.decode(OrderDTO.self, from: json)
        let order = OrderMapper.map(dto)

        #expect(order.status == .outForDelivery)
        #expect(order.paymentMethod == .card)
        #expect(order.discountAmount == Decimal(4))
        #expect(order.totalAmount == Decimal(32))
        #expect(order.lines.first?.name == "Ekmek")
        #expect(order.statusHistory.first?.status == .pending)
        #expect(order.address?.city == "Afyon")
        #expect(order.reference == "O1")
    }

    @Test func unknownStatusFallsBackToPending() throws {
        let json = Data("""
        { "id": "o2", "status": "weird", "payment_method": "cash_on_delivery",
          "subtotal": "10", "discount_amount": "0", "total_amount": "10",
          "order_items": [] }
        """.utf8)
        let order = try OrderMapper.map(decoder.decode(OrderDTO.self, from: json))
        #expect(order.status == .pending)
    }
}
