import { create } from "zustand";
import { purchaseTicket, ApiError } from "@/lib/api";
import { PurchaseStatus } from "@/types/ticket";

type PurchaseFlowStatus = "idle" | "pending" | PurchaseStatus;

interface PurchaseState {
  // Kullanıcının henüz satın almadığı, seçmekte olduğu miktarlar.
  quantities: Record<string, number>;
  // Optimistic UI için: her ticketTypeId için "sunucudan yanıt gelmeden
  // önce arayüzde düşülmüş gösterilen" miktar. Satın alma başarısız
  // olursa bu değer geri alınır (rollback).
  stockAdjustments: Record<string, number>;
  // Her ticketTypeId için ayrı satın alma durumu ve mesajı — böylece
  // aynı sayfada birden fazla bilet tipi bağımsız olarak satın alınabilir.
  statuses: Record<string, PurchaseFlowStatus>;
  messages: Record<string, string | null>;

  setQuantity: (ticketTypeId: string, quantity: number) => void;
  purchase: (ticketTypeId: string) => Promise<void>;
  purchaseAll: (ticketTypeIds: string[]) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  quantities: {},
  stockAdjustments: {},
  statuses: {},
  messages: {},

  setQuantity: (ticketTypeId, quantity) =>
    set((state) => ({
      quantities: { ...state.quantities, [ticketTypeId]: quantity },
    })),

  purchase: async (ticketTypeId) => {
    const quantity = get().quantities[ticketTypeId] ?? 0;
    if (quantity <= 0) return;

    // 1) Optimistic update: kullanıcı "Satın Al" dediği anda, sunucudan
    // yanıt beklemeden stoktan düşülmüş gibi gösteriyoruz. Bu, algılanan
    // hızı artırır (kullanıcı beklemeden geri bildirim alır).
    set((state) => ({
      statuses: { ...state.statuses, [ticketTypeId]: "pending" },
      messages: { ...state.messages, [ticketTypeId]: null },
      stockAdjustments: {
        ...state.stockAdjustments,
        [ticketTypeId]: (state.stockAdjustments[ticketTypeId] ?? 0) + quantity,
      },
    }));

    try {
      const response = await purchaseTicket({ ticketTypeId, quantity });

      if (response.status !== "success") {
        // 2a) Sunucu isteği işledi ama iş kuralı gereği reddetti
        // (örn. o an başka biri son bileti aldı). Optimistic güncellemeyi
        // geri alıyoruz — rollback.
        set((state) => ({
          statuses: { ...state.statuses, [ticketTypeId]: response.status },
          messages: { ...state.messages, [ticketTypeId]: response.message },
          stockAdjustments: {
            ...state.stockAdjustments,
            [ticketTypeId]:
              (state.stockAdjustments[ticketTypeId] ?? 0) - quantity,
          },
        }));
        return;
      }

      // 2b) Başarılı: seçili miktarı sıfırla, optimistic düşüş kalıcı olsun.
      set((state) => ({
        statuses: { ...state.statuses, [ticketTypeId]: "success" },
        messages: { ...state.messages, [ticketTypeId]: response.message },
        quantities: { ...state.quantities, [ticketTypeId]: 0 },
      }));
    } catch (error) {
      // 3) Ağ hatası veya beklenmeyen sunucu hatası — rollback.
      const message =
        error instanceof ApiError
          ? error.message
          : "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";

      set((state) => ({
        statuses: { ...state.statuses, [ticketTypeId]: "error" },
        messages: { ...state.messages, [ticketTypeId]: message },
        stockAdjustments: {
          ...state.stockAdjustments,
          [ticketTypeId]:
            (state.stockAdjustments[ticketTypeId] ?? 0) - quantity,
        },
      }));
    }
  },

  // Sepetteki (miktarı > 0 olan) tüm bilet tiplerini TEK işlemde satın
  // alır. Her bir tip kendi `purchase()` çağrısı üzerinden bağımsız
  // ilerler; Promise.allSettled kullanıyoruz çünkü bir tipteki başarısızlık
  // diğerlerinin sonucunu etkilememeli (kısmi başarı senaryosu — örn.
  // "Genel Giriş" alındı ama "VIP" o an tükendi).
  purchaseAll: async (ticketTypeIds) => {
    const idsToPurchase = ticketTypeIds.filter(
      (id) => (get().quantities[id] ?? 0) > 0
    );
    await Promise.allSettled(idsToPurchase.map((id) => get().purchase(id)));
  },
}));
