import Domain
import Networking
import Observation
import SwiftUI

/// Sayfalı ürün listesi durumu. Mağaza sekmesi, kategori detayı ve
/// ana sayfa "tümünü gör" ekranları bunu paylaşır.
@MainActor
@Observable
final class ProductListModel {
    enum Phase: Equatable {
        case loading
        case loaded
        case empty
        case failed(String)
    }

    private(set) var products: [Product] = []
    private(set) var phase: Phase = .loading
    private(set) var isLoadingMore = false

    /// Kullanıcı arayüzünden düzenlenen sorgu (sayfa hariç).
    var query: ProductQuery

    private let catalog: any CatalogRepository
    private let language: String
    private var totalPages = 1
    private var hasLoadedOnce = false

    init(deps: AppDependencies, query: ProductQuery) {
        catalog = deps.catalog
        language = deps.language
        self.query = query
    }

    var canLoadMore: Bool {
        query.page < totalPages
    }

    /// İlk görünümde bir kez yükler; geri dönüşlerde yeniden çekmez.
    func loadIfNeeded() async {
        guard !hasLoadedOnce else { return }
        hasLoadedOnce = true
        await reload()
    }

    func reload() async {
        query.page = 1
        if products.isEmpty {
            phase = .loading
        }
        do {
            let page = try await catalog.products(query, language: language)
            products = page.items
            totalPages = page.totalPages
            phase = page.items.isEmpty ? .empty : .loaded
        } catch is CancellationError {
            // sessizce yok say
        } catch {
            phase = .failed(message(for: error))
        }
    }

    func loadMore(after item: Product) async {
        guard canLoadMore, !isLoadingMore, phase == .loaded else { return }
        guard let index = products.firstIndex(where: { $0.id == item.id }),
              index >= products.count - 4 else { return }

        isLoadingMore = true
        defer { isLoadingMore = false }
        query.page += 1
        do {
            let page = try await catalog.products(query, language: language)
            let known = Set(products.map(\.id))
            products.append(contentsOf: page.items.filter { !known.contains($0.id) })
            totalPages = page.totalPages
        } catch {
            query.page -= 1 // tekrar denenebilsin
        }
    }

    /// Filtre/sıralama değişince baştan yükler.
    func applyQueryChange() async {
        await reload()
    }

    private func message(for error: Error) -> String {
        (error as? APIError)?.displayMessage ?? "Ürünler yüklenemedi"
    }
}
