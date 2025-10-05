// Driver Matching Service - Cliente para el sistema de matching automático
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

export interface MatchingRequest {
  lat: number;
  lng: number;
  tierId: number;
  vehicleTypeId?: number;
  radiusKm?: number;
}

export interface MatchingResponse {
  success: boolean;
  driver?: DriverMatch;
  message: string;
  estimatedWaitTime?: number;
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

class DriverMatchingService {
  private static instance: DriverMatchingService;

  static getInstance(): DriverMatchingService {
    if (!DriverMatchingService.instance) {
      DriverMatchingService.instance = new DriverMatchingService();
    }
    return DriverMatchingService.instance;
  }

  /**
   * Busca el mejor conductor disponible usando el endpoint del backend
   * POST /api/rides/flow/client/transport/match-best-driver
   */
  async findBestDriver(request: MatchingRequest): Promise<MatchingResponse> {
    try {
      

      const response = await fetchAPI(
        "rides/flow/client/transport/match-best-driver",
        {
          method: "POST",
          body: JSON.stringify({
            lat: request.lat,
            lng: request.lng,
            tierId: request.tierId,
            vehicleTypeId: request.vehicleTypeId || 1,
            radiusKm: request.radiusKm || 5,
          }),
        },
      );

      

      if (response.data?.matchedDriver) {
        const backendDriver = response.data.matchedDriver as BackendDriverMatch;

        // Transformar la respuesta del backend al formato del frontend
        const driver: DriverMatch = {
          id: backendDriver.driver.driverId,
          firstName: backendDriver.driver.firstName,
          lastName: backendDriver.driver.lastName,
          profileImageUrl: "https://via.placeholder.com/100", // TODO: Agregar campo en backend
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

        return {
          success: true,
          driver,
          message: "Conductor encontrado exitosamente",
        };
      } else {
        return {
          success: false,
          message: "No se pudo encontrar un conductor",
        };
      }
    } catch (error: any) {
      

      // Manejar errores específicos del backend
      if (error.statusCode === 404) {
        return {
          success: false,
          message: "No hay conductores disponibles en tu área",
        };
      }

      return {
        success: false,
        message: error.message || "Error al buscar conductores",
      };
    }
  }

  /**
   * Confirma un conductor específico para el viaje
   * POST /api/rides/flow/client/transport/{rideId}/confirm-driver
   */
  async confirmDriver(
    rideId: number,
    request: ConfirmDriverRequest,
  ): Promise<ConfirmDriverResponse> {
    try {
      

      const response = await fetchAPI(
        `rides/flow/client/transport/${rideId}/confirm-driver`,
        {
          method: "POST",
          body: JSON.stringify(request),
        },
      );

      

      if (response.data) {
        return response.data as ConfirmDriverResponse;
      } else {
        throw new Error("Respuesta del servidor inesperada");
      }
    } catch (error: any) {
      
      throw error;
    }
  }

  /**
   * Busca otro conductor (simplemente llama a findBestDriver nuevamente)
   * En el backend real, esto podría ser un endpoint separado
   */
  async findAnotherDriver(request: MatchingRequest): Promise<MatchingResponse> {
    try {
      

      // Simplemente buscar el mejor conductor disponible nuevamente
      return await this.findBestDriver(request);
    } catch (error: any) {
      
      return {
        success: false,
        message: error.message || "Error al buscar otro conductor",
      };
    }
  }

  /**
   * Método helper para crear la request de matching desde los datos del viaje
   */
  createMatchingRequest(
    userLatitude: number,
    userLongitude: number,
    tierId: number,
    vehicleTypeId: number = 1,
    radiusKm: number = 5,
  ): MatchingRequest {
    return {
      lat: userLatitude,
      lng: userLongitude,
      tierId,
      vehicleTypeId,
      radiusKm,
    };
  }

  /**
   * Método helper para transformar respuesta del backend al formato frontend
   */
  transformBackendDriver(backendDriver: BackendDriverMatch): DriverMatch {
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
}

// Exportar instancia singleton
export const driverMatchingService = DriverMatchingService.getInstance();
export default driverMatchingService;
