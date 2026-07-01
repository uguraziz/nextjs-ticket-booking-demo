<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Proje Kuralları (Booking Event)

Bu dosya, bu repo üzerinde çalışan AI kod asistanları (Claude Code dahil) için
proje konvansiyonlarını ve beklentilerini tanımlar. İnsan katkıcılar için de
geçerli bir referanstır.

## Proje Amacı

Bilet/rezervasyon satış akışını konu alan bir mini uygulama. Amaç; etkinlik
listeleme, koltuk/bilet seçimi ve satın alma akışını, yüksek trafikli bir
e-ticaret/bilet sistemine uygun pratiklerle (performans, erişilebilirlik,
race condition yönetimi) göstermek. Bu proje bir iş mülakatına hazırlık
amacıyla geliştiriliyor; kod kalitesi ve gerekçelendirilebilir mimari
kararlar, "çalışıyor olmak"tan daha önemli.

## Teknoloji Yığını

- Next.js (App Router) — yukarıdaki uyarıya göre sürüme özgü API
  farklılıkları olabilir, emin olmadığın yerde `node_modules/next/dist/docs/`
  kontrol et.
- TypeScript (strict mode açık)
- Tailwind CSS v4
- Zustand (client state)
- Vitest + React Testing Library (test)
- (Planlanan) Next.js Route Handler'ları ile sahte REST API — `src/app/api/`

## Komutlar

```bash
npm run dev          # geliştirme sunucusu
npm run build         # production build
npm run lint          # eslint
npm run typecheck     # tsc --noEmit
npm run test          # vitest (tek seferlik)
npm run test:watch    # vitest watch modu
```

Bir görev tamamlandığında **lint, typecheck ve test** komutlarının hepsinin
hatasız geçmesi beklenir. Herhangi biri kırmızıysa görev bitmiş sayılmaz.

## Kod Konvansiyonları

- **Bileşenler**: Fonksiyonel bileşen, `PascalCase.tsx`. Tek sorumluluk
  ilkesine uy; bir bileşen 150 satırı geçiyorsa bölmeyi düşün.
- **Tipler**: `any` kullanma. API yanıtları için `src/types/` altında
  açık tip tanımları olsun (bkz. `event.ts`, `ticket.ts`).
- **State**: Lokal UI state için `useState`, sayfalar arası paylaşılan
  sepet/satın alma state'i için Zustand store (`src/store/`).
- **Veri çekme**: Server Component'lerde doğrudan fetch, client-side
  etkileşim gerekiyorsa `lib/api.ts` üzerinden.
- **Stil**: Sadece Tailwind utility class'ları. Custom CSS son çare.
- **Erişilebilirlik**: Tüm interaktif elemanlar klavye ile ulaşılabilir
  olmalı, anlamlı `aria-*` etiketleri kullanılmalı, görsellerde `alt` zorunlu.
