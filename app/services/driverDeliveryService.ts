import { fetchAPI } from "@/lib/fetch";

export const driverDeliveryService = {
  available: async () => {
    return fetchAPI("rides/flow/driver/delivery/available", {
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  accept: async (orderId: number, idempotencyKey?: string) => {
    return fetchAPI(`rides/flow/driver/delivery/${orderId}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  pickup: async (orderId: number, idempotencyKey?: string) => {
    return fetchAPI(`rides/flow/driver/delivery/${orderId}/pickup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  deliver: async (orderId: number, idempotencyKey?: string) => {
    return fetchAPI(`rides/flow/driver/delivery/${orderId}/deliver`, {
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
