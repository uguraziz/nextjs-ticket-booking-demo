import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import TicketSelector from "@/components/TicketSelector";
import { usePurchaseStore } from "@/store/purchase-store";
import { TicketType } from "@/types/event";

const ticketTypes: TicketType[] = [
  {
    id: "tt-1",
    eventId: "evt-1",
    name: "Genel Giriş",
    price: 100,
    totalStock: 20,
    remainingStock: 20,
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

describe("TicketSelector", () => {
  beforeEach(() => {
    resetStore();
  });

  it("miktar + / - butonlarıyla artırılıp azaltılabilir", () => {
    render(<TicketSelector ticketTypes={ticketTypes} />);

    const increment = screen.getByLabelText("Genel Giriş miktarını artır");
    const decrement = screen.getByLabelText("Genel Giriş miktarını azalt");

    fireEvent.click(increment);
    fireEvent.click(increment);
    expect(screen.getByText("2")).toBeInTheDocument();

    fireEvent.click(decrement);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("miktar, mevcut stoktan fazla artırılamaz", () => {
    const limitedStock: TicketType[] = [
      { ...ticketTypes[0], remainingStock: 2 },
    ];
    render(<TicketSelector ticketTypes={limitedStock} />);

    const increment = screen.getByLabelText("Genel Giriş miktarını artır");
    fireEvent.click(increment);
    fireEvent.click(increment);
    fireEvent.click(increment); // 3. tıklama stoktan fazla, etkisiz kalmalı

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("stok tükendiğinde miktar seçicisi yerine 'Mevcut değil' gösterir", () => {
    const soldOut: TicketType[] = [{ ...ticketTypes[0], remainingStock: 0 }];
    render(<TicketSelector ticketTypes={soldOut} />);

    expect(screen.getByText("Mevcut değil")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Genel Giriş miktarını artır")
    ).not.toBeInTheDocument();
  });

  it("store'da bir mesaj varsa satır altında gösterir", () => {
    usePurchaseStore.setState({
      quantities: {},
      stockAdjustments: {},
      statuses: { "tt-1": "success" },
      messages: { "tt-1": "1 adet bilet rezerve edildi." },
    });

    render(<TicketSelector ticketTypes={ticketTypes} />);

    expect(screen.getByText("1 adet bilet rezerve edildi.")).toBeInTheDocument();
  });
});
