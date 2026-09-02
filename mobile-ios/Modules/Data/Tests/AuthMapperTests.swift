import Foundation
import Networking
import Testing
@testable import Data

struct AuthMapperTests {
    private let decoder = JSONDecoder.api

    @Test func decodesAuthResponseAndMapsUser() throws {
        let json = Data("""
        {
          "user": {
            "id": "u1", "email": "m@example.com", "phone": null,
            "profile_name": "metin", "first_name": "Metin", "last_name": "Oktay",
            "profile_photo_url": null, "bio": null, "is_private": false,
            "role": "admin"
          },
          "accessToken": "acc", "refreshToken": "ref"
        }
        """.utf8)

        let dto = try decoder.decode(AuthResponseDTO.self, from: json)
        let user = UserMapper.map(dto.user)

        #expect(dto.accessToken == "acc")
        #expect(user.fullName == "Metin Oktay")
        #expect(user.role == .admin)
        #expect(user.email == "m@example.com")
    }

    @Test func unknownRoleFallsBackToCustomer() throws {
        let json = Data("""
        { "id": "u2", "email": null, "phone": "+90500", "profile_name": "a",
          "first_name": "A", "last_name": "B", "role": "superadmin" }
        """.utf8)
        let user = try UserMapper.map(decoder.decode(UserDTO.self, from: json))
        #expect(user.role == .customer)
        #expect(user.contactLabel == "+90500")
    }
}
