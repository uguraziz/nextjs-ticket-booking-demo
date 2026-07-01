import { NextResponse } from "next/server";
import { getEventById } from "@/lib/mock-data";

function simulateNetworkDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await simulateNetworkDelay();

  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    return NextResponse.json(
      { message: "Etkinlik bulunamadı." },
      { status: 404 }
    );
  }

  return NextResponse.json(event);
}