- **Commit mesajları**: Konvansiyonel commit formatı tercih edilir
  (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`).

## Mimari Kararlar

- **Rendering stratejisi**: Etkinlik listesi ISR (`revalidate` ile) sunulur;
  etkinlik detay sayfaları da ISR, ama satın alma anındaki stok bilgisi
  client-side'da taze tutulur (cache'lenmiş sayfa + canlı veri ayrımı
  kasıtlıdır, mülakatta anlatılabilecek bir karar).
- **Race condition simülasyonu**: `app/api/tickets` route handler'ı kasıtlı
  olarak eşzamanlı isteklerde stok çakışmasını simüle eder; UI optimistic
  update yapıp hata durumunda geri alır (rollback).
- **Başarısız satın alma sonrası seçim**: `insufficient_stock` gibi bir
  hata durumunda seçilen miktar SIFIRLANMAZ (yalnızca optimistic stok
  düşüşü geri alınır). Kullanıcı miktarı azaltıp tekrar deneyebilsin diye
  bilinçli bir tercih. Sadece `success` durumunda miktar sıfırlanır.
- **Sepet/checkout orkestrasyonu**: `CartSummary`, sepetteki tüm bilet
  tiplerini `purchaseAll()` ile TEK kullanıcı eylemiyle satın alır.
  Store içinde `Promise.allSettled` kullanılır (Promise.all DEĞİL) çünkü
  bir bilet tipinin başarısız olması (örn. o an tükenmesi) diğerlerinin
  satın alınmasını engellememeli — kısmi başarı gerçek bir sonuçtur,
  hata değildir.
- **Test stratejisi**: Bileşenler için davranış odaklı testler (React
  Testing Library, implementasyon detayına değil kullanıcı etkileşimine
  odaklan). API route'ları için entegrasyon testleri.

## Yapılmaması Gerekenler

- `localStorage`/`sessionStorage` varsayımıyla kod yazma — Next.js'te
  server/client ayrımına dikkat et, tarayıcı API'lerine doğrudan güvenme.
- Gereksiz üçüncü parti kütüphane ekleme; mevcut yığınla çözülebilen bir
  şeyi yeni bağımlılıkla çözme.
- Test yazmadan "tamamlandı" deme.

## Dosya Yapısı Özeti

```
src/
  app/            -> route'lar, layout'lar, API route handler'ları
    api/
      events/         -> mock etkinlik verisi (GET liste)
      events/[id]/    -> tekil etkinlik (GET, REST path param)
      tickets/        -> satın alma (POST), atomik stok kontrolü
    events/[id]/  -> etkinlik detay + bilet seçim sayfası (SSG)
  components/     -> yeniden kullanılabilir UI bileşenleri
    EventCard.tsx      -> liste sayfasındaki etkinlik kartı
    TicketSelector.tsx -> bilet tipi + miktar seçimi (client component)
    CartSummary.tsx    -> sepet özeti + toplu satın alma (client component)
  lib/            -> yardımcı fonksiyonlar
    mock-data.ts    -> mock etkinlik/bilet verisi (in-memory "DB")
    inventory.ts    -> atomik stok rezervasyon mantığı
    api.ts          -> client tarafı fetch wrapper'ları
  store/
    purchase-store.ts -> Zustand — seçim, satın alma durumu, optimistic update
  types/          -> paylaşılan TypeScript tipleri (event.ts, ticket.ts)
  tests/          -> Vitest testleri + test setup
```

## Mevcut Durum

- [x] Proje iskeleti (Next.js + TS + Tailwind + Vitest) kuruldu.
- [x] `types/event.ts`, `types/ticket.ts` tanımlandı.
- [x] Mock veri (`lib/mock-data.ts`) ve `api/events`, `api/events/[id]` route'ları.
- [x] `EventCard` bileşeni ve ana liste sayfası (ISR, `revalidate = 60`).
- [x] Etkinlik detay sayfası (SSG + `generateStaticParams`) + `TicketSelector`.
- [x] Zustand store (`store/purchase-store.ts`) — optimistic update + rollback.
- [x] `api/tickets` route'u + atomik stok rezervasyonu (`lib/inventory.ts`).
- [x] Race condition koruması doğrulandı (10 eşzamanlı istekte overselling yok).
- [x] Testler: `inventory.test.ts`, `EventCard.test.tsx`, `TicketSelector.test.tsx` (15 test, hepsi geçiyor).
- [x] Sepet/checkout akışı (`CartSummary.tsx`) — birden fazla bilet tipi
      tek işlemde satın alınabiliyor, `Promise.allSettled` ile kısmi
      başarı senaryosu (bir tip başarısız olsa da diğerini etkilemez)
      destekleniyor.
- [x] E2E test altyapısı (Playwright) kuruldu — `e2e/purchase-flow.spec.ts`
      liste → detay → bilet seç → satın al akışını uçtan uca test ediyor.
      NOT: Bu geliştirme ortamında tarayıcı ikili dosyaları network
      kısıtlaması nedeniyle indirilemedi (`npx playwright install`
      normal bir internet bağlantısıyla çalışır); testler yazıldı ve
      hazır ama bu ortamda fiilen koşturulamadı.
- [x] README.md projeye özel içerikle güncellendi.
