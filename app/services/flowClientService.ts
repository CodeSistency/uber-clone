import { fetchAPI } from "@/lib/fetch";

// Base URL for flow APIs
const FLOW_BASE_URL = `${process.env.EXPO_PUBLIC_SERVER_URL || "https://gnuhealth-back.alcaravan.com.ve"}/api/rides/flow`;

// Types for Flow Services
export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface DeliveryOrderData {
  storeId: number;
  items: {
    productId: number;
    quantity: number;
  }[];
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
}

export interface ErrandData {
  description: string;
  itemsList?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
}

export interface ParcelData {
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  type: string;
  description?: string;
}

export interface PaymentData {
  method: "cash" | "card" | "wallet";
  clientSecret?: string;
}

export interface TransportRideData {
  originAddress: string;
  originLat: number;
  originLng: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  minutes: number;
  tierId: number;
  vehicleTypeId?: number;
}

// Transport Client - Cliente side
export const transportClient = {
  // Define ride (create) - OLD METHOD
  async defineRide(data: TransportRideData) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/transport/define-ride`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // Define ride flow (new method with updated endpoint)
  async defineRideFlow(data: {
    originAddress: string;
    originLat: number;
    originLng: number;
    destinationAddress: string;
    destinationLat: number;
    destinationLng: number;
    minutes: number;
    tierId: number;
    phoneNumber?: string; // For FOR_OTHER rides
    rideType?: string; // 'normal' | 'for_other'
  }) {
    
    // Use full URL to avoid the /api prefix that fetchAPI adds
    const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL || "";
    const fullUrl = `${serverUrl.replace("/api", "")}/rides/flow/client/transport/define-ride`;

    return await fetchAPI(fullUrl, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // Select vehicle/tier
  async selectVehicle(
    rideId: number,
    data: { tierId: number; vehicleTypeId: number },
  ) {
    
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/transport/${rideId}/select-vehicle`,
      {
        method: "POST",
        body: JSON.stringify(data),
        requiresAuth: true,
      },
    );
  },

  // Request driver (matching) - MANTENIDO para compatibilidad
  async requestDriver(rideId: number) {
    
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/transport/${rideId}/request-driver`,
      {
        method: "POST",
        requiresAuth: true,
      },
    );
  },

  // ✅ NUEVO: Búsqueda síncrona de conductor (según documentación)
  async matchBestDriver(data: {
    lat: number;
    lng: number;
    tierId: number;
    radiusKm: number;
  }) {
    
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/transport/match-best-driver`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // ✅ NUEVO: Confirmar conductor específico (según documentación)
  async confirmDriver(rideId: number, data: {
    driverId: number;
    notes?: string;
  }) {
    
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/transport/${rideId}/confirm-driver`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // Confirm payment
  async confirmPayment(rideId: number, data: PaymentData) {
    
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/transport/${rideId}/confirm-payment`,
      {
        method: "POST",
        body: JSON.stringify(data),
        requiresAuth: true,
      },
    );
  },

  // 🆕 NEW: Get price estimate
  async getPriceEstimate(
    tierId: number,
    minutes: number,
    miles: number,
  ): Promise<{
    tier: string;
    baseFare: number;
    perMinuteRate: number;
    perMileRate: number;
    estimatedMinutes: number;
    estimatedMiles: number;
    totalFare: number;
  }> {
    

    const queryParams = new URLSearchParams({
      tierId: tierId.toString(),
      minutes: Math.ceil(minutes).toString(),
      miles: miles.toFixed(1),
    });

    
    const response = await fetchAPI(`ride/estimate?${queryParams.toString()}`);
    
    // Backend returns { data: { data: {...} } } - need to access nested data
    return response.data.data;
  },

  // 🆕 NEW: Pay with multiple methods
  async payWithMultipleMethods(
    rideId: number,
    data: {
      totalAmount: number | string;
      payments: {
        method: "transfer" | "pago_movil" | "zelle" | "bitcoin" | "cash" | "wallet";
        amount: number | string;
        bankCode?: string;
      }[];
    },
  ) {
    
    // Use full URL to avoid the /api prefix that fetchAPI adds
    const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL || "";
    const fullUrl = `${serverUrl.replace("/api", "")}/rides/flow/client/transport/${rideId}/pay-with-multiple-methods`;

    return await fetchAPI(fullUrl, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // 🆕 NEW: Generate payment reference for external payment
  async generatePaymentReference(
    rideId: number,
    data: {
      method: "transfer" | "pago_movil" | "zelle" | "bitcoin";
      bankCode?: string;
    },
  ) {
    
    const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL || "";
    const fullUrl = `${serverUrl.replace("/api", "")}/rides/flow/client/transport/${rideId}/generate-payment-reference`;

    return await fetchAPI(fullUrl, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // 🆕 NEW: Confirm payment with external reference
  async confirmPaymentWithReference(
    rideId: number,
    data: {
      referenceNumber: string;
      bankCode?: string;
    },
  ) {
    
    const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL || "";
    const fullUrl = `${serverUrl.replace("/api", "")}/rides/flow/client/transport/${rideId}/confirm-payment-with-reference`;

    return await fetchAPI(fullUrl, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // 🆕 NEW: Confirm partial payment in group
  async confirmPartialPayment(
    rideId: number,
    data: {
      referenceNumber: string;
      bankCode?: string;
    },
  ) {
    
    const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL || "";
    const fullUrl = `${serverUrl.replace("/api", "")}/rides/flow/client/transport/${rideId}/confirm-partial-payment`;

    return await fetchAPI(fullUrl, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // 🆕 NEW: Get payment status
  async getPaymentStatus(rideId: number) {
    
    const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL || "";
    const fullUrl = `${serverUrl.replace("/api", "")}/rides/flow/client/transport/${rideId}/payment-status`;

    return await fetchAPI(fullUrl, {
      requiresAuth: true,
    });
  },

  // Join tracking
  async join(rideId: number) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/transport/${rideId}/join`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  // Get status
  async getStatus(rideId: number) {
    
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/transport/${rideId}/status`,
      {
        requiresAuth: true,
      },
    );
  },

  // Cancel ride
  async cancel(rideId: number, reason?: string) {
    
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/transport/${rideId}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
        requiresAuth: true,
      },
    );
  },

  // Rate ride
  async rate(rideId: number, data: { rating: number; comment?: string }) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/transport/${rideId}/rate`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },
};

// Delivery Client - Cliente side
export const deliveryClient = {
  // Create order
  async createOrder(data: DeliveryOrderData) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/delivery/create-order`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // Confirm payment
  async confirmPayment(orderId: number, data: PaymentData) {
    
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/delivery/${orderId}/confirm-payment`,
      {
        method: "POST",
        body: JSON.stringify(data),
        requiresAuth: true,
      },
    );
  },

  // Join tracking
  async join(orderId: number) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/delivery/${orderId}/join`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  // Get status
  async getStatus(orderId: number) {
    
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/delivery/${orderId}/status`,
      {
        requiresAuth: true,
      },
    );
  },

  // Cancel order
  async cancel(orderId: number, reason?: string) {
    
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/delivery/${orderId}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
        requiresAuth: true,
      },
    );
  },
};

// Errand Client - Cliente side
export const errandClient = {
  // Create errand
  async create(data: ErrandData) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/errand/create`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // Join tracking
  async join(errandId: number) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/errand/${errandId}/join`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  // Get status
  async getStatus(errandId: number) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/errand/${errandId}/status`, {
      requiresAuth: true,
    });
  },

  // Confirm payment
  async confirmPayment(errandId: number, data: PaymentData) {
    
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/errand/${errandId}/confirm-payment`,
      {
        method: "POST",
        body: JSON.stringify(data),
        requiresAuth: true,
      },
    );
  },

  // Cancel errand
  async cancel(errandId: number, reason?: string) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/errand/${errandId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
      requiresAuth: true,
    });
  },
};

// Parcel Client - Cliente side
export const parcelClient = {
  // Create parcel
  async create(data: ParcelData) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/parcel/create`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // Join tracking
  async join(parcelId: number) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/parcel/${parcelId}/join`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  // Get status
  async getStatus(parcelId: number) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/parcel/${parcelId}/status`, {
      requiresAuth: true,
    });
  },

  // Confirm payment
  async confirmPayment(parcelId: number, data: PaymentData) {
    
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/parcel/${parcelId}/confirm-payment`,
      {
        method: "POST",
        body: JSON.stringify(data),
        requiresAuth: true,
      },
    );
  },

  // Cancel parcel
  async cancel(parcelId: number, reason?: string) {
    
    return await fetchAPI(`${FLOW_BASE_URL}/client/parcel/${parcelId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
      requiresAuth: true,
    });
  },
  // Get nearby drivers
  async getNearbyDrivers(params: {
    lat: number;
    lng: number;
    radius?: number;
    tierId?: number;
    vehicleTypeId?: number;
  }) {
    
    const queryParams = new URLSearchParams({
      lat: params.lat.toString(),
      lng: params.lng.toString(),
      ...(params.radius && { radius: params.radius.toString() }),
      ...(params.tierId && { tierId: params.tierId.toString() }),
      ...(params.vehicleTypeId && {
        vehicleTypeId: params.vehicleTypeId.toString(),
      }),
    });

    return await fetchAPI(
      `rides/flow/client/transport/nearby-drivers?${queryParams}`,
      {
        requiresAuth: true,
      },
    );
  },

  // Simulate driver locations (for testing)
  async simulateDriverLocations(params: {
    centerLat: number;
    centerLng: number;
    radiusKm?: number;
    driverCount?: number;
    vehicleTypeIds?: number[];
  }) {
    
    return await fetchAPI(
      `rides/flow/client/transport/test/simulate-driver-locations`,
      {
        method: "POST",
        body: JSON.stringify(params),
        requiresAuth: true,
      },
    );
  },
};

// Transport Client - Driver side
export const transportDriverClient = {
  // Get available rides
  async getAvailable() {
    
    return await fetchAPI(`${FLOW_BASE_URL}/driver/transport/available`, {
      requiresAuth: true,
    });
  },

  // Accept ride
  async accept(rideId: number, idempotencyKey?: string) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(
      `${FLOW_BASE_URL}/driver/transport/${rideId}/accept`,
      {
        method: "POST",
        headers,
        requiresAuth: true,
      },
    );
  },

  // Arrived at pickup
  async arrived(rideId: number, idempotencyKey?: string) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(
      `${FLOW_BASE_URL}/driver/transport/${rideId}/arrived`,
      {
        method: "POST",
        headers,
        requiresAuth: true,
      },
    );
  },

  // Start ride
  async start(rideId: number, idempotencyKey?: string) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(`${FLOW_BASE_URL}/driver/transport/${rideId}/start`, {
      method: "POST",
      headers,
      requiresAuth: true,
    });
  },

  // Complete ride
  async complete(
    rideId: number,
    data?: { fare?: number },
    idempotencyKey?: string,
  ) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(
      `${FLOW_BASE_URL}/driver/transport/${rideId}/complete`,
      {
        method: "POST",
        body: JSON.stringify(data || {}),
        headers,
        requiresAuth: true,
      },
    );
  },
};

