import DesignSystem
import Domain
import SwiftUI

/// Ana sayfa: mağaza kartı + duyurular + yatay ürün rafları.
struct HomeView: View {
    @Environment(\.dependencies) private var deps

    var body: some View {
        NavigationStack {
            Inner(deps: deps)
                .navigationTitle("Ana Sayfa")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarLeading) {
                        AccountToolbarButton()
                    }
                    ToolbarItemGroup(placement: .topBarTrailing) {
                        NotificationsToolbarButton()
                        MessagesToolbarButton()
                        CartToolbarButton()
                    }
                }
                .catalogDestinations()
        }
    }
}

private struct Inner: View {
    @State private var model: HomeModel

    init(deps: AppDependencies) {
        _model = State(wrappedValue: HomeModel(deps: deps))
    }

    var body: some View {
        ScrollView {
            if model.isLoading, model.rails.isEmpty {
                ProgressView().tint(Palette.textMuted).padding(.top, Spacing.xxl * 2)
            } else if let error = model.errorMessage {
                ContentUnavailableView {
                    Label(error, systemImage: "wifi.slash")
                } actions: {
                    Button("Tekrar dene") { Task { await model.load() } }
                        .buttonStyle(.bordered)
                        .tint(Palette.accent)
                }
                .padding(.top, Spacing.xxl)
            } else {
                VStack(spacing: Spacing.xl) {
                    HeroCard(store: model.store)
                    if !model.announcements.isEmpty {
                        AnnouncementList(announcements: Array(model.announcements.prefix(3)))
                    }
                    ForEach(model.rails) { rail in
                        ProductRail(rail: rail)
                    }
                }
                .padding(Spacing.lg)
            }
        }
        .background(Palette.background)
        .refreshable { await model.load() }
        .task { await model.loadIfNeeded() }
    }
}

// MARK: - Hero

private struct HeroCard: View {
    let store: StoreProfile?

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.sm) {
            Text(store?.name ?? "Erenler Market")
                .font(.largeTitle.bold())
                .foregroundStyle(Palette.text)
            Text(store?.tagline ?? "Online sipariş ver, kapıda öde!")
                .font(.callout)
                .foregroundStyle(Palette.textMuted)
            if let description = store?.description {
                Text(description)
                    .font(.footnote)
                    .foregroundStyle(Palette.textMuted)
                    .padding(.top, Spacing.xs)
            }
            NavigationLink(value: CatalogRoute.productList(
                ProductListSpec(title: "Mağaza", query: ProductQuery(), showsControls: true)
            )) {
                Text("Alışverişe başla")
            }
            .buttonStyle(.primary)
            .padding(.top, Spacing.sm)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface()
    }
}

// MARK: - Announcements

private struct AnnouncementList: View {
    let announcements: [Announcement]

    var body: some View {
        VStack(spacing: Spacing.md) {
            ForEach(announcements) { announcement in
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Label(announcement.title, systemImage: "megaphone.fill")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Palette.text)
                    Text(announcement.content)
                        .font(.footnote)
                        .foregroundStyle(Palette.textMuted)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(Spacing.md)
                .background(Palette.surfaceElevated, in: .rect(cornerRadius: Radius.card))
            }
        }
    }
}

// MARK: - Rail

private struct ProductRail: View {
    let rail: HomeModel.Rail

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md) {
            SectionHeader(rail.title) {
                NavigationLink(value: CatalogRoute.productList(
                    ProductListSpec(title: rail.title, query: rail.seeAll)
                )) {
                    Text("Tümü")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Palette.accent)
                }
            }
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: Spacing.md) {
                    ForEach(rail.products) { product in
                        ProductCardView(product: product)
                            .frame(width: 160)
                    }
                }
            }
            .scrollClipDisabled()
        }
    }
}

#Preview {
    HomeView().environment(\.dependencies, .preview)
}
