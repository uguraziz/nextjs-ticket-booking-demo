import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/mock-data";

/**
 * Gerçek bir ağ isteğini simüle etmek için küçük bir gecikme ekliyoruz.
 * Bu sayede UI'da loading state'leri gerçekçi şekilde test edilebiliyor
 * (mock veri anlık dönerse "yükleniyor" state'ini hiç göremeyiz).
 */
function simulateNetworkDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET() {
  await simulateNetworkDelay();

  const events = getAllEvents();
  return NextResponse.json(events);
}
