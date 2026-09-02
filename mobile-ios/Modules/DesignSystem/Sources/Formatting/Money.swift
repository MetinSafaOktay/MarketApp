import Foundation

/// Para birimi biçimlendirme (₺). Tüm fiyatlar TRY.
public enum Money {
    private static let formatter: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "TRY"
        formatter.locale = Locale(identifier: "tr_TR")
        formatter.maximumFractionDigits = 2
        return formatter
    }()

    public static func string(_ amount: Decimal) -> String {
        formatter.string(from: amount as NSDecimalNumber) ?? "\(amount) ₺"
    }
}
