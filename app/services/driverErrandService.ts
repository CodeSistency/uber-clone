import { fetchAPI } from "@/lib/fetch";

export const driverErrandService = {
  accept: async (id: number, idempotencyKey?: string) => {
    return fetchAPI(`rides/flow/driver/errand/${id}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  updateShopping: async (id: number, itemsCost: number, notes?: string) => {
    return fetchAPI(`rides/flow/driver/errand/${id}/update-shopping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemsCost, notes }),
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  start: async (id: number, idempotencyKey?: string) => {
    return fetchAPI(`rides/flow/driver/errand/${id}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  complete: async (id: number, idempotencyKey?: string) => {
    return fetchAPI(`rides/flow/driver/errand/${id}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },
};
