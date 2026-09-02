# Erenler Market — iOS

SwiftUI müşteri uygulaması. Backend: [`../backend/`](../backend/).

## Stack
- **iOS 17+** · **Swift 6** (strict concurrency) · %100 SwiftUI
- State: `@Observable` (Observation) + Swift Concurrency (Combine yok)
- Mimari: Clean Architecture + MVVM, constructor injection
- **Tuist** ile modüler (yerel Swift Package / framework target'ları)
- **Nuke** — uzak görsel yükleme
- **SwiftData** — son görüntülenen ürünler + katalog cache (M6)

## Modüller
```
Modules/
  Domain/       # entity + repository protokolleri (SwiftUI import EDEMEZ)
  Data/         # repository impl + DTO + mapper
  Networking/   # APIClient, Endpoint, APIError, Keychain, token refresh
  DesignSystem/ # renk/tipografi token, RemoteImage, ortak bileşenler
App/            # feature ekranları + kompozisyon kökü
```

## Kurulum
```bash
brew install tuist swiftlint swiftformat
cd mobile-ios
tuist install          # SPM bağımlılıkları (Nuke)
tuist generate         # .xcodeproj/.xcworkspace üretir (gitignore'da)
open ErenlerMarket.xcworkspace
```

## Yapılandırma
`Config/{Debug,Release}.xcconfig` içindeki `API_BASE_URL` → Info.plist `APIBaseURL`.
- **Debug** → `http://localhost:3000` (yerel backend; `NSAllowsLocalNetworking` ile HTTP açık)
- **Release** → `https://backend-ruby-xi.vercel.app`

Debug'da çalıştırmadan önce backend'i ayağa kaldır ve katalog seed'ini uygula:
```bash
cd ../backend && npm run start:dev
psql marketapp -f ../database/seeds/fake-data/catalog.sql   # showcase katalog
```
Prod veritabanı boşsa aynı `catalog.sql`'i Supabase SQL Editor'da çalıştır.

## Komutlar
```bash
tuist generate
xcodebuild -workspace ErenlerMarket.xcworkspace -scheme ErenlerMarket \
  -destination 'platform=iOS Simulator,name=iPhone 17' build
swiftlint
swiftformat --lint .
```

## Milestone durumu
- **M1** — iskelet (Tuist + 4 modül + 3-tab shell) ✅
- **M2** — networking + katalog: Ana Sayfa (hero + duyuru + raflar), Mağaza
  (arama + filtre + sayfalama), Kategoriler grid, Ürün detay (galeri + benzerler) ✅
- **M3** — auth: giriş/kayıt formu, Keychain'de token, açılışta oturum geri
  yükleme, 401'de sessiz yenileme, Hesabım ekranı ✅
- M4 — sepet/ödeme/sipariş · M5 — mesaj/bildirim/ayarlar · M6 — SwiftData/cila
