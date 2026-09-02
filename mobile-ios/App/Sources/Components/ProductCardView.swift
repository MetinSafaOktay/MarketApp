import DesignSystem
import Domain
import SwiftUI

/// Izgara/raf içinde tek ürün kartı. Dokunulunca ürün detayına götürür.
struct ProductCardView: View {
    let product: Product

    var body: some View {
        NavigationLink(value: CatalogRoute.product(id: product.id, name: product.name)) {
            VStack(alignment: .leading, spacing: Spacing.sm) {
                image
                Text(product.name)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Palette.text)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity, alignment: .leading)
                priceRow
            }
            .padding(Spacing.sm)
            .cardSurface(padding: nil)
        }
        .buttonStyle(.plain)
        .overlay(alignment: .topTrailing) {
            WishlistButton(product: product, size: .subheadline)
                .padding(Spacing.sm)
        }
    }

    private var image: some View {
        RemoteImage(url: product.imageURLs.first, contentMode: .fill) {
            Image(systemName: "photo")
                .font(.title)
                .foregroundStyle(Palette.textMuted)
        }
        .frame(height: 140)
        .frame(maxWidth: .infinity)
        .clipShape(.rect(cornerRadius: Radius.button))
        .overlay(alignment: .topLeading) { badges }
        .overlay(alignment: .bottomTrailing) {
            if !product.isInStock {
                Badge("Stok yok", style: .neutral).padding(Spacing.xs)
            }
        }
    }

    private var badges: some View {
        VStack(alignment: .leading, spacing: Spacing.xs) {
            if product.isDiscounted, let percent = discountPercent {
                Badge("−%\(percent)", style: .danger)
            }
            if product.isNewArrival {
                Badge("Yeni")
            }
        }
        .padding(Spacing.xs)
    }

    private var priceRow: some View {
        HStack(spacing: Spacing.sm) {
            Text(Money.string(product.price))
                .font(.callout.weight(.bold))
                .foregroundStyle(Palette.text)
            if product.isDiscounted, let original = product.originalPrice {
                Text(Money.string(original))
                    .font(.caption)
                    .strikethrough()
                    .foregroundStyle(Palette.textMuted)
            }
        }
    }

    private var discountPercent: Int? {
        guard let original = product.originalPrice, original > 0, original > product.price else {
            return nil
        }
        let ratio = (original - product.price) / original
        return Int((ratio as NSDecimalNumber).doubleValue * 100)
    }
}
