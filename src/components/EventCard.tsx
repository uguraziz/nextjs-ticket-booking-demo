import Image from "next/image";
import Link from "next/link";
import { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
}

const categoryLabels: Record<Event["category"], string> = {
  concert: "Konser",
  theatre: "Tiyatro",
  sports: "Spor",
  festival: "Festival",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function EventCard({ event }: EventCardProps) {
  const totalRemaining = event.ticketTypes.reduce(
    (sum, tt) => sum + tt.remainingStock,
    0
  );
  const isSoldOut = totalRemaining === 0;
  const isLowStock = !isSoldOut && totalRemaining <= 15;

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition hover:border-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-800">
        <Image
          src={event.imageUrl}
          alt={`${event.title} etkinlik görseli`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-neutral-950/80 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-400">
          {categoryLabels[event.category]}
        </span>
      </div>

      <div className="border-t border-dashed border-neutral-700 p-3">
        <h2 className="text-base font-semibold leading-snug text-neutral-50 line-clamp-1">
          {event.title}
        </h2>
        <p className="mt-0.5 text-xs text-neutral-400 truncate">
          {event.venue} · {event.city}
        </p>
        <p className="mt-0.5 font-mono text-[10px] text-neutral-500">
          {formatDate(event.startsAt)}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-neutral-300">
            <span className="font-mono text-sm font-semibold text-neutral-50">
              {formatPrice(event.priceFrom)}
            </span>
            {" "}itibaren
          </span>

          {isSoldOut ? (
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
              Tükendi
            </span>
          ) : isLowStock ? (
            <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
              Son biletler
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
