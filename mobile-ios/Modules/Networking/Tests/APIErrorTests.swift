import Testing
@testable import Networking

struct APIErrorTests {
    @Test func unauthorizedDetection() {
        #expect(APIError.http(status: 401, message: "x").isUnauthorized)
        #expect(APIError.unauthenticated.isUnauthorized)
        #expect(!APIError.http(status: 500, message: "x").isUnauthorized)
    }

    @Test func forbiddenDetection() {
        #expect(APIError.http(status: 403, message: "x").isForbidden)
        #expect(!APIError.http(status: 401, message: "x").isForbidden)
    }

    @Test func displayMessageUsesServerText() {
        #expect(APIError.http(status: 400, message: "Kupon geçersiz")
            .displayMessage == "Kupon geçersiz")
    }
}

struct EndpointTests {
    @Test func getBuildsQuery() {
        let endpoint = Endpoint.get("/products", query: ["lang": "en", "page": "2"])
        #expect(endpoint.method == .get)
        #expect(endpoint.query["lang"] == "en")
        #expect(endpoint.requiresAuth == false)
    }
}
