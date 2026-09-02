import DesignSystem
import Domain
import SwiftUI

struct ProductDetailView: View {
    @Environment(\.dependencies) private var deps
    let productID: String
    let fallbackTitle: String

    var body: some View {
        Inner(productID: productID, fallbackTitle: fallbackTitle, deps: deps)
    }
}

private struct Inner: View {
    @Environment(\.dependencies) private var deps
    @State private var model: ProductDetailModel
    @State private var didAddToCart = false
    @State private var showingAuth = false
    private let fallbackTitle: String

    init(productID: String, fallbackTitle: String, deps: AppDependencies) {
        _model = State(wrappedValue: ProductDetailModel(productID: productID, deps: deps))
        self.fallbackTitle = fallbackTitle
    }

    var body: some View {
        Group {
            switch model.phase {
            case .loading:
                ProgressView().tint(Palette.textMuted)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)

            case .failed(let message):
                ContentUnavailableView {
                    Label(message, systemImage: "wifi.slash")
                } actions: {
                    Button("Tekrar dene") { Task { await model.load() } }
                        .buttonStyle(.bordered)
                        .tint(Palette.accent)
                }

            case .loaded(let product):
                content(product)
            }
        }
        .background(Palette.background)
        .navigationTitle(fallbackTitle)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if case .loaded(let product) = model.phase {
                ToolbarItem(placement: .topBarTrailing) {
                    WishlistButton(product: product)
                }
            }
        }
        .task { await model.loadIfNeeded() }
    }

    private func content(_ product: Product) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.lg) {
                Gallery(urls: product.imageURLs)
                infoSection(product)

                if let description = product.description, !description.isEmpty {
                    Text(description)
                        .font(.callout)
                        .foregroundStyle(Palette.text)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                addToCartButton(product)

                similarSection
            }
            .padding(Spacing.lg)
        }
    }

    private func addToCartButton(_ product: Product) -> some View {
        Button {
            guard deps.session.isSignedIn else { showingAuth = true; return }
            Task {
                await deps.cartStore.add(productID: product.id)
                didAddToCart = true
            }
        } label: {
            Label(
                didAddToCart ? "Sepete eklendi" : "Sepete ekle",
                systemImage: didAddToCart ? "checkmark" : "bag.badge.plus"
            )
        }
        .buttonStyle(.primary)
        .disabled(!product.isInStock)
        .opacity(product.isInStock ? 1 : 0.5)
        .sheet(isPresented: $showingAuth) {
            NavigationStack { AuthView(onAuthenticated: { showingAuth = false }) }
        }
    }

    private func infoSection(_ product: Product) -> some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text(product.name)
                .font(.title2.bold())
                .foregroundStyle(Palette.text)

            HStack(spacing: Spacing.sm) {
                Text(Money.string(product.price))
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Palette.text)
                if product.isDiscounted, let original = product.originalPrice {
                    Text(Money.string(original))
                        .font(.subheadline)
                        .strikethrough()
                        .foregroundStyle(Palette.textMuted)
                }
            }

            HStack(spacing: Spacing.sm) {
                if product.isNewArrival {
                    Badge("Yeni")
                }
                if product.isInStock {
                    Badge("Stokta", style: .neutral)
                } else {
                    Badge("Stok yok", style: .danger)
                }
            }

            Text("Stok kodu: \(product.sku)")
                .font(.caption)
                .foregroundStyle(Palette.textMuted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    @ViewBuilder
    private var similarSection: some View {
        if !model.similar.isEmpty {
            Divider().overlay(Palette.border)
            SectionHeader("Benzer ürünler")
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.md) {
                    ForEach(model.similar) { item in
                        ProductCardView(product: item).frame(width: 160)
                    }
                }
            }
            .scrollClipDisabled()
        }
    }
}

// MARK: - Gallery

private struct Gallery: View {
    let urls: [URL]
    @State private var selection = 0

    var body: some View {
        Group {
            if urls.isEmpty {
                placeholder
            } else if urls.count == 1 {
                image(urls[0])
            } else {
                TabView(selection: $selection) {
                    ForEach(Array(urls.enumerated()), id: \.offset) { index, url in
                        image(url).tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .always))
            }
        }
        .frame(height: 280)
        .frame(maxWidth: .infinity)
        .background(Palette.surfaceElevated, in: .rect(cornerRadius: Radius.card))
        .clipShape(.rect(cornerRadius: Radius.card))
    }

    private func image(_ url: URL) -> some View {
        RemoteImage(url: url, contentMode: .fit) {
            Image(systemName: "photo").font(.largeTitle).foregroundStyle(Palette.textMuted)
        }
    }

    private var placeholder: some View {
        Image(systemName: "photo")
            .font(.largeTitle)
            .foregroundStyle(Palette.textMuted)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
