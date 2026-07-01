export interface PurchaseRequest {
  ticketTypeId: string;
  quantity: number;
}

export type PurchaseStatus = "success" | "sold_out" | "insufficient_stock" | "error";

export interface PurchaseResponse {
  status: PurchaseStatus;
  message: string;
  remainingStock?: number;
}

export interface CartItem {
  ticketTypeId: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
}
