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
    console.log("[TransportClient] Creating ride:", data);
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
    console.log("[TransportClient] Creating ride flow:", data);
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
    console.log("[TransportClient] Selecting vehicle for ride:", rideId, data);
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/transport/${rideId}/select-vehicle`,
      {
        method: "POST",
        body: JSON.stringify(data),
        requiresAuth: true,
      },
    );
  },

  // Request driver (matching)
  async requestDriver(rideId: number) {
    console.log("[TransportClient] Requesting driver for ride:", rideId);
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/transport/${rideId}/request-driver`,
      {
        method: "POST",
        requiresAuth: true,
      },
    );
  },

  // Confirm payment
  async confirmPayment(rideId: number, data: PaymentData) {
    console.log("[TransportClient] Confirming payment for ride:", rideId, data);
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
    console.log(
      "[TransportClient] Getting price estimate:",
      { tierId, minutes, miles },
    );

    const queryParams = new URLSearchParams({
      tierId: tierId.toString(),
      minutes: Math.ceil(minutes).toString(),
      miles: miles.toFixed(1),
    });

    console.log("[TransportClient] Calling fetchAPI with URL:", `ride/estimate?${queryParams.toString()}`);
    const response = await fetchAPI(`ride/estimate?${queryParams.toString()}`);
    console.log("[TransportClient] Price estimate response:", response);
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
    console.log(
      "[TransportClient] Paying with multiple methods for ride:",
      rideId,
      data,
    );
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
    console.log(
      "[TransportClient] Generating payment reference for ride:",
      rideId,
      data,
    );
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
    console.log(
      "[TransportClient] Confirming payment with reference for ride:",
      rideId,
      data,
    );
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
    console.log(
      "[TransportClient] Confirming partial payment for ride:",
      rideId,
      data,
    );
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
    console.log("[TransportClient] Getting payment status for ride:", rideId);
    const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL || "";
    const fullUrl = `${serverUrl.replace("/api", "")}/rides/flow/client/transport/${rideId}/payment-status`;

    return await fetchAPI(fullUrl, {
      requiresAuth: true,
    });
  },

  // Join tracking
  async join(rideId: number) {
    console.log("[TransportClient] Joining ride tracking:", rideId);
    return await fetchAPI(`${FLOW_BASE_URL}/client/transport/${rideId}/join`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  // Get status
  async getStatus(rideId: number) {
    console.log("[TransportClient] Getting ride status:", rideId);
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/transport/${rideId}/status`,
      {
        requiresAuth: true,
      },
    );
  },

  // Cancel ride
  async cancel(rideId: number, reason?: string) {
    console.log("[TransportClient] Cancelling ride:", rideId, reason);
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
    console.log("[TransportClient] Rating ride:", rideId, data);
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
    console.log("[DeliveryClient] Creating order:", data);
    return await fetchAPI(`${FLOW_BASE_URL}/client/delivery/create-order`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // Confirm payment
  async confirmPayment(orderId: number, data: PaymentData) {
    console.log(
      "[DeliveryClient] Confirming payment for order:",
      orderId,
      data,
    );
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
    console.log("[DeliveryClient] Joining order tracking:", orderId);
    return await fetchAPI(`${FLOW_BASE_URL}/client/delivery/${orderId}/join`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  // Get status
  async getStatus(orderId: number) {
    console.log("[DeliveryClient] Getting order status:", orderId);
    return await fetchAPI(
      `${FLOW_BASE_URL}/client/delivery/${orderId}/status`,
      {
        requiresAuth: true,
      },
    );
  },

  // Cancel order
  async cancel(orderId: number, reason?: string) {
    console.log("[DeliveryClient] Cancelling order:", orderId, reason);
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
    console.log("[ErrandClient] Creating errand:", data);
    return await fetchAPI(`${FLOW_BASE_URL}/client/errand/create`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // Join tracking
  async join(errandId: number) {
    console.log("[ErrandClient] Joining errand tracking:", errandId);
    return await fetchAPI(`${FLOW_BASE_URL}/client/errand/${errandId}/join`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  // Get status
  async getStatus(errandId: number) {
    console.log("[ErrandClient] Getting errand status:", errandId);
    return await fetchAPI(`${FLOW_BASE_URL}/client/errand/${errandId}/status`, {
      requiresAuth: true,
    });
  },

  // Confirm payment
  async confirmPayment(errandId: number, data: PaymentData) {
    console.log("[ErrandClient] Confirming payment:", errandId, data);
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
    console.log("[ErrandClient] Cancelling errand:", errandId, reason);
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
    console.log("[ParcelClient] Creating parcel:", data);
    return await fetchAPI(`${FLOW_BASE_URL}/client/parcel/create`, {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  // Join tracking
  async join(parcelId: number) {
    console.log("[ParcelClient] Joining parcel tracking:", parcelId);
    return await fetchAPI(`${FLOW_BASE_URL}/client/parcel/${parcelId}/join`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  // Get status
  async getStatus(parcelId: number) {
    console.log("[ParcelClient] Getting parcel status:", parcelId);
    return await fetchAPI(`${FLOW_BASE_URL}/client/parcel/${parcelId}/status`, {
      requiresAuth: true,
    });
  },

  // Confirm payment
  async confirmPayment(parcelId: number, data: PaymentData) {
    console.log("[ParcelClient] Confirming payment:", parcelId, data);
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
    console.log("[ParcelClient] Cancelling parcel:", parcelId, reason);
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
    console.log("[TransportClient] Getting nearby drivers:", params);
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
    console.log("[TransportClient] Simulating driver locations:", params);
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
    console.log("[TransportDriverClient] Getting available rides");
    return await fetchAPI(`${FLOW_BASE_URL}/driver/transport/available`, {
      requiresAuth: true,
    });
  },

  // Accept ride
  async accept(rideId: number, idempotencyKey?: string) {
    console.log("[TransportDriverClient] Accepting ride:", rideId);
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
    console.log("[TransportDriverClient] Arrived at pickup for ride:", rideId);
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
    console.log("[TransportDriverClient] Starting ride:", rideId);
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
    console.log("[TransportDriverClient] Completing ride:", rideId, data);
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
    console.log("[DeliveryDriverClient] Getting available orders");
    return await fetchAPI(`${FLOW_BASE_URL}/driver/delivery/available`, {
      requiresAuth: true,
    });
  },

  // Accept order
  async accept(orderId: number, idempotencyKey?: string) {
    console.log("[DeliveryDriverClient] Accepting order:", orderId);
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
    console.log("[DeliveryDriverClient] Picking up order:", orderId);
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
    console.log("[DeliveryDriverClient] Delivering order:", orderId);
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
    console.log("[ErrandDriverClient] Accepting errand:", errandId);
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
    console.log(
      "[ErrandDriverClient] Updating shopping for errand:",
      errandId,
      data,
    );
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
    console.log("[ErrandDriverClient] Starting errand delivery:", errandId);
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
    console.log("[ErrandDriverClient] Completing errand:", errandId);
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
    console.log("[ParcelDriverClient] Accepting parcel:", parcelId);
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
    console.log("[ParcelDriverClient] Picking up parcel:", parcelId);
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
    console.log("[ParcelDriverClient] Delivering parcel:", parcelId, data);
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
    console.error(`[FlowClient] Error in ${operation}:`, error);
    throw error;
  },

  // WebSocket room helpers
  getRideRoom: (rideId: number) => `ride-${rideId}`,
  getOrderRoom: (orderId: number) => `order-${orderId}`,
  getErrandRoom: (errandId: number) => `errand-${errandId}`,
  getParcelRoom: (parcelId: number) => `parcel-${parcelId}`,
};
