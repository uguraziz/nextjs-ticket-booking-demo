"use client";

import { TicketType } from "@/types/event";
import { usePurchaseStore } from "@/store/purchase-store";

interface CartSummaryProps {
  ticketTypes: TicketType[];
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartSummary({ ticketTypes }: CartSummaryProps) {
  const { quantities, statuses, purchaseAll } = usePurchaseStore();

  const selectedItems = ticketTypes
    .map((ticketType) => ({
      ticketType,
      quantity: quantities[ticketType.id] ?? 0,
    }))
    .filter((item) => item.quantity > 0);

  if (selectedItems.length === 0) {
    return null;
  }

  const total = selectedItems.reduce(
    (sum, item) => sum + item.ticketType.price * item.quantity,
    0
  );

  const isAnyPending = selectedItems.some(
    (item) => statuses[item.ticketType.id] === "pending"
  );

  function handlePurchaseAll() {
    purchaseAll(selectedItems.map((item) => item.ticketType.id));
  }

  return (
    <div
      role="region"
      aria-label="Sepet özeti"
      className="sticky bottom-4 mt-6 rounded-lg border border-amber-400/30 bg-neutral-900 p-4 shadow-lg shadow-black/40"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-amber-400">
        Sepet
      </p>

      <ul className="mt-2 space-y-1">
        {selectedItems.map(({ ticketType, quantity }) => (
          <li
            key={ticketType.id}
            className="flex items-center justify-between text-sm text-neutral-300"
          >
            <span>
              {quantity} × {ticketType.name}
            </span>
            <span className="font-mono">
              {formatPrice(ticketType.price * quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-dashed border-neutral-700 pt-3">
        <span className="text-sm font-medium text-neutral-200">Toplam</span>
        <span
          data-testid="cart-total"
          className="font-mono text-lg font-semibold text-neutral-50"
        >
          {formatPrice(total)}
        </span>
      </div>

      <button
        type="button"
        onClick={handlePurchaseAll}
        disabled={isAnyPending}
        className="mt-4 w-full rounded-lg bg-amber-400 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
      >
        {isAnyPending
          ? "İşleniyor..."
          : `Satın Al (${selectedItems.length} bilet tipi)`}
      </button>
    </div>
  );
}
