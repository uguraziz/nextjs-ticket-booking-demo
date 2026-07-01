# Booking Event

Bilet/rezervasyon satış akışını konu alan, mülakat hazırlığı amacıyla
geliştirilmiş bir mini uygulama. Etkinlik listeleme, koltuk/bilet seçimi
ve satın alma akışını; yüksek trafikli bir bilet sistemine uygun
pratiklerle (performans, erişilebilirlik, eşzamanlı stok yönetimi)
gösterir.

## Özellikler

- Etkinlik listesi ve detay sayfaları (ISR + SSG)
- Bilet tipi seçimi, miktar kontrolü, stok durumu gösterimi
- Satın alma akışı: optimistic UI güncellemesi + hata durumunda rollback
- **Atomik stok rezervasyonu** — eşzamanlı satın alma isteklerinde
  overselling (stoğun eksiye düşmesi) engellenir
- Vitest + React Testing Library ile test kapsamı

## Teknoloji Yığını

- [Next.js](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS v4
- [Zustand](https://github.com/pmndrs/zustand) — client-side state yönetimi
- [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/react)

## Kurulum

```bash
npm install
npm run dev
```

Ardından [http://localhost:3000](http://localhost:3000) adresini aç.

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production build |
| `npm run start` | Production sunucusu (build sonrası) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (tek seferlik) |
| `npm run test:watch` | Vitest watch modu |
| `npm run test:e2e` | Playwright uçtan uca testler (önce `npx playwright install` gerekir) |

## Proje Yapısı

Ayrıntılı mimari kararlar ve konvansiyonlar için [`AGENTS.md`](./AGENTS.md)
dosyasına bakınız.

```
src/
  app/
    page.tsx                  Etkinlik listesi (ISR)
    events/[id]/page.tsx      Etkinlik detay + bilet seçimi (SSG)
    api/
      events/                 Etkinlik listesi (GET)
      events/[id]/            Tekil etkinlik (GET)
      tickets/                Satın alma (POST)
  components/                 EventCard, TicketSelector, CartSummary
  lib/                        mock-data, inventory (atomik stok), api (fetch)
  store/                      Zustand — satın alma state'i
  types/                      Paylaşılan TypeScript tipleri
  tests/                      Vitest testleri
e2e/                          Playwright uçtan uca testleri
```

## Veri Modeli

Bu proje bir backend'e bağlı değildir; `src/lib/mock-data.ts` içindeki
bellek içi veri, gerçek bir veritabanının yerini tutar. Satın alma
işlemleri bu veriyi mutasyona uğratır (sunucu yeniden başlatılınca
sıfırlanır).

## Neden Bu Proje?

Bu proje bir iş mülakatına hazırlık amacıyla geliştirilmiştir; amaç
üretim ortamına çıkacak bir uygulama değil, gerçekçi bir bilet satış
senaryosu üzerinden (performans, state yönetimi, eşzamanlılık, test)
konularında pratik yapmaktır.
