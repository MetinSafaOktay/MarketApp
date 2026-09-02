import DesignSystem
import Domain
import SwiftUI

struct EditProfileView: View {
    @Environment(\.dependencies) private var deps
    @Environment(\.dismiss) private var dismiss

    @State private var profileName = ""
    @State private var bio = ""
    @State private var isPrivate = false
    @State private var isSaving = false
    @State private var errorMessage: String?
    @State private var loaded = false

    private var canSave: Bool {
        !profileName.trimmingCharacters(in: .whitespaces).isEmpty && !isSaving
    }

    var body: some View {
        Form {
            Section("Profil") {
                TextField("Kullanıcı adı", text: $profileName)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                TextField("Hakkında", text: $bio, axis: .vertical)
                    .lineLimit(2 ... 5)
            }
            Section {
                Toggle("Gizli profil", isOn: $isPrivate)
            } footer: {
                Text("Gizli profilde seni yalnızca onayladığın kişiler takip edebilir.")
            }
            if let errorMessage {
                Section { Text(errorMessage).foregroundStyle(Palette.danger).font(.footnote) }
            }
        }
        .tint(Palette.accent)
        .navigationTitle("Profili düzenle")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Kaydet") { Task { await save() } }
                    .fontWeight(.semibold)
                    .disabled(!canSave)
            }
        }
        .task {
            guard !loaded, let user = deps.session.currentUser else { return }
            profileName = user.profileName
            bio = user.bio ?? ""
            isPrivate = user.isPrivate
            loaded = true
        }
    }

    private func save() async {
        isSaving = true
        errorMessage = nil
        defer { isSaving = false }
        let update = ProfileUpdate(
            profileName: profileName.trimmingCharacters(in: .whitespaces),
            bio: bio.trimmingCharacters(in: .whitespacesAndNewlines),
            isPrivate: isPrivate
        )
        if await deps.session.updateProfile(update) {
            dismiss()
        } else {
            errorMessage = "Profil kaydedilemedi"
        }
    }
}