// Delivery Client - Driver side
export const deliveryDriverClient = {
  // Get available orders
  async getAvailable() {
    
    return await fetchAPI(`${FLOW_BASE_URL}/driver/delivery/available`, {
      requiresAuth: true,
    });
  },

  // Accept order
  async accept(orderId: number, idempotencyKey?: string) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(
      `${FLOW_BASE_URL}/driver/delivery/${orderId}/accept`,
      {
        method: "POST",
        headers,
        requiresAuth: true,
      },
    );
  },

  // Pickup from store
  async pickup(orderId: number, idempotencyKey?: string) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(
      `${FLOW_BASE_URL}/driver/delivery/${orderId}/pickup`,
      {
        method: "POST",
        headers,
        requiresAuth: true,
      },
    );
  },

  // Deliver order
  async deliver(orderId: number, idempotencyKey?: string) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(
      `${FLOW_BASE_URL}/driver/delivery/${orderId}/deliver`,
      {
        method: "POST",
        headers,
        requiresAuth: true,
      },
    );
  },
};

// Errand Client - Driver side
export const errandDriverClient = {
  // Accept errand
  async accept(errandId: number, idempotencyKey?: string) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(`${FLOW_BASE_URL}/driver/errand/${errandId}/accept`, {
      method: "POST",
      headers,
      requiresAuth: true,
    });
  },

  // Update shopping status
  async updateShopping(
    errandId: number,
    data: { itemsCost: number; notes?: string },
    idempotencyKey?: string,
  ) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(
      `${FLOW_BASE_URL}/driver/errand/${errandId}/update-shopping`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers,
        requiresAuth: true,
      },
    );
  },

  // Start delivery
  async start(errandId: number, idempotencyKey?: string) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(`${FLOW_BASE_URL}/driver/errand/${errandId}/start`, {
      method: "POST",
      headers,
      requiresAuth: true,
    });
  },

  // Complete errand
  async complete(errandId: number, idempotencyKey?: string) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(
      `${FLOW_BASE_URL}/driver/errand/${errandId}/complete`,
      {
        method: "POST",
        headers,
        requiresAuth: true,
      },
    );
  },
};

