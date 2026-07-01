export type EventCategory = "concert" | "theatre" | "sports" | "festival";

export interface Event {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  venue: string;
  city: string;
  startsAt: string; // ISO date string
  imageUrl: string;
  description: string;
  priceFrom: number; // TRY
  ticketTypes: TicketType[];
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string; // "Genel Giriş", "VIP", "Loca" vb.
  price: number;
  totalStock: number;
  remainingStock: number;
}
