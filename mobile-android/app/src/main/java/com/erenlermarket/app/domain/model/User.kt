package com.erenlermarket.app.domain.model

enum class UserRole { CUSTOMER, ADMIN }

/** Oturum açmış kullanıcı. */
data class User(
    val id: String,
    val email: String?,
    val phone: String?,
    val profileName: String,
    val firstName: String,
    val lastName: String,
    val photoUrl: String?,
    val bio: String?,
    val isPrivate: Boolean,
    val role: UserRole,
) {
    val fullName: String get() = "$firstName $lastName".trim()

    /** E-posta yoksa telefon, o da yoksa profil adı. */
    val contactLabel: String get() = email ?: phone ?: profileName
}
