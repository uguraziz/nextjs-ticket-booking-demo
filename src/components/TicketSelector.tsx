"use client";

import { TicketType } from "@/types/event";
import { usePurchaseStore } from "@/store/purchase-store";

interface TicketSelectorProps {
  ticketTypes: TicketType[];
}

const MAX_QUANTITY_PER_TYPE = 8;

const statusStyles: Record<string, string> = {
  success: "text-green-400",
  sold_out: "text-neutral-400",
  insufficient_stock: "text-amber-400",
  error: "text-red-400",
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Bu bileşen artık yalnızca MİKTAR SEÇİMİNDEN sorumlu. Satın alma işlemi
 * (tüm seçili bilet tiplerini tek seferde onaylama) `CartSummary`
 * bileşenine taşındı — gerçek bir bilet sitesinde kullanıcı genelde
 * birden fazla bilet tipini aynı anda sepete atıp tek işlemde öder.
 * Her satırda o bilet tipine ait son işlem sonucu (varsa) yine burada
 * gösteriliyor, çünkü kullanıcı hangi satırın etkilendiğini görmeli.
 */
export default function TicketSelector({ ticketTypes }: TicketSelectorProps) {
  const { quantities, stockAdjustments, statuses, messages, setQuantity } =
    usePurchaseStore();

  return (
    <div className="mt-4 space-y-3">
      {ticketTypes.map((ticketType) => {
        const adjustment = stockAdjustments[ticketType.id] ?? 0;
        const displayedStock = Math.max(
          ticketType.remainingStock - adjustment,
          0
        );

        const isSoldOut = displayedStock === 0;
        const isLowStock = !isSoldOut && displayedStock <= 15;
        const maxSelectable = Math.min(displayedStock, MAX_QUANTITY_PER_TYPE);
        const quantity = quantities[ticketType.id] ?? 0;
        const status = statuses[ticketType.id];
        const message = messages[ticketType.id];
        const isPending = status === "pending";

        function updateQuantity(delta: number) {
          const next = Math.min(Math.max(quantity + delta, 0), maxSelectable);
          setQuantity(ticketType.id, next);
        }

        return (
          <div
            key={ticketType.id}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-50">{ticketType.name}</p>
                <p className="mt-0.5 font-mono text-sm text-neutral-400">
                  {formatPrice(ticketType.price)}
                </p>
                {isSoldOut ? (
                  <p className="mt-1 text-xs font-medium text-neutral-500">
                    Tükendi
                  </p>
                ) : isLowStock ? (
                  <p className="mt-1 text-xs font-medium text-amber-400">
                    Son {displayedStock} bilet
                  </p>
                ) : null}
              </div>

              {isSoldOut ? (
                <span className="rounded-md bg-neutral-800 px-3 py-1.5 text-sm text-neutral-500">
                  Mevcut değil
                </span>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(-1)}
                    disabled={quantity === 0 || isPending}
                    aria-label={`${ticketType.name} miktarını azalt`}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-700 text-neutral-200 transition hover:border-amber-400 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    −
                  </button>
                  <span
                    className="w-4 text-center font-mono text-sm tabular-nums"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(1)}
                    disabled={quantity >= maxSelectable || isPending}
                    aria-label={`${ticketType.name} miktarını artır`}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-700 text-neutral-200 transition hover:border-amber-400 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {message && (
              <p
                role="status"
                aria-live="polite"
                className={`mt-2 text-xs font-medium ${statusStyles[status ?? ""] ?? "text-neutral-400"}`}
              >
                {message}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
