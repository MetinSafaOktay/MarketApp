import DesignSystem
import Domain
import SwiftUI

struct AboutView: View {
    @Environment(\.dependencies) private var deps
    @State private var store: StoreProfile?
    @State private var loaded = false

    private var appVersion: String {
        let info = Bundle.main.infoDictionary
        let version = info?["CFBundleShortVersionString"] as? String ?? "1.0"
        let build = info?["CFBundleVersion"] as? String ?? "1"
        return "\(version) (\(build))"
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.lg) {
                VStack(alignment: .leading, spacing: Spacing.sm) {
                    Text(store?.name ?? "Erenler Market")
                        .font(.title2.bold())
                        .foregroundStyle(Palette.text)
                    if let city = store?.city {
                        Text(city).font(.subheadline).foregroundStyle(Palette.textMuted)
                    }
                    if let description = store?.description {
                        Text(description)
                            .font(.callout)
                            .foregroundStyle(Palette.text)
                            .padding(.top, Spacing.xs)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .cardSurface()

                VStack(spacing: 0) {
                    if let phone = store?.phone {
                        infoRow("Telefon", phone)
                        Divider().overlay(Palette.border)
                    }
                    if let address = store?.address {
                        infoRow("Adres", address)
                        Divider().overlay(Palette.border)
                    }
                    infoRow("Uygulama sürümü", appVersion)
                }
                .cardSurface(padding: nil)
            }
            .padding(Spacing.lg)
        }
        .background(Palette.background)
        .navigationTitle("Hakkında")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            guard !loaded else { return }
            loaded = true
            store = try? await deps.storefront.storeProfile(language: deps.language)
        }
    }

    private func infoRow(_ label: String, _ value: String) -> some View {
        HStack(alignment: .top) {
            Text(label).foregroundStyle(Palette.textMuted)
            Spacer(minLength: Spacing.md)
            Text(value).foregroundStyle(Palette.text).multilineTextAlignment(.trailing)
        }
        .font(.subheadline)
        .padding(Spacing.md)
    }
}
