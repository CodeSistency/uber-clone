import { fetchAPI } from "@/lib/fetch";

export const driverStatusService = {
  transportStatus: async (rideId: number) => {
    const res = await fetchAPI(`rides/flow/client/transport/${rideId}/status`, {
      skipApiPrefix: true,
      requiresAuth: true,
    } as any);
    return res?.data ?? res;
  },

  deliveryStatus: async (orderId: number) => {
    const res = await fetchAPI(`rides/flow/client/delivery/${orderId}/status`, {
      skipApiPrefix: true,
      requiresAuth: true,
    } as any);
    return res?.data ?? res;
  },
};
