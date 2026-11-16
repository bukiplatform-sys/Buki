# Buki mobile · 1.0.0 preview

Android ve iOS için Capacitor 8 uygulaması. Site dosyaları uygulamaya gömülür;
GitHub Pages adresini açan uzak bir WebView değildir. Sunucu, hesap ve AI sistemi aynıdır.

## Derleme
Node 22+ ile `cd mobile && npm ci`.
- Android: `npm run android`, ardından `cd android && ./gradlew assembleDebug`.
- iOS (Mac / Xcode 26+): `npm run ios`, ardından `npx cap open ios`.
- Paket kontrolleri: `npm test` (önce build).

`android/`, `ios/` ve `www/` üretilir ve depoya kaydedilmez. Yerel native değişiklikleri
kalıcı tutmak için `prepare.cjs` içine ekleyin. Bağımlılıklar package-lock.json ile sabitlenir.

GitHub Actions → Buki mobile builds → son başarılı çalışma → Artifacts:
- Buki-Android-deneme-APK: ZIP içindeki APK Android denemesi içindir.
- Buki-iOS-simulator-not-for-iPhone-install: sadece Mac simülatörü, iPhone kurulumu değildir.

## Hesap ve cihaz
Mevcut hesapla tekrar giriş gerekir. Tarayıcının localStorage verisi uygulamaya kopyalanmaz;
önce web sürümündeki değişiklikleri hesabınızla eşitleyin. İlk giriş internet gerektirir.
Yerel dersler ve çalışma kayıtları mevcut çevrimdışı kurallarını kullanır (son doğrulamadan
7 gün). AI, destek ve bulut eşitleme internet ister. 3D motor yüklenemezse mevcut sade
çizimler kullanılır. Mikrofon yalnızca konuşma kaydı başlatıldığında istenir.

Native HTTPS istekleri CapacitorHttp ile iletilir; oturum doğrulaması ve sunucu kotaları
aynen korunur. API sırları pakette yoktur. Web service worker native pakette kaydedilmez.
Güncellemeler yeni paket gerektirir. Android geri tuşu sayfanın mevcut geri düğmesini çalıştırır.

## Dağıtım sınırları
Bu bir önizleme sürümüdür; mağazada yayınlanmış değildir. Debug APK mağaza dağıtımı için
kullanılmaz ve her CI çalışmasında farklı debug imzası oluşabilir. Sonraki APK'yı yüklemek için
kaldırmak gerekirse önce hesabınızın eşitlendiğinden emin olun; kaldırma yerel verileri siler.
Kalıcı güncellemeler için sahibinin kontrolünde release keystore ve imzalı AAB gerekir.
İmza anahtarları depoya konulmamalıdır.

iPhone fiziksel cihaz / TestFlight dağıtımı için Apple geliştirme takımı ve provisioning,
App Store yayını için ayrıca mağaza hazırlığı, gizlilik beyanları, hesap silme akışının
gözden geçirilmesi ve inceleme gerekir. Bunlar bu önizleme derlemesiyle yapılmış sayılmaz.
Gerçek cihazda giriş, eşitleme, AI, mikrofon, sesli okuma, klavye ve arka plandan dönüş
kontrolleri dağıtımdan önce tamamlanmalıdır.
