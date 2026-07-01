import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CartSummary from "@/components/CartSummary";
import { usePurchaseStore } from "@/store/purchase-store";
import { TicketType } from "@/types/event";

vi.mock("@/lib/api", () => ({
  purchaseTicket: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  },
}));

import { purchaseTicket } from "@/lib/api";

const ticketTypes: TicketType[] = [
  {
    id: "tt-genel",
    eventId: "evt-1",
    name: "Genel Giriş",
    price: 100,
    totalStock: 20,
    remainingStock: 20,
  },
  {
    id: "tt-vip",
    eventId: "evt-1",
    name: "VIP",
    price: 300,
    totalStock: 5,
    remainingStock: 5,
  },
];

function resetStore() {
  usePurchaseStore.setState({
    quantities: {},
    stockAdjustments: {},
    statuses: {},
    messages: {},
  });
}

describe("CartSummary", () => {
  beforeEach(() => {
    resetStore();
    vi.mocked(purchaseTicket).mockReset();
  });

  it("hiçbir bilet seçilmediğinde hiçbir şey render etmez", () => {
    const { container } = render(<CartSummary ticketTypes={ticketTypes} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("seçili bilet tiplerini ve doğru toplamı gösterir", () => {
    usePurchaseStore.setState({
      quantities: { "tt-genel": 2, "tt-vip": 1 },
      stockAdjustments: {},
      statuses: {},
      messages: {},
    });

    render(<CartSummary ticketTypes={ticketTypes} />);

    // 2 x 100 + 1 x 300 = 500 TRY
    expect(screen.getByText("2 × Genel Giriş")).toBeInTheDocument();
    expect(screen.getByText("1 × VIP")).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it("'Satın Al' tıklandığında sepetteki tüm bilet tiplerini satın alır", async () => {
    usePurchaseStore.setState({
      quantities: { "tt-genel": 2, "tt-vip": 1 },
      stockAdjustments: {},
      statuses: {},
      messages: {},
    });

    vi.mocked(purchaseTicket).mockImplementation(async ({ ticketTypeId }) => ({
      status: "success",
      message: `${ticketTypeId} satın alındı.`,
      remainingStock: 0,
    }));

    render(<CartSummary ticketTypes={ticketTypes} />);
    fireEvent.click(screen.getByText(/Satın Al/));

    await waitFor(() => {
      expect(purchaseTicket).toHaveBeenCalledWith({
        ticketTypeId: "tt-genel",
        quantity: 2,
      });
      expect(purchaseTicket).toHaveBeenCalledWith({
        ticketTypeId: "tt-vip",
        quantity: 1,
      });
    });
  });

  it("bir bilet tipi başarısız olsa bile diğerini etkilemez (kısmi başarı)", async () => {
    usePurchaseStore.setState({
      quantities: { "tt-genel": 2, "tt-vip": 1 },
      stockAdjustments: {},
      statuses: {},
      messages: {},
    });

    vi.mocked(purchaseTicket).mockImplementation(async ({ ticketTypeId }) => {
      if (ticketTypeId === "tt-vip") {
        return {
          status: "sold_out",
          message: "VIP bileti tükendi.",
        };
      }
      return {
        status: "success",
        message: "Genel Giriş satın alındı.",
        remainingStock: 18,
      };
    });

    render(<CartSummary ticketTypes={ticketTypes} />);
    fireEvent.click(screen.getByText(/Satın Al/));

    await waitFor(() => {
      const state = usePurchaseStore.getState();
      expect(state.statuses["tt-genel"]).toBe("success");
      expect(state.statuses["tt-vip"]).toBe("sold_out");
      // Başarılı olan sıfırlanmış, başarısız olanın miktarı korunmuş olmalı.
      expect(state.quantities["tt-genel"]).toBe(0);
      expect(state.quantities["tt-vip"]).toBe(1);
    });
  });
});
