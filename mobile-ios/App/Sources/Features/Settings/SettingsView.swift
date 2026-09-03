import DesignSystem
import Domain
import SwiftUI

struct SettingsView: View {
    @Environment(\.dependencies) private var deps

    var body: some View {
        Inner(deps: deps)
            .navigationTitle("Ayarlar")
            .navigationBarTitleDisplayMode(.inline)
    }
}

private struct Inner: View {
    @Environment(\.dependencies) private var deps
    @AppStorage("appearance") private var appearance: Appearance = .system
    @AppStorage(AppLanguage.storageKey) private var contentLanguage: String = AppLanguage.fallback
    @State private var model: SettingsModel
    @State private var showingDeleteConfirm = false

    init(deps: AppDependencies) {
        _model = State(wrappedValue: SettingsModel(deps: deps))
    }

    var body: some View {
        Form {
            Section("Görünüm") {
                Picker("Tema", selection: $appearance) {
                    Text("Sistem").tag(Appearance.system)
                    Text("Açık").tag(Appearance.light)
                    Text("Koyu").tag(Appearance.dark)
                }
                .pickerStyle(.inline)
                .labelsHidden()
            }

            Section("Dil") {
                Picker("İçerik dili", selection: $contentLanguage) {
                    ForEach(AppLanguage.supported, id: \.self) { code in
                        Text(AppLanguage.displayName(code)).tag(code)
                    }
                }
                Text("Ürün, kategori ve duyuru metinlerinin dili. Arayüz her dilde Türkçedir.")
                    .font(.caption)
                    .foregroundStyle(Palette.textMuted)
            }

            if deps.session.isSignedIn {
                Section("Bildirimler") {
                    Toggle("Anlık bildirimler", isOn: Binding(
                        get: { model.pushEnabled },
                        set: { value in Task { await model.setPush(value) } }
                    ))
                    Toggle("Sipariş bildirimleri", isOn: Binding(
                        get: { model.orderNotificationsEnabled },
                        set: { value in Task { await model.setOrderNotifications(value) } }
                    ))
                }

                Section("Hesap") {
                    NavigationLink("Profili düzenle") { EditProfileView() }
                    NavigationLink("Hakkında") { AboutView() }
                }

                Section {
                    Button("Hesabı sil", role: .destructive) {
                        showingDeleteConfirm = true
                    }
                    .disabled(model.isDeleting)
                } footer: {
                    Text("Hesabın kalıcı olarak kapatılır ve verilerin anonimleştirilir.")
                }
            } else {
                Section("Hesap") {
                    NavigationLink("Hakkında") { AboutView() }
                }
            }

            if let error = model.errorMessage {
                Section { Text(error).foregroundStyle(Palette.danger).font(.footnote) }
            }
        }
        .tint(Palette.accent)
        .confirmationDialog(
            "Hesabını silmek istediğine emin misin?",
            isPresented: $showingDeleteConfirm,
            titleVisibility: .visible
        ) {
            Button("Hesabı sil", role: .destructive) { Task { await model.deleteAccount() } }
            Button("Vazgeç", role: .cancel) { }
        }
        .task { await model.load() }
    }
}
