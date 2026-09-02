import XCTest

final class LaunchUITests: XCTestCase {
    func testTabsArePresentOnLaunch() {
        let app = XCUIApplication()
        app.launch()

        XCTAssertTrue(app.tabBars.buttons["Ana Sayfa"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.tabBars.buttons["Mağaza"].exists)
        XCTAssertTrue(app.tabBars.buttons["Kategoriler"].exists)
    }
}
