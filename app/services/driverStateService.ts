import { fetchAPI } from "@/lib/fetch";

// Types for driver state management

interface BecomeDriverRequest {
  status: string;
}

interface BecomeDriverResponse {
  data: {
    id: number;
    firstName: string;
    lastName: string;
    status: string;
    message: string;
  };
}

interface UpdateStatusRequest {
  status: "online" | "offline" | "busy";
}

interface UpdateStatusResponse {
  driverId: number;
  status: "online" | "offline" | "busy";
  verificationStatus: "pending" | "approved" | "rejected";
  updatedAt: string;
}

export const driverStateService = {
  /**
   * Convertir un usuario regular en conductor
   * POST /api/rides/flow/driver/transport/become-driver
   */
  becomeDriver: async (
    status: string = "online",
  ): Promise<BecomeDriverResponse> => {
    console.log(
      "[DriverStateService] Converting user to driver with status:",
      status,
    );

    return fetchAPI("rides/flow/driver/transport/become-driver", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status } as BecomeDriverRequest),
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  /**
   * Actualizar el estado del conductor (online/offline/busy)
   * POST /rides/flow/driver/availability
   */
  updateStatus: async (
    status: "online" | "offline" | "busy",
  ): Promise<UpdateStatusResponse> => {
    console.log("[DriverStateService] Updating driver status to:", status);

    return fetchAPI("rides/flow/driver/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status } as UpdateStatusRequest),
      requiresAuth: true,
      skipApiPrefix: true,
    } as any);
  },

  /**
   * Cambiar a estado online (disponible para viajes)
   */
  goOnline: async (): Promise<UpdateStatusResponse> => {
    console.log("[DriverStateService] Going online");
    return driverStateService.updateStatus("online");
  },

  /**
   * Cambiar a estado offline (no disponible para viajes)
   */
  goOffline: async (): Promise<UpdateStatusResponse> => {
    console.log("[DriverStateService] Going offline");
    return driverStateService.updateStatus("offline");
  },

  /**
   * Cambiar a estado busy (ocupado temporalmente)
   */
  goBusy: async (): Promise<UpdateStatusResponse> => {
    console.log("[DriverStateService] Going busy");
    return driverStateService.updateStatus("busy");
  },

  /**
   * Inicializar estado del conductor (primera vez)
   */
  initializeAsDriver: async (): Promise<BecomeDriverResponse> => {
    console.log("[DriverStateService] Initializing user as driver");
    return driverStateService.becomeDriver("offline"); // Comenzar offline para configuración
  },
};
