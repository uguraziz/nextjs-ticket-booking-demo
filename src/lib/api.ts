import { Event } from "@/types/event";
import { PurchaseRequest, PurchaseResponse } from "@/types/ticket";

/**
 * Ortak hata tipi. API'den dönen hata mesajını normalize ederek
 * çağıran kodun (component) her yerde aynı şekilde yakalayabilmesini
 * sağlıyoruz.
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body?.message ?? `İstek başarısız oldu (HTTP ${response.status}).`;
    throw new ApiError(message, response.status);
  }
  return response.json() as Promise<T>;
}

export async function fetchEvents(): Promise<Event[]> {
  const response = await fetch("/api/events");
  return handleResponse<Event[]>(response);
}

export async function fetchEventById(id: string): Promise<Event> {
  const response = await fetch(`/api/events/${id}`);
  return handleResponse<Event>(response);
}

export async function purchaseTicket(
  request: PurchaseRequest
): Promise<PurchaseResponse> {
  const response = await fetch("/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<PurchaseResponse>(response);
}
