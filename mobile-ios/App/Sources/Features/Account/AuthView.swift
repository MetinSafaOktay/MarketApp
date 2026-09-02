import DesignSystem
import SwiftUI

/// Giriş / kayıt formu. Başarıda `onAuthenticated` çağrılır.
struct AuthView: View {
    @Environment(\.dependencies) private var deps
    var onAuthenticated: () -> Void = { }

    var body: some View {
        Inner(session: deps.session, onAuthenticated: onAuthenticated)
    }
}

private struct Inner: View {
    @State private var model: AuthFormModel
    @FocusState private var focused: Field?
    private let onAuthenticated: () -> Void

    private enum Field: Hashable {
        case email, password, profileName, firstName, lastName
    }

    init(session: SessionStore, onAuthenticated: @escaping () -> Void) {
        _model = State(wrappedValue: AuthFormModel(session: session))
        self.onAuthenticated = onAuthenticated
    }

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.lg) {
                Picker("Mod", selection: $model.mode) {
                    ForEach(AuthFormModel.Mode.allCases, id: \.self) { mode in
                        Text(mode.title).tag(mode)
                    }
                }
                .pickerStyle(.segmented)

                VStack(spacing: Spacing.md) {
                    field("E-posta", text: $model.email, field: .email)
                        .keyboardType(.emailAddress)
                        .textContentType(.username)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()

                    secureField("Parola", text: $model.password, field: .password)

                    if model.mode == .register {
                        field("Kullanıcı adı", text: $model.profileName, field: .profileName)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                        field("Ad", text: $model.firstName, field: .firstName)
                        field("Soyad", text: $model.lastName, field: .lastName)
                    }
                }

                if let error = model.errorMessage {
                    Text(error)
                        .font(.footnote)
                        .foregroundStyle(Palette.danger)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                Button {
                    Task {
                        if await model.submit() {
                            onAuthenticated()
                        }
                    }
                } label: {
                    if model.isSubmitting {
                        ProgressView().tint(Palette.onAccent)
                    } else {
                        Text(model.mode.title)
                    }
                }
                .buttonStyle(.primary)
                .disabled(!model.canSubmit || model.isSubmitting)

                Text(model.mode == .register
                    ? "Kayıt olarak kullanım koşullarını kabul etmiş olursun."
                    : "Parolanı mı unuttun? Şimdilik mağazadan yardım iste.")
                    .font(.caption)
                    .foregroundStyle(Palette.textMuted)
                    .multilineTextAlignment(.center)
            }
            .padding(Spacing.lg)
        }
        .background(Palette.background)
        .navigationTitle("Hesap")
        .navigationBarTitleDisplayMode(.inline)
        .scrollDismissesKeyboard(.interactively)
    }

    private func field(_ title: String, text: Binding<String>, field: Field) -> some View {
        TextField(title, text: text)
            .textFieldStyle(.plain)
            .padding(Spacing.md)
            .background(Palette.surface, in: .rect(cornerRadius: Radius.button))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.button)
                    .stroke(focused == field ? Palette.accent : Palette.border, lineWidth: 1)
            )
            .focused($focused, equals: field)
    }

    private func secureField(_ title: String, text: Binding<String>, field: Field) -> some View {
        SecureField(title, text: text)
            .textContentType(model.mode == .register ? .newPassword : .password)
            .padding(Spacing.md)
            .background(Palette.surface, in: .rect(cornerRadius: Radius.button))
            .overlay(
                RoundedRectangle(cornerRadius: Radius.button)
                    .stroke(focused == field ? Palette.accent : Palette.border, lineWidth: 1)
            )
            .focused($focused, equals: field)
    }
}
