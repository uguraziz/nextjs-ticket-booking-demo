import { getAllEvents } from "@/lib/mock-data";
import { PurchaseResponse } from "@/types/ticket";

/**
 * NOT: Bu modül gerçek bir veritabanı yerine bellek içi (in-memory) bir
 * stok kaydı olarak çalışır. mockEvents dizisindeki ticketType nesneleri
 * doğrudan mutasyona uğratılır, böylece "satın alma" işlemleri sunucu
 * ayakta kaldığı sürece kalıcı olur (sunucu yeniden başlatılınca stoklar
 * orijinal haline döner). Production'da bunun yerine bir veritabanı
 * transaction'ı veya optimistic locking kullanılır — burada amaç, stok
 * azaltma mantığının *atomikliğini* göstermektir.
 */

function findTicketType(ticketTypeId: string) {
  for (const event of getAllEvents()) {
    const ticketType = event.ticketTypes.find((tt) => tt.id === ticketTypeId);
    if (ticketType) return ticketType;
  }
  return undefined;
}

/**
 * Bilet rezervasyonunu ATOMİK şekilde yapar: "stok yeterli mi kontrol et"
 * ve "stoktan düş" adımları arasında hiçbir `await` yoktur.
 *
 * Bu önemli, çünkü Node.js tek thread'li olsa da async/await ile yazılmış
 * kod, aralarda bir `await` varsa iki eşzamanlı istek arasında yer
 * değiştirebilir (interleave). Hatalı (race condition'a açık) bir örnek:
 *
 *   const current = await getStockFromDb(id);      // (A) oku
 *   await simulateDelay();                          // <- burada başka bir
 *                                                     //    istek araya girebilir
 *   if (current >= quantity) {
 *     await writeStockToDb(id, current - quantity); // (B) yaz
 *   }
 *
 * İki eşzamanlı istek de (A) adımında yeterli stok görüp ikisi de (B)
 * adımında düşüş yapabilir → stok eksiye düşer (overselling).
 *
 * Aşağıdaki fonksiyon bu riski taşımaz: kontrol + güncelleme senkron
 * (aralarında await olmadan) tek bir bloktadır, bu yüzden JavaScript'in
 * event loop'u iki çağrıyı asla iç içe geçiremez.
 */
export function reserveTickets(
  ticketTypeId: string,
  quantity: number
): PurchaseResponse {
  const ticketType = findTicketType(ticketTypeId);

  if (!ticketType) {
    return { status: "error", message: "Bilet tipi bulunamadı." };
  }

  if (ticketType.remainingStock === 0) {
    return { status: "sold_out", message: "Bu bilet tipi tükendi." };
  }

  if (quantity > ticketType.remainingStock) {
    return {
      status: "insufficient_stock",
      message: `Yeterli stok yok. Kalan: ${ticketType.remainingStock}`,
      remainingStock: ticketType.remainingStock,
    };
  }

  // Kontrol + düşüş burada, aralarında await olmadan gerçekleşiyor.
  ticketType.remainingStock -= quantity;

  return {
    status: "success",
    message: `${quantity} adet "${ticketType.name}" bileti rezerve edildi.`,
    remainingStock: ticketType.remainingStock,
  };
}
