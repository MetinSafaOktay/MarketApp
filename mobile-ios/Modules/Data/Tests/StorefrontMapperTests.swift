import Foundation
import Networking
import Testing
@testable import Data

struct StorefrontMapperTests {
    private let decoder = JSONDecoder.api

    @Test func storeProfileMapsAndTrimsEmptyStrings() throws {
        let json = Data("""
        {
          "id": "s1", "name": "Erenler Market", "city": "Afyonkarahisar",
          "tagline": "Taze ürünler, kapına kadar", "description": "  ",
          "logo_url": null, "cover_image_url": null,
          "phone": "+90 272 000 00 00", "address": "Erenler Mah."
        }
        """.utf8)
        let dto = try decoder.decode(StoreProfileDTO.self, from: json)
        let profile = StoreProfileMapper.map(dto)

        #expect(profile.name == "Erenler Market")
        #expect(profile.city == "Afyonkarahisar")
        #expect(profile.description == nil) // whitespace → nil
        #expect(profile.logoURL == nil)
    }

    @Test func announcementParsesFractionalISODate() throws {
        let json = Data("""
        [{ "id": "a1", "title": "İndirim", "content": "Bu hafta",
           "image_url": null, "created_at": "2026-09-02T17:29:11.131Z" }]
        """.utf8)
        let dtos = try decoder.decode([AnnouncementDTO].self, from: json)
        let announcement = AnnouncementMapper.map(dtos[0])

        #expect(announcement.title == "İndirim")
        #expect(announcement.createdAt != nil)
    }
}
