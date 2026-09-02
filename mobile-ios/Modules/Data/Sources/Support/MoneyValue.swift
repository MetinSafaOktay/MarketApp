import Foundation

/// Backend para alanlarını hem string ("18", "34.90") hem sayı (36) olarak
/// döndürebiliyor. Her ikisini de `Decimal`'e çevirir.
struct MoneyValue: Decodable, Sendable {
    let value: Decimal

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        let string = try? container.decode(String.self)
        if let string, let decimal = Decimal(string: string, locale: Self.posix) {
            value = decimal
        } else {
            value = try container.decode(Decimal.self)
        }
    }

    private static let posix = Locale(identifier: "en_US_POSIX")
}
