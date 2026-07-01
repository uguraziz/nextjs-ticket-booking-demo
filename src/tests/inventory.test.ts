import { describe, it, expect, beforeEach } from "vitest";
import { reserveTickets } from "@/lib/inventory";
import { getEventById } from "@/lib/mock-data";

// evt-004 / tt-004-genel'i seçtik çünkü başka test dosyaları bu id'yi
// mutasyona uğratmıyor (paylaşılan mock veri üzerinde test izolasyonu
// için önemli bir detay).
const EVENT_ID = "evt-004";
const TICKET_TYPE_ID = "tt-004-genel";
const INITIAL_STOCK = 210;

function getTicketType() {
  return getEventById(EVENT_ID)?.ticketTypes.find(
    (tt) => tt.id === TICKET_TYPE_ID
  );
}

describe("reserveTickets", () => {
  // mock-data modül seviyesinde paylaşılan (mutable) bir dizi tuttuğu
  // için her testten önce stoğu bilinen başlangıç değerine resetliyoruz.
  beforeEach(() => {
    const ticketType = getTicketType();
    if (ticketType) ticketType.remainingStock = INITIAL_STOCK;
  });

  it("stok yeterliyse rezervasyonu başarıyla tamamlar ve stoktan düşer", () => {
    const result = reserveTickets(TICKET_TYPE_ID, 5);

    expect(result.status).toBe("success");
    expect(result.remainingStock).toBe(INITIAL_STOCK - 5);
    expect(getTicketType()?.remainingStock).toBe(INITIAL_STOCK - 5);
  });

  it("istenen miktar mevcut stoktan fazlaysa insufficient_stock döner ve stoğu değiştirmez", () => {
    const result = reserveTickets(TICKET_TYPE_ID, INITIAL_STOCK + 1);

    expect(result.status).toBe("insufficient_stock");
    expect(getTicketType()?.remainingStock).toBe(INITIAL_STOCK);
  });

  it("stok 0 ise sold_out döner", () => {
    const ticketType = getTicketType();
    if (ticketType) ticketType.remainingStock = 0;

    const result = reserveTickets(TICKET_TYPE_ID, 1);

    expect(result.status).toBe("sold_out");
  });

  it("olmayan bir ticketTypeId için error döner", () => {
    const result = reserveTickets("olmayan-id", 1);

    expect(result.status).toBe("error");
  });

  it("art arda gelen isteklerde toplam düşüş asla stoğu eksiye düşürmez", () => {
    // 210 stok, her biri 100 isteyen 3 istek -> en fazla 2 tanesi başarılı olabilir.
    const results = [
      reserveTickets(TICKET_TYPE_ID, 100),
      reserveTickets(TICKET_TYPE_ID, 100),
      reserveTickets(TICKET_TYPE_ID, 100),
    ];

    const successCount = results.filter((r) => r.status === "success").length;
    const finalStock = getTicketType()?.remainingStock ?? -1;

    expect(successCount).toBe(2);
    expect(finalStock).toBeGreaterThanOrEqual(0);
    expect(finalStock).toBe(INITIAL_STOCK - 200);
  });
});
