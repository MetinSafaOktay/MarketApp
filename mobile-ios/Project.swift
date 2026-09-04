import ProjectDescription

// MARK: - Sabitler

let appName = "ErenlerMarket"
let bundleIdBase = "com.erenlermarket.app"
let deploymentTargets: DeploymentTargets = .iOS("17.0")
let destinations: Destinations = [.iPhone]

// MARK: - Modül fabrikası

/// Bir framework modülü + test target'ı üretir.
/// `Modules/<name>/Sources/**` ve `Modules/<name>/Tests/**` beklenir.
func module(
    _ name: String,
    dependencies: [TargetDependency] = []
) -> [Target] {
    [
        .target(
            name: name,
            destinations: destinations,
            product: .framework,
            bundleId: "\(bundleIdBase).\(name.lowercased())",
            deploymentTargets: deploymentTargets,
            sources: ["Modules/\(name)/Sources/**"],
            dependencies: dependencies,
            settings: .settings(base: ["SWIFT_STRICT_CONCURRENCY": "complete"])
        ),
        .target(
            name: "\(name)Tests",
            destinations: destinations,
            product: .unitTests,
            bundleId: "\(bundleIdBase).\(name.lowercased()).tests",
            deploymentTargets: deploymentTargets,
            sources: ["Modules/\(name)/Tests/**"],
            dependencies: [.target(name: name)]
        )
    ]
}

// MARK: - Proje

let project = Project(
    name: appName,
    settings: .settings(
        base: ["SWIFT_VERSION": "6.0"],
        configurations: [
            .debug(name: "Debug", xcconfig: "Config/Debug.xcconfig"),
            .release(name: "Release", xcconfig: "Config/Release.xcconfig")
        ]
    ),
    targets: [
        .target(
            name: appName,
            destinations: destinations,
            product: .app,
            bundleId: bundleIdBase,
            deploymentTargets: deploymentTargets,
            infoPlist: .extendingDefault(with: [
                "CFBundleDisplayName": "Erenler Market",
                "UILaunchScreen": ["UIColorName": "BrandBackground"],
                "UISupportedInterfaceOrientations": ["UIInterfaceOrientationPortrait"],
                "ITSAppUsesNonExemptEncryption": false,
                "APIBaseURL": "$(API_BASE_URL)",
                "CFBundleLocalizations": ["tr", "en", "de", "fr", "ar", "nl"],
                "CFBundleDevelopmentRegion": "tr",
                "NSLocationWhenInUseUsageDescription":
                    "Teslimat adresinizi haritadan işaretlemek için konumunuz kullanılır.",
                // Debug'da yerel HTTP backend'e izin ver (loopback/.local ile sınırlı).
                "NSAppTransportSecurity": ["NSAllowsLocalNetworking": true]
            ]),
            sources: ["App/Sources/**"],
            resources: ["App/Resources/**"],
            dependencies: [
                .target(name: "DesignSystem"),
                .target(name: "Networking"),
                .target(name: "Domain"),
                .target(name: "Data")
            ],
            settings: .settings(base: ["SWIFT_STRICT_CONCURRENCY": "complete"])
        ),
        .target(
            name: "\(appName)Tests",
            destinations: destinations,
            product: .unitTests,
            bundleId: "\(bundleIdBase).tests",
            deploymentTargets: deploymentTargets,
            sources: ["App/Tests/**"],
            dependencies: [.target(name: appName)]
        ),
        .target(
            name: "\(appName)UITests",
            destinations: destinations,
            product: .uiTests,
            bundleId: "\(bundleIdBase).uitests",
            deploymentTargets: deploymentTargets,
            sources: ["App/UITests/**"],
            dependencies: [.target(name: appName)]
        )
    ]
        + module("DesignSystem", dependencies: [.external(name: "NukeUI")])
        + module("Networking")
        + module("Domain")
        + module("Data", dependencies: [
            .target(name: "Domain"),
            .target(name: "Networking")
        ])
)
