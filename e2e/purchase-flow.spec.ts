import { test, expect } from "@playwright/test";

test.describe("Etkinlik listesi", () => {
  test("ana sayfa etkinlikleri listeler ve detay sayfasına yönlendirir", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Yaklaşan Etkinlikler" })).toBeVisible();

    // İlk etkinlik kartına tıkla.
    const firstCard = page.getByRole("link").first();
    await firstCard.click();

    // Detay sayfasında "Bilet Seç" bölümü görünmeli.
    await expect(page.getByRole("heading", { name: "Bilet Seç" })).toBeVisible();
  });
});

test.describe("Satın alma akışı", () => {
  // evt-004 (Caz Gecesi) tek bilet tipine sahip ve stoğu yüksek (210),
  // bu yüzden testlerde stok tükenme riski olmadan güvenle kullanılabilir.
  test.beforeEach(async ({ page }) => {
    await page.goto("/events/evt-004");
  });

  test("miktar artırılınca sepet özeti belirir ve toplamı doğru hesaplar", async ({
    page,
  }) => {
    // Sepet, hiçbir şey seçilmeden önce görünmemeli.
    await expect(page.getByRole("region", { name: "Sepet özeti" })).toHaveCount(0);

    await page.getByLabel("Genel Giriş miktarını artır").click();
    await page.getByLabel("Genel Giriş miktarını artır").click();

    const cart = page.getByRole("region", { name: "Sepet özeti" });
    await expect(cart).toBeVisible();
    await expect(cart.getByText("2 × Genel Giriş")).toBeVisible();
    // Etkinliğin fiyatı 500 TRY -> 2 adet = 1.000 TRY.
    // Not: satır fiyatı ve genel toplam bu senaryoda tesadüfen aynı
    // değere denk geliyor (tek kalem, 2x500=1000), bu yüzden genel
    // toplamı `data-testid` ile ayırt ediyoruz — aksi halde Playwright
    // "strict mode violation" verir (birden fazla eşleşme).
    await expect(cart.getByTestId("cart-total")).toHaveText(/1\.000/);
  });

  test("sepetten satın alma tamamlanınca başarı mesajı gösterir", async ({
    page,
  }) => {
    await page.getByLabel("Genel Giriş miktarını artır").click();

    const cart = page.getByRole("region", { name: "Sepet özeti" });
    await cart.getByRole("button", { name: /Satın Al/ }).click();

    // Satın alma API'si ~400ms gecikmeli yanıt veriyor (bkz. route.ts),
    // bu yüzden başarı mesajını beklerken makul bir timeout kullanıyoruz.
    await expect(page.getByText(/rezerve edildi/)).toBeVisible({
      timeout: 5000,
    });

    // Başarılı satın alma sonrası sepet kaybolmalı (miktar sıfırlandığı için).
    await expect(cart).toHaveCount(0);
  });
});