// Parcel Client - Driver side
export const parcelDriverClient = {
  // Accept parcel
  async accept(parcelId: number, idempotencyKey?: string) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(`${FLOW_BASE_URL}/driver/parcel/${parcelId}/accept`, {
      method: "POST",
      headers,
      requiresAuth: true,
    });
  },

  // Pickup parcel
  async pickup(parcelId: number, idempotencyKey?: string) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(`${FLOW_BASE_URL}/driver/parcel/${parcelId}/pickup`, {
      method: "POST",
      headers,
      requiresAuth: true,
    });
  },

  // Deliver parcel with proof
  async deliver(
    parcelId: number,
    data?: { signatureImageUrl?: string; photoUrl?: string },
    idempotencyKey?: string,
  ) {
    
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    return await fetchAPI(
      `${FLOW_BASE_URL}/driver/parcel/${parcelId}/deliver`,
      {
        method: "POST",
        body: JSON.stringify(data || {}),
        headers,
        requiresAuth: true,
      },
    );
  },
};

// Utility functions
export const generateIdempotencyKey = (): string => {
  return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const flowUtils = {
  // Generate idempotency key for critical operations
  generateIdempotencyKey,

  // Common error handling
  handleFlowError: (error: any, operation: string) => {
    
    throw error;
  },

  // WebSocket room helpers
  getRideRoom: (rideId: number) => `ride-${rideId}`,
  getOrderRoom: (orderId: number) => `order-${orderId}`,
  getErrandRoom: (errandId: number) => `errand-${errandId}`,
  getParcelRoom: (parcelId: number) => `parcel-${parcelId}`,
};
