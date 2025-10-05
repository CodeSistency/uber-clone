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
    
    return driverStateService.updateStatus("online");
  },

  /**
   * Cambiar a estado offline (no disponible para viajes)
   */
  goOffline: async (): Promise<UpdateStatusResponse> => {
    
    return driverStateService.updateStatus("offline");
  },

  /**
   * Cambiar a estado busy (ocupado temporalmente)
   */
  goBusy: async (): Promise<UpdateStatusResponse> => {
    
    return driverStateService.updateStatus("busy");
  },

  /**
   * Inicializar estado del conductor (primera vez)
   */
  initializeAsDriver: async (): Promise<BecomeDriverResponse> => {
    
    return driverStateService.becomeDriver("offline"); // Comenzar offline para configuración
  },
};
