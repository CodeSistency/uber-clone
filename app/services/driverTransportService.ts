import { fetchAPI } from "@/lib/fetch";

export const driverTransportService = {
  available: async () => {
    return fetchAPI("rides/flow/driver/transport/available", {
      requiresAuth: true,
    } as any);
  },

  accept: async (rideId: number, idempotencyKey?: string) => {
    return fetchAPI(`rides/flow/driver/transport/${rideId}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      requiresAuth: true,
    } as any);
  },

  arrived: async (rideId: number, idempotencyKey?: string) => {
    return fetchAPI(`rides/flow/driver/transport/${rideId}/arrived`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      requiresAuth: true,
    } as any);
  },

  start: async (rideId: number, idempotencyKey?: string) => {
    return fetchAPI(`rides/flow/driver/transport/${rideId}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      requiresAuth: true,
    } as any);
  },

  complete: async (rideId: number, fare: number, idempotencyKey?: string) => {
    return fetchAPI(`rides/flow/driver/transport/${rideId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify({ fare }),
      requiresAuth: true,
    } as any);
  },
};
