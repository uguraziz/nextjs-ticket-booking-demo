import { getAllEvents } from "@/lib/mock-data";
import EventCard from "@/components/EventCard";

/**
 * ISR (Incremental Static Regeneration): Bu sayfa build anında statik
 * olarak üretilir, ardından her 60 saniyede bir arka planda yeniden
 * üretilir. Kullanıcılar hep hızlı statik HTML görür, veri de çok eski
 * kalmaz. Bilet sitesi için makul bir denge: stok anlık değişse de
 * "hangi etkinlikler var" bilgisi saniyeler içinde değişmez.
 */
export const revalidate = 60;

export default async function HomePage() {
  const events = await getAllEvents();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-dashed border-neutral-700 px-6 py-10 sm:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400">
          Booking Event
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Yaklaşan Etkinlikler
        </h1>
        <p className="mt-2 max-w-xl text-sm text-neutral-400">
          Konser, tiyatro, spor ve festival biletlerini keşfet.
        </p>
      </header>

      <section
        aria-label="Etkinlik listesi"
        className="grid grid-cols-1 gap-4 px-6 py-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:px-10"
      >
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </main>
  );
}
