import Domain
import Foundation

// Anahtarlar JSONDecoder.api (.convertFromSnakeCase) ile eşlenir.

struct UserDTO: Decodable, Sendable {
    let id: String
    let email: String?
    let phone: String?
    let profileName: String
    let firstName: String
    let lastName: String
    let profilePhotoURL: String?
    let bio: String?
    let isPrivate: Bool?
    let role: String?

    private enum CodingKeys: String, CodingKey {
        case id, email, phone, profileName, firstName, lastName, bio, isPrivate, role
        case profilePhotoURL = "profilePhotoUrl"
    }
}

struct AuthResponseDTO: Decodable, Sendable {
    let user: UserDTO
    let accessToken: String
    let refreshToken: String
}

struct TokensDTO: Decodable, Sendable {
    let accessToken: String
    let refreshToken: String
}

enum UserMapper {
    static func map(_ dto: UserDTO) -> User {
        User(
            id: dto.id,
            email: dto.email,
            phone: dto.phone,
            profileName: dto.profileName,
            firstName: dto.firstName,
            lastName: dto.lastName,
            photoURL: dto.profilePhotoURL.flatMap(URL.init(string:)),
            bio: dto.bio,
            isPrivate: dto.isPrivate ?? false,
            role: dto.role == "admin" ? .admin : .customer
        )
    }
}

/// register gövdesi: backend snake_case bekler (`profile_name` vb.),
/// bu yüzden JSONEncoder.api (.convertToSnakeCase) ile kodlanır.
struct RegisterBody: Encodable {
    let email: String
    let password: String
    let profileName: String
    let firstName: String
    let lastName: String
}

struct LoginBody: Encodable {
    let email: String
    let password: String
}
