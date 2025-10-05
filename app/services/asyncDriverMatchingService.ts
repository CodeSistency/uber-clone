// Servicio de Matching Asíncrono para conductores
// Reemplaza el sistema síncrono limitado por uno moderno que mantiene búsquedas activas

import { fetchAPI } from "@/lib/fetch";

// Interfaces que coinciden con las respuestas del backend
export interface BackendDriverMatch {
  driver: {
    driverId: number;
    firstName: string;
    lastName: string;
    rating: number;
    totalRides: number;
  };
  vehicle: {
    carModel: string;
    licensePlate: string;
    carSeats: number;
  };
  location: {
    distance: number;
    estimatedArrival: number;
  };
  pricing: {
    tierId: number;
    tierName: string;
    estimatedFare: number;
  };
  matchScore: number;
}

export interface DriverMatch {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  carModel: string;
  licensePlate: string;
  carSeats: number;
  rating: number;
  time: number; // ETA in minutes
  price: string;
  distance: string;
  tierId: number;
  tierName: string;
  matchScore: number;
  totalRides: number;
}

// Interfaces para parámetros y estados de búsqueda
export interface AsyncSearchParams {
  lat: number;
  lng: number;
  tierId: number;
  vehicleTypeId?: number;
  radiusKm?: number;
  maxWaitTime?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface AsyncSearchResponse {
  searchId: string;
  status: 'searching' | 'found' | 'timeout' | 'cancelled';
  message: string;
  searchCriteria: AsyncSearchParams;
  timeRemaining: number;
  createdAt: string;
}

export interface SearchStatusResponse {
  searchId: string;
  status: 'searching' | 'found' | 'timeout' | 'cancelled';
  message: string;
  matchedDriver?: DriverMatch;
  timeRemaining: number;
  estimatedWaitTime?: number;
}

export interface CancelResponse {
  success: boolean;
  message: string;
  searchId: string;
}

export interface ConfirmDriverRequest {
  driverId: number;
  notes?: string;
}

export interface ConfirmDriverResponse {
  rideId: number;
  driverId: number;
  status: string;
  message: string;
  notificationSent: boolean;
  responseTimeoutMinutes: number;
}

// Estados del sistema de búsqueda asíncrona
export interface AsyncSearchState {
  searchId: string | null;
  status: 'idle' | 'searching' | 'found' | 'timeout' | 'cancelled';
  matchedDriver: DriverMatch | null;
  timeRemaining: number;
  error: string | null;
  startTime: Date | null;
}

// Eventos WebSocket para matching
export interface MatchingWebSocketEvent {
  type: 'driver-found' | 'search-timeout' | 'search-cancelled';
  searchId: string;
  userId: number;
  data?: any;
  timestamp: Date;
}

// Configuración del sistema de matching asíncrono
export interface AsyncMatchingConfig {
  defaultMaxWaitTime: number;     // Segundos
  searchInterval: number;         // Milisegundos
  maxConcurrentSearches: number;
  priorityWeights: {
    high: number;
    normal: number;
    low: number;
  };
  defaultRadius: number;          // Kilómetros
  maxRadius: number;             // Kilómetros máximo
}

// Constantes de configuración
const ASYNC_MATCHING_CONFIG: AsyncMatchingConfig = {
  defaultMaxWaitTime: 300,        // 5 minutos
  searchInterval: 10000,          // 10 segundos
  maxConcurrentSearches: 100,
  priorityWeights: {
    high: 3,     // 3x más frecuente
    normal: 1,   // frecuencia normal
    low: 0.5,    // 2x menos frecuente
  },
  defaultRadius: 5,               // 5km inicial
  maxRadius: 20,                  // 20km máximo
};

// Eventos WebSocket para matching
export const MATCHING_EVENTS = {
  DRIVER_FOUND: 'driver-found',
  SEARCH_TIMEOUT: 'search-timeout',
  SEARCH_CANCELLED: 'search-cancelled',
} as const;

// Clase principal del servicio de matching asíncrono
class AsyncDriverMatchingService {
  private static instance: AsyncDriverMatchingService;

  static getInstance(): AsyncDriverMatchingService {
    if (!AsyncDriverMatchingService.instance) {
      AsyncDriverMatchingService.instance = new AsyncDriverMatchingService();
    }
    return AsyncDriverMatchingService.instance;
  }

  /**
   * Iniciar búsqueda asíncrona de conductores
   * POST /rides/flow/client/transport/async-search/start
   */
  async startAsyncSearch(params: AsyncSearchParams): Promise<AsyncSearchResponse> {
    try {
      

      const requestBody = {
        lat: params.lat,
        lng: params.lng,
        tierId: params.tierId,
        vehicleTypeId: params.vehicleTypeId || 1,
        radiusKm: params.radiusKm || ASYNC_MATCHING_CONFIG.defaultRadius,
        maxWaitTime: params.maxWaitTime || ASYNC_MATCHING_CONFIG.defaultMaxWaitTime,
        priority: params.priority || 'normal',
      };

      

      const response = await fetchAPI(
        "rides/flow/client/transport/async-search/start",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          requiresAuth: true,
          skipApiPrefix: true,
        }
      );

      

      if (response.data) {
        const searchResponse: AsyncSearchResponse = {
          searchId: response.data.searchId,
          status: response.data.status,
          message: response.data.message,
          searchCriteria: requestBody,
          timeRemaining: response.data.timeRemaining,
          createdAt: response.data.createdAt,
        };

        
        return searchResponse;
      } else {
        throw new Error("Respuesta del servidor inesperada");
      }
    } catch (error: any) {
      
      throw error;
    }
  }

