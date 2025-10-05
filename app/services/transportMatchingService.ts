import { fetchAPI } from "@/lib/fetch";

// Types for matching service
export interface MatchingRequest {
  lat: number;
  lng: number;
  tierId: number;
  radiusKm: number;
}

export interface MatchingResponse {
  success: boolean;
  drivers: Array<{
    driverId: number;
    name: string;
    rating: number;
    vehicleInfo: string;
    estimatedArrivalMinutes: number;
    distance: number;
    location: {
      lat: number;
      lng: number;
    };
  }>;
  searchId?: string;
}

export interface ConfirmDriverRequest {
  driverId: number;
  notes?: string;
}

export interface ConfirmDriverResponse {
  success: boolean;
  rideId: number;
  driverId: number;
  estimatedArrivalMinutes: number;
  message: string;
}

/**
 * Servicio de Matching de Conductores
 * Implementa los endpoints faltantes según la documentación
 */
export const transportMatchingService = {
  /**
   * Búsqueda síncrona de conductor
   * POST /rides/flow/client/transport/match-best-driver
   */
  async matchBestDriver(request: MatchingRequest): Promise<MatchingResponse> {
    
    
    try {
      const response = await fetchAPI("rides/flow/client/transport/match-best-driver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        requiresAuth: true,
        skipApiPrefix: true,
      } as any);

      
      return response;
    } catch (error) {
      
      throw error;
    }
  },

  /**
   * Confirmar conductor específico
   * POST /rides/flow/client/transport/:rideId/confirm-driver
   */
  async confirmDriver(
    rideId: number, 
    request: ConfirmDriverRequest
  ): Promise<ConfirmDriverResponse> {
    
    
    try {
      const response = await fetchAPI(`rides/flow/client/transport/${rideId}/confirm-driver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        requiresAuth: true,
        skipApiPrefix: true,
      } as any);

      
      return response;
    } catch (error) {
      
      throw error;
    }
  },

  /**
   * Búsqueda asíncrona de conductor (ya implementada en asyncDriverMatchingService)
   * POST /rides/flow/client/transport/async-search/start
   */
  async startAsyncSearch(params: {
    lat: number;
    lng: number;
    priority: "normal" | "high" | "urgent";
    maxWaitTime: number;
  }) {
    
    
    try {
      const response = await fetchAPI("rides/flow/client/transport/async-search/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
        requiresAuth: true,
        skipApiPrefix: true,
      } as any);

      
      return response;
    } catch (error) {
      
      throw error;
    }
  },

  /**
   * Cancelar búsqueda asíncrona
   * POST /rides/flow/client/transport/async-search/cancel
   */
  async cancelAsyncSearch(searchId: string) {
    
    
    try {
      const response = await fetchAPI("rides/flow/client/transport/async-search/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchId }),
        requiresAuth: true,
        skipApiPrefix: true,
      } as any);

      
      return response;
    } catch (error) {
      
      throw error;
    }
  },

  /**
   * Obtener estado de búsqueda asíncrona
   * GET /rides/flow/client/transport/async-search/:searchId/status
   */
  async getAsyncSearchStatus(searchId: string) {
    
    
    try {
      const response = await fetchAPI(`rides/flow/client/transport/async-search/${searchId}/status`, {
        method: "GET",
        requiresAuth: true,
        skipApiPrefix: true,
      } as any);

      
      return response;
    } catch (error) {
      
      throw error;
    }
  },
};

export default transportMatchingService;
