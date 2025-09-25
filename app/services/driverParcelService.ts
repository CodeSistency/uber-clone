import { fetchAPI } from "@/lib/fetch";

export const driverParcelService = {
  accept: async (id: number, idempotencyKey?: string) => {
    return fetchAPI(`rides/flow/driver/parcel/${id}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  pickup: async (id: number, idempotencyKey?: string) => {
    return fetchAPI(`rides/flow/driver/parcel/${id}/pickup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  deliver: async (
    id: number,
    proof?: { signatureImageUrl?: string; photoUrl?: string },
    idempotencyKey?: string,
  ) => {
    return fetchAPI(`rides/flow/driver/parcel/${id}/deliver`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify(proof || {}),
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },
};
