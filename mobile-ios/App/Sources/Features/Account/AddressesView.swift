import DesignSystem
import Domain
import SwiftUI

struct AddressesView: View {
    @Environment(\.dependencies) private var deps

    @State private var addresses: [Address] = []
    @State private var phase: Phase = .loading
    @State private var showingAdd = false

    private enum Phase: Equatable { case loading, ready, failed(String) }

    var body: some View {
        Group {
            switch phase {
            case .loading:
                ProgressView().tint(Palette.textMuted)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            case .failed(let message):
                ContentUnavailableView {
                    Label(message, systemImage: "exclamationmark.triangle")
                } actions: {
                    Button("Tekrar dene") { Task { await load() } }
                        .buttonStyle(.bordered).tint(Palette.accent)
                }
            case .ready:
                list
            }
        }
        .background(Palette.background)
        .navigationTitle("Adreslerim")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showingAdd = true
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showingAdd) {
            NavigationStack {
                AddAddressView { address in
                    addresses.insert(address, at: 0)
                }
            }
        }
        .task {
            if phase == .loading {
                await load()
            }
        }
    }

    @ViewBuilder
    private var list: some View {
        if addresses.isEmpty {
            ContentUnavailableView(
                "Kayıtlı adresin yok",
                systemImage: "mappin.slash",
                description: Text("Sağ üstten yeni adres ekle.")
            )
        } else {
            ScrollView {
                LazyVStack(spacing: Spacing.md) {
                    ForEach(addresses) { address in
                        HStack(alignment: .top, spacing: Spacing.md) {
                            VStack(alignment: .leading, spacing: Spacing.xs) {
                                HStack(spacing: Spacing.sm) {
                                    Text(address.label).font(.subheadline.weight(.semibold))
                                    if address.isDefault {
                                        Badge("Varsayılan", style: .neutral)
                                    }
                                }
                                Text(address.fullAddress).font(.footnote)
                                    .foregroundStyle(Palette.textMuted)
                                Text(address.summary).font(.caption)
                                    .foregroundStyle(Palette.textMuted)
                            }
                            Spacer(minLength: 0)
                            Button(role: .destructive) {
                                Task { await delete(address) }
                            } label: {
                                Image(systemName: "trash").font(.subheadline)
                            }
                            .buttonStyle(.borderless)
                            .tint(Palette.danger)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .cardSurface()
                    }
                }
                .padding(Spacing.lg)
            }
        }
    }

    private func load() async {
        do {
            addresses = try await deps.address.addresses()
            phase = .ready
        } catch {
            phase = .failed("Adresler yüklenemedi")
        }
    }

    private func delete(_ address: Address) async {
        addresses.removeAll { $0.id == address.id }
        try? await deps.address.delete(id: address.id)
    }
}
