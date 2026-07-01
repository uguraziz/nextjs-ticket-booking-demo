import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EventCard from "@/components/EventCard";
import { Event } from "@/types/event";

const baseEvent: Event = {
  id: "evt-test",
  slug: "test-etkinlik",
  title: "Test Etkinliği",
  category: "concert",
  venue: "Test Mekanı",
  city: "Test Şehri",
  startsAt: "2026-12-01T20:00:00.000Z",
  imageUrl: "https://picsum.photos/seed/test/640/360",
  description: "Bir test etkinliği açıklaması.",
  priceFrom: 500,
  ticketTypes: [
    {
      id: "tt-test",
      eventId: "evt-test",
      name: "Genel Giriş",
      price: 500,
      totalStock: 100,
      remainingStock: 50,
    },
  ],
};

describe("EventCard", () => {
  it("etkinlik başlığını, mekanı ve şehri gösterir", () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.getByText("Test Etkinliği")).toBeInTheDocument();
    expect(screen.getByText(/Test Mekanı/)).toBeInTheDocument();
    expect(screen.getByText(/Test Şehri/)).toBeInTheDocument();
  });

  it("etkinlik detay sayfasına doğru linki verir", () => {
    render(<EventCard event={baseEvent} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/events/evt-test");
  });

  it("tüm bilet tipleri tükendiğinde 'Tükendi' etiketini gösterir", () => {
    const soldOutEvent: Event = {
      ...baseEvent,
      ticketTypes: [{ ...baseEvent.ticketTypes[0], remainingStock: 0 }],
    };

    render(<EventCard event={soldOutEvent} />);

    expect(screen.getByText("Tükendi")).toBeInTheDocument();
  });

  it("stok azken 'Son biletler' etiketini gösterir", () => {
    const lowStockEvent: Event = {
      ...baseEvent,
      ticketTypes: [{ ...baseEvent.ticketTypes[0], remainingStock: 5 }],
    };

    render(<EventCard event={lowStockEvent} />);

    expect(screen.getByText("Son biletler")).toBeInTheDocument();
  });

  it("yeterli stok varken herhangi bir uyarı etiketi göstermez", () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.queryByText("Tükendi")).not.toBeInTheDocument();
    expect(screen.queryByText("Son biletler")).not.toBeInTheDocument();
  });
});
