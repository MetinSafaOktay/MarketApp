import Domain
import Foundation
import Networking

public struct StorefrontRepositoryLive: StorefrontRepository {
    private let client: APIClient

    public init(client: APIClient) {
        self.client = client
    }

    public func storeProfile(language: String) async throws -> StoreProfile {
        let dto: StoreProfileDTO = try await client.send(
            .get("/store", query: ["lang": language])
        )
        return StoreProfileMapper.map(dto)
    }

    public func announcements(language: String) async throws -> [Announcement] {
        let dtos: [AnnouncementDTO] = try await client.send(
            .get("/announcements", query: ["lang": language])
        )
        return dtos.map(AnnouncementMapper.map)
    }
}
