# Erenler Market — Android

Kotlin + Jetpack Compose müşteri uygulaması. Backend: [`../backend/`](../backend/).
iOS ([`../mobile-ios/`](../mobile-ios/)) ile birebir aynı özellikler, aynı backend.

## Stack
- **Kotlin** · **Jetpack Compose** (Material 3) · min SDK 26 / target 35
- Clean Architecture + MVVM, **Hilt** (DI)
- Async: **Coroutines + Flow / StateFlow**
- Ağ: **Retrofit + OkHttp + kotlinx.serialization** (`Authenticator` ile sessiz token yenileme)
- Görsel: **Coil** · Yerel: **Room** (son gezilenler + çevrimdışı cache), **DataStore** (token)
- Tek Activity + **Navigation Compose**, 3 sekme: Ana Sayfa · Mağaza · Kategoriler

## Kurulum
```bash
cp local.properties.example local.properties   # sdk.dir=... düzenle
./gradlew :app:assembleDebug
```

## Yapılandırma
`API_BASE_URL` build type'a göre `BuildConfig`'ten gelir:
- **debug** → `http://10.0.2.2:3000/` (emülatörün host localhost'u; cleartext açık)
- **release** → `https://backend-ruby-xi.vercel.app/`

Debug'da çalıştırmadan önce yerel backend'i ayağa kaldır:
```bash
cd ../backend && npm run start:dev
psql marketapp -f ../database/seeds/fake-data/catalog.sql
```

## Komutlar
```bash
./gradlew :app:assembleDebug        # apk
./gradlew :app:testDebugUnitTest    # unit testler
./gradlew :app:lintDebug            # lint
# emülatör: emulator -avd Pixel_7a_API_35
# adb install -r app/build/outputs/apk/debug/app-debug.apk
# adb shell am start -n com.erenlermarket.app.debug/com.erenlermarket.app.MainActivity
```

## Milestone durumu
- **A1** — iskelet (Gradle/Compose/Hilt, Retrofit/OkHttp ağ katmanı, DI,
  3 sekme bottom-nav, design system, 6 dil, adaptive icon) ✅
- **A2** — katalog (ana sayfa rafları, mağaza listesi: arama + filtre + sayfalama,
  kategori ızgarası ve kırılımı, ürün detayı + benzer ürünler) ✅
- **A3** — auth (giriş/kayıt, DataStore token deposu, OkHttp `Authenticator` ile
  sessiz 401 yenileme, açılışta oturum geri yükleme, "Hesabım" ekranı) ✅
- **A4** — ticaret (sepet + rozet, ödeme: adres + kupon önizleme + sipariş,
  sipariş listesi/detayı + iptal, istek listesi + kalp) ✅
- **A5** — mesajlaşma (5 sn poll), bildirimler (zil rozeti), ayarlar (tema,
  bildirim tercihleri, hesap silme), profil düzenleme, hakkında ✅
- A6 — Room/çevrimdışı/cila
