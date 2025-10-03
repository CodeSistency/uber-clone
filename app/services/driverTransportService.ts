import { fetchAPI } from "@/lib/fetch";

// Types for the service

export interface PendingRequest {
  id: number;
  rideId: number;
  status: string;
  originAddress: string;
  destinationAddress: string;
  farePrice: number;
  estimatedDistance: number;
  duration: number;
  passenger: {
    name: string;
    phone: string;
    rating: number;
  };
  tier: { name: string };
  requestedAt: string;
  expiresAt: string;
  timeRemainingSeconds: number;
  pickupLocation: {
    lat: number;
    lng: number;
  };
}

interface RideDetails {
  rideId: number;
  status: string;
  route: {
    origin: {
      address: string;
      lat: number;
      lng: number;
    };
    destination: {
      address: string;
      lat: number;
      lng: number;
    };
  };
  pricing: {
    fare: number;
    tier: { name: string };
    estimatedDuration: number;
  };
  passenger: {
    name: string;
    phone: string;
    email: string;
  };
  ratings: {
    ratingValue: number;
    comment: string;
  }[];
  timestamps: {
    created: string;
    accepted: string;
    arrived: string;
    started: string;
  };
}

interface RideHistory {
  rideId: number;
  date: string;
  origin: string;
  destination: string;
  fare: number;
  duration: number;
  passenger: string;
  tier: string;
  rating: number;
  passengerComment: string;
}

interface DriverStats {
  driverId: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  completionRate: number;
  averageRating: number;
  totalEarnings: number;
  cancellationRate: number;
}

interface EarningsData {
  driverId: number;
  period: string;
  startDate: string;
  endDate: string;
  totalRides: number;
  totalEarnings: number;
  averagePerRide: number;
}

export const driverTransportService = {
  // ===== GESTIÓN DE ESTADO DEL CONDUCTOR =====

  becomeDriver: async (status: string) => {
    return fetchAPI("rides/flow/driver/transport/become-driver", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  updateStatus: async (status: "online" | "offline" | "busy") => {
    return fetchAPI("rides/flow/driver/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  // ===== GESTIÓN DE SOLICITUDES =====

  getPendingRequests: async (
    lat: number,
    lng: number,
  ): Promise<{ success: boolean; data: PendingRequest[] }> => {
    const queryParams = `?lat=${lat}&lng=${lng}`;
    return fetchAPI(
      `rides/flow/driver/transport/pending-requests${queryParams}`,
      {
        requiresAuth: true,
        skipApiPrefix: true,
      } as any,
    );
  },

  respondToRequest: async (
    rideId: number,
    response: "accept" | "reject",
    estimatedArrivalMinutes?: number,
  ) => {
    return fetchAPI(`rides/flow/driver/transport/${rideId}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ response, estimatedArrivalMinutes }),
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  rejectRequest: async (rideId: number, reason: string) => {
    return fetchAPI(`rides/flow/driver/transport/${rideId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  // ===== VIAJE ACTIVO =====

  getCurrentRide: async () => {
    return fetchAPI("rides/flow/driver/transport/current-ride", {
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  updateLocation: async (
    rideId: number,
    location: { lat: number; lng: number; accuracy?: number; speed?: number },
  ) => {
    return fetchAPI(`rides/flow/driver/transport/${rideId}/location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(location),
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  sendMessage: async (rideId: number, message: string) => {
    return fetchAPI(`rides/flow/driver/transport/${rideId}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  getMessages: async (rideId: number, since?: string) => {
    const params = since ? `?since=${encodeURIComponent(since)}` : "";
    return fetchAPI(`rides/flow/driver/transport/${rideId}/messages${params}`, {
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  getRideDetails: async (rideId: number): Promise<RideDetails> => {
    return fetchAPI(`rides/flow/driver/transport/${rideId}/details`, {
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  // ===== GESTIÓN =====

  reportIssue: async (
    rideId: number,
    issue: {
      type:
        | "traffic_jam"
        | "accident"
        | "vehicle_issue"
        | "passenger_issue"
        | "other";
      description: string;
      severity: "low" | "medium" | "high" | "critical";
      location?: { lat: number; lng: number };
      estimatedDelay?: number;
      requiresCancellation?: boolean;
    },
  ) => {
    return fetchAPI(`rides/flow/driver/transport/${rideId}/report-issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(issue),
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  cancelRide: async (
    rideId: number,
    cancellation: {
      reason: string;
      notes?: string;
      location?: { lat: number; lng: number };
    },
  ) => {
    return fetchAPI(`rides/flow/driver/transport/${rideId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cancellation),
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  // ===== ESTADÍSTICAS =====

  getRideHistory: async (
    limit?: number,
    offset?: number,
  ): Promise<RideHistory[]> => {
    const params = [];
    if (limit) params.push(`limit=${limit}`);
    if (offset) params.push(`offset=${offset}`);
    const queryString = params.length > 0 ? `?${params.join("&")}` : "";

    return fetchAPI(`rides/flow/driver/transport/rides/history${queryString}`, {
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  getStats: async (): Promise<DriverStats> => {
    return fetchAPI("rides/flow/driver/transport/stats", {
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  getEarnings: async (
    period: "day" | "week" | "month" | "year" = "month",
  ): Promise<EarningsData> => {
    return fetchAPI(`rides/flow/driver/transport/earnings?period=${period}`, {
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  getReports: async (status?: "resolved" | "pending" | "escalated") => {
    const params = status ? `?status=${status}` : "";
    return fetchAPI(`rides/flow/driver/transport/reports${params}`, {
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  // ===== EXCHANGE RATE =====

  getExchangeRate: async (): Promise<{ rate: number; currency: string; lastUpdate: string }> => {
    try {
      // TODO: Implementar endpoint real cuando esté disponible
      // return fetchAPI("currency/exchange-rate", {
      //   requiresAuth: true,
      //   skipApiPrefix: true,
      // } as any);
      
      // Por ahora retornamos un valor por defecto
      console.log("[DriverTransportService] Exchange rate endpoint not implemented, using default");
      return {
        rate: 35.5,
        currency: "VES/USD",
        lastUpdate: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[DriverTransportService] Error getting exchange rate:", error);
      return {
        rate: 35.5,
        currency: "VES/USD",
        lastUpdate: new Date().toISOString(),
      };
    }
  },

  // ===== SIMULACIÓN Y GESTIÓN DE SOLICITUDES =====

  simulateRequest: async () => {
    return fetchAPI("rides/flow/driver/transport/simulate-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  // ===== ACTUALIZACIÓN DE UBICACIÓN GPS =====

  updateDriverLocation: async (location: {
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number;
  }) => {
    console.log("[DriverTransportService] 📍 updateDriverLocation called:", {
      location,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await fetchAPI("rides/flow/driver/transport/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(location),
        requiresAuth: true,
        skipApiPrefix: true,
      } as any);

      console.log("[DriverTransportService] ✅ updateDriverLocation success:", {
        status: result?.status,
        hasData: !!result?.data,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      console.error("[DriverTransportService] ❌ updateDriverLocation error:", {
        error: error instanceof Error ? error.message : String(error),
        location,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  // ===== ENDPOINTS ORIGINALES (MANTENIDOS POR COMPATIBILIDAD) =====

  available: async () => {
    return fetchAPI("rides/flow/driver/transport/available", {
      requiresAuth: true,
      skipApiPrefix: true,
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
      skipApiPrefix: true,
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
      skipApiPrefix: true,
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
      skipApiPrefix: true,
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
      skipApiPrefix: true,
    } as any);
  },
};
