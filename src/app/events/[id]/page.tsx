import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllEvents, getEventById } from "@/lib/mock-data";
import TicketSelector from "@/components/TicketSelector";
import CartSummary from "@/components/CartSummary";

export const revalidate = 60;

/**
 * Build zamanında bilinen tüm etkinlik id'leri için statik sayfa üretir.
 * Yeni bir etkinlik eklenirse (mock veri değişirse), ISR sayesinde ilk
 * istekte on-demand olarak da üretilebilir (dynamicParams varsayılan true).
 */
export function generateStaticParams() {
  return getAllEvents().map((event) => ({ id: event.id }));
}

const categoryLabels: Record<string, string> = {
  concert: "Konser",
  theatre: "Tiyatro",
  sports: "Spor",
  festival: "Festival",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const event = getEventById(id);

  // Sahte veya silinmiş bir id ile gelinirse Next.js'in yerleşik
  // 404 sayfasını tetikliyoruz. Gerçek uygulamada bu, veritabanında
  // kayıt bulunamadığında dönülecek standart davranıştır.
  if (!event) {
    notFound();
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-neutral-950 px-4 py-8 sm:px-6 md:px-8 lg:px-12 overflow-x-hidden">
      {/* Cam efekti için arka plan resmi */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={event.imageUrl}
          alt=""
          fill
          priority
          className="object-cover opacity-15 blur-xl pointer-events-none scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/30 via-neutral-950/80 to-neutral-950" />
      </div>

      {/* Geri Dön Butonu */}
      <div className="relative z-10 w-full max-w-5xl mb-4 self-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 transition font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 rounded px-2 py-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Geri Dön
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Sol Sütun - Etkinlik Bilgileri */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between h-full">
          <div>
            <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-neutral-800 mb-6">
              <Image
                src={event.imageUrl}
                alt={`${event.title} etkinlik görseli`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-cover"
              />
            </div>

            <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400">
              {categoryLabels[event.category]}
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl text-neutral-50">{event.title}</h1>

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
              <div className="flex gap-1.5 items-center">
                <dt className="text-neutral-500">Mekan:</dt>
                <dd>{event.venue}, {event.city}</dd>
              </div>
              <div className="flex gap-1.5 items-center">
                <dt className="text-neutral-500">Tarih:</dt>
                <dd className="font-mono text-xs">{formatDate(event.startsAt)}</dd>
              </div>
            </dl>

            <p className="mt-6 text-sm leading-relaxed text-neutral-300">
              {event.description}
            </p>
          </div>
        </div>

        {/* Sağ Sütun - Bilet Seçimi */}
        <div className="md:col-span-5 p-6 sm:p-8 border-t md:border-t-0 md:border-l border-dashed border-neutral-700/60 bg-neutral-950/30 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-100 mb-4">Bilet Seç</h2>
            <TicketSelector ticketTypes={event.ticketTypes} />
          </div>
          <div className="mt-6 border-t border-dashed border-neutral-800 pt-4">
            <CartSummary ticketTypes={event.ticketTypes} />
          </div>
        </div>
      </div>
    </main>
  );
}