  /**
   * Consultar estado de búsqueda asíncrona
   * GET /rides/flow/client/transport/async-search/:searchId/status
   */
  async getSearchStatus(searchId: string): Promise<SearchStatusResponse> {
    try {
      

      const response = await fetchAPI(
        `rides/flow/client/transport/async-search/${searchId}/status`,
        {
          requiresAuth: true,
          skipApiPrefix: true,
        }
      );

      

      if (response.data) {
        let matchedDriver: DriverMatch | undefined;

        // Si hay conductor encontrado, transformar datos del backend
        if (response.data.matchedDriver) {
          const backendDriver = response.data.matchedDriver as BackendDriverMatch;
          matchedDriver = this.transformBackendDriver(backendDriver);
        }

        const statusResponse: SearchStatusResponse = {
          searchId: response.data.searchId,
          status: response.data.status,
          message: response.data.message,
          matchedDriver,
          timeRemaining: response.data.timeRemaining,
          estimatedWaitTime: response.data.estimatedWaitTime,
        };

        return statusResponse;
      } else {
        throw new Error("Respuesta del servidor inesperada");
      }
    } catch (error: any) {
      
      throw error;
    }
  }

  /**
   * Cancelar búsqueda asíncrona activa
   * POST /rides/flow/client/transport/async-search/cancel
   */
  async cancelSearch(searchId: string): Promise<CancelResponse> {
    try {
      

      const response = await fetchAPI(
        "rides/flow/client/transport/async-search/cancel",
        {
          method: "POST",
          body: JSON.stringify({ searchId }),
          requiresAuth: true,
          skipApiPrefix: true,
        }
      );

      

      if (response.data) {
        const cancelResponse: CancelResponse = {
          success: response.data.success || true,
          message: response.data.message || "Búsqueda cancelada exitosamente",
          searchId: response.data.searchId || searchId,
        };

        
        return cancelResponse;
      } else {
        throw new Error("Respuesta del servidor inesperada");
      }
    } catch (error: any) {
      
      throw error;
    }
  }

  /**
   * Confirmar conductor encontrado
   * POST /rides/flow/client/transport/async-search/confirm-driver
   */
  async confirmDriver(
    searchId: string,
    request: ConfirmDriverRequest
  ): Promise<ConfirmDriverResponse> {
    try {
      

      const response = await fetchAPI(
        `rides/flow/client/transport/async-search/confirm-driver`,
        {
          method: "POST",
          body: JSON.stringify({
            searchId,
            driverId: request.driverId,
            notes: request.notes,
          }),
          requiresAuth: true,
          skipApiPrefix: true,
        }
      );

      

      if (response.data) {
        const confirmResponse: ConfirmDriverResponse = {
          rideId: response.data.rideId,
          driverId: response.data.driverId,
          status: response.data.status,
          message: response.data.message,
          notificationSent: response.data.notificationSent,
          responseTimeoutMinutes: response.data.responseTimeoutMinutes,
        };

        
        return confirmResponse;
      } else {
        throw new Error("Respuesta del servidor inesperada");
      }
    } catch (error: any) {
      
      throw error;
    }
  }

  /**
   * Transformar datos del backend al formato frontend
   */
  private transformBackendDriver(backendDriver: BackendDriverMatch): DriverMatch {
    return {
      id: backendDriver.driver.driverId,
      firstName: backendDriver.driver.firstName,
      lastName: backendDriver.driver.lastName,
      profileImageUrl: "https://via.placeholder.com/100", // TODO: Backend debe incluir profileImageUrl
      carModel: backendDriver.vehicle.carModel,
      licensePlate: backendDriver.vehicle.licensePlate,
      carSeats: backendDriver.vehicle.carSeats,
      rating: backendDriver.driver.rating,
      time: backendDriver.location.estimatedArrival,
      price: `$${backendDriver.pricing.estimatedFare.toFixed(2)}`,
      distance: `${backendDriver.location.distance.toFixed(1)} km`,
      tierId: backendDriver.pricing.tierId,
      tierName: backendDriver.pricing.tierName,
      matchScore: backendDriver.matchScore,
      totalRides: backendDriver.driver.totalRides,
    };
  }

  /**
   * Crear parámetros de búsqueda con valores por defecto
   */
  createSearchParams(
    userLat: number,
    userLng: number,
    tierId: number,
    options?: Partial<AsyncSearchParams>
  ): AsyncSearchParams {
    return {
      lat: userLat,
      lng: userLng,
      tierId,
      vehicleTypeId: options?.vehicleTypeId || 1,
      radiusKm: options?.radiusKm || ASYNC_MATCHING_CONFIG.defaultRadius,
      maxWaitTime: options?.maxWaitTime || ASYNC_MATCHING_CONFIG.defaultMaxWaitTime,
      priority: options?.priority || 'normal',
    };
  }

  /**
   * Obtener configuración del sistema
   */
  getConfig(): AsyncMatchingConfig {
    return ASYNC_MATCHING_CONFIG;
  }
}

// Exportar instancia singleton
export const asyncDriverMatchingService = AsyncDriverMatchingService.getInstance();
