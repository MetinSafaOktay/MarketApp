// swift-tools-version: 6.0
import PackageDescription

#if TUIST
import ProjectDescription

let packageSettings = PackageSettings(
    productTypes: [
        "Nuke": .framework,
        "NukeUI": .framework,
    ]
)
#endif

let package = Package(
    name: "ErenlerMarketDependencies",
    dependencies: [
        .package(url: "https://github.com/kean/Nuke", from: "12.8.0"),
    ]
)
