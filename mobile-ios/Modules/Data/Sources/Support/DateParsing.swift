import Foundation

/// Backend "2026-09-02T17:29:11.131Z" gibi (kesirli saniyeli) ISO8601 döndürür.
enum DateParsing {
    static func iso8601(_ string: String?) -> Date? {
        guard let string else { return nil }
        let withFraction = Date.ISO8601FormatStyle(includingFractionalSeconds: true)
        return (try? withFraction.parse(string))
            ?? (try? Date.ISO8601FormatStyle().parse(string))
    }
}
