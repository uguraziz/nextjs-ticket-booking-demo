import { Event } from "@/types/event";

/**
 * Gerçek bir backend'de bu veri veritabanından gelir.
 * Burada geliştirme ve test aşamasında API sözleşmesini netleştirmek
 * için elle yazılmış mock veri kullanıyoruz.
 */
export const mockEvents: Event[] = [
  {
    id: "evt-001",
    slug: "sonbahar-rock-festivali",
    title: "Sonbahar Rock Festivali",
    category: "festival",
    venue: "KüçükÇiftlik Park",
    city: "İstanbul",
    startsAt: "2026-09-12T19:00:00.000Z",
    imageUrl: "https://picsum.photos/seed/evt-001/640/360",
    description:
      "Türkiye'nin önde gelen rock gruplarını bir araya getiren iki günlük açık hava festivali.",
    priceFrom: 850,
    ticketTypes: [
      {
        id: "tt-001-genel",
        eventId: "evt-001",
        name: "Genel Giriş",
        price: 850,
        totalStock: 500,
        remainingStock: 12,
      },
      {
        id: "tt-001-vip",
        eventId: "evt-001",
        name: "VIP",
        price: 1950,
        totalStock: 100,
        remainingStock: 0,
      },
    ],
  },
  {
    id: "evt-002",
    slug: "cehov-vanya-dayi",
    title: "Vanya Dayı",
    category: "theatre",
    venue: "Zorlu PSM",
    city: "İstanbul",
    startsAt: "2026-08-03T20:00:00.000Z",
    imageUrl: "https://picsum.photos/seed/evt-002/640/360",
    description: "Çehov'un klasik eseri, usta oyuncu kadrosuyla sahnede.",
    priceFrom: 400,
    ticketTypes: [
      {
        id: "tt-002-genel",
        eventId: "evt-002",
        name: "Genel Giriş",
        price: 400,
        totalStock: 300,
        remainingStock: 87,
      },
      {
        id: "tt-002-loca",
        eventId: "evt-002",
        name: "Loca",
        price: 950,
        totalStock: 40,
        remainingStock: 5,
      },
    ],
  },
  {
    id: "evt-003",
    slug: "basketbol-derbisi",
    title: "Basketbol Süper Ligi Derbisi",
    category: "sports",
    venue: "Sinan Erdem Spor Salonu",
    city: "İstanbul",
    startsAt: "2026-07-20T18:30:00.000Z",
    imageUrl: "https://picsum.photos/seed/evt-003/640/360",
    description: "Sezonun en çok beklenen derbisi, iki rakip takım karşı karşıya.",
    priceFrom: 300,
    ticketTypes: [
      {
        id: "tt-003-genel",
        eventId: "evt-003",
        name: "Genel Giriş",
        price: 300,
        totalStock: 2000,
        remainingStock: 640,
      },
      {
        id: "tt-003-kategori1",
        eventId: "evt-003",
        name: "Kategori 1",
        price: 750,
        totalStock: 300,
        remainingStock: 2,
      },
    ],
  },
  {
    id: "evt-004",
    slug: "caz-gecesi-izmir",
    title: "Caz Gecesi",
    category: "concert",
    venue: "İzmir Kültürpark Açıkhava",
    city: "İzmir",
    startsAt: "2026-08-15T21:00:00.000Z",
    imageUrl: "https://picsum.photos/seed/evt-004/640/360",
    description: "Yerli ve yabancı caz sanatçılarının buluştuğu özel bir gece.",
    priceFrom: 500,
    ticketTypes: [
      {
        id: "tt-004-genel",
        eventId: "evt-004",
        name: "Genel Giriş",
        price: 500,
        totalStock: 400,
        remainingStock: 210,
      },
    ],
  },
];

export function getAllEvents(): Event[] {
  return mockEvents;
}

export function getEventById(id: string): Event | undefined {
  return mockEvents.find((event) => event.id === id);
}

export function getEventBySlug(slug: string): Event | undefined {
  return mockEvents.find((event) => event.slug === slug);
}
