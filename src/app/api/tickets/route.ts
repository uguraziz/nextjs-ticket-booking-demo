import { NextResponse } from "next/server";
import { reserveTickets } from "@/lib/inventory";
import { PurchaseRequest } from "@/types/ticket";

function simulateNetworkDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidPurchaseRequest(body: unknown): body is PurchaseRequest {
  if (typeof body !== "object" || body === null) return false;
  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.ticketTypeId === "string" &&
    typeof candidate.quantity === "number" &&
    Number.isInteger(candidate.quantity) &&
    candidate.quantity > 0
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isValidPurchaseRequest(body)) {
    return NextResponse.json(
      { status: "error", message: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  // Gecikme, stok kontrolünden ÖNCE tamamlanır — yani "ağ isteğinin
  // sunucuya ulaşması" ile "stok kontrolü + düşüş" adımlarını birbirinden
  // ayırıyoruz. reserveTickets() içinde artık await yok, dolayısıyla
  // atomiklik korunuyor (bkz. lib/inventory.ts açıklaması).
  await simulateNetworkDelay();

  const result = reserveTickets(body.ticketTypeId, body.quantity);

  // "sold_out" ve "insufficient_stock" birer HTTP hatası değil, geçerli
  // birer iş kuralı sonucudur — istek doğru işlendi, sadece talep edilen
  // işlem gerçekleştirilemedi. Bu yüzden 200 ile dönüyoruz ve ayrımı
  // response body'deki `status` alanına bırakıyoruz. Yalnızca gerçekten
  // var olmayan bir kaynağa (bilet tipi) referans verilirse 404 dönüyoruz.
  const httpStatus = result.status === "error" ? 404 : 200;
  return NextResponse.json(result, { status: httpStatus });
}
