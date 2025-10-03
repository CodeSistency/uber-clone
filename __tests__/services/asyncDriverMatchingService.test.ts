// Tests unitarios para AsyncDriverMatchingService
import { asyncDriverMatchingService, AsyncSearchParams, MATCHING_EVENTS } from '../../app/services/asyncDriverMatchingService';

// Mock del fetchAPI
jest.mock('../../lib/fetch', () => ({
  fetchAPI: jest.fn(),
}));

import { fetchAPI } from '../../lib/fetch';

const mockFetchAPI = fetchAPI as jest.MockedFunction<typeof fetchAPI>;

describe('AsyncDriverMatchingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance if needed
    (asyncDriverMatchingService as any).instance = null;
  });

  describe('startAsyncSearch', () => {
    const validParams: AsyncSearchParams = {
      lat: 4.6097,
      lng: -74.0817,
      tierId: 1,
      vehicleTypeId: 2,
      radiusKm: 5,
      maxWaitTime: 300,
      priority: 'normal',
    };

    it('should start async search successfully', async () => {
      const mockResponse = {
        data: {
          searchId: 'search-123-test',
          status: 'searching',
          message: 'Buscando conductor...',
          searchCriteria: validParams,
          timeRemaining: 300,
          createdAt: '2024-01-15T10:30:00.000Z',
        },
      };

      mockFetchAPI.mockResolvedValueOnce(mockResponse);

      const result = await asyncDriverMatchingService.startAsyncSearch(validParams);

      expect(mockFetchAPI).toHaveBeenCalledWith(
        'rides/flow/client/transport/async-search/start',
        {
          method: 'POST',
          body: JSON.stringify({
            lat: validParams.lat,
            lng: validParams.lng,
            tierId: validParams.tierId,
            vehicleTypeId: validParams.vehicleTypeId,
            radiusKm: validParams.radiusKm,
            maxWaitTime: validParams.maxWaitTime,
            priority: validParams.priority,
          }),
        }
      );

      expect(result).toEqual({
        searchId: 'search-123-test',
        status: 'searching',
        message: 'Buscando conductor...',
        searchCriteria: validParams,
        timeRemaining: 300,
        createdAt: '2024-01-15T10:30:00.000Z',
      });
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Network error';
      mockFetchAPI.mockRejectedValueOnce(new Error(errorMessage));

      await expect(asyncDriverMatchingService.startAsyncSearch(validParams))
        .rejects
        .toThrow(errorMessage);

      expect(mockFetchAPI).toHaveBeenCalledTimes(1);
    });

    it('should use default values for optional parameters', async () => {
      const minimalParams: AsyncSearchParams = {
        lat: 4.6097,
        lng: -74.0817,
        tierId: 1,
      };

      const mockResponse = {
        data: {
          searchId: 'search-minimal',
          status: 'searching',
          message: 'Buscando...',
          searchCriteria: minimalParams,
          timeRemaining: 300,
          createdAt: '2024-01-15T10:30:00.000Z',
        },
      };

      mockFetchAPI.mockResolvedValueOnce(mockResponse);

      await asyncDriverMatchingService.startAsyncSearch(minimalParams);

      expect(mockFetchAPI).toHaveBeenCalledWith(
        'rides/flow/client/transport/async-search/start',
        {
          method: 'POST',
          body: JSON.stringify({
            lat: minimalParams.lat,
            lng: minimalParams.lng,
            tierId: minimalParams.tierId,
            vehicleTypeId: 1, // default
            radiusKm: 5, // default
            maxWaitTime: 300, // default
            priority: 'normal', // default
          }),
        }
      );
    });

    it('should handle invalid response structure', async () => {
      mockFetchAPI.mockResolvedValueOnce({}); // Empty response

      await expect(asyncDriverMatchingService.startAsyncSearch(validParams))
        .rejects
        .toThrow('Respuesta del servidor inesperada');
    });
  });

  describe('getSearchStatus', () => {
    const searchId = 'search-123-test';

    it('should get search status successfully', async () => {
      const mockResponse = {
        data: {
          searchId,
          status: 'found',
          message: 'Conductor encontrado',
          matchedDriver: {
            driverId: 42,
            firstName: 'Carlos',
            lastName: 'Rodriguez',
            rating: 4.8,
            totalRides: 150,
            vehicle: {
              carModel: 'Toyota Corolla',
              licensePlate: 'ABC123',
              carSeats: 4,
            },
            location: {
              distance: 1.2,
              estimatedArrival: 8,
            },
            pricing: {
              tierId: 1,
              tierName: 'Economy',
              estimatedFare: 12.50,
            },
            matchScore: 87.5,
          },
          timeRemaining: 245,
          estimatedWaitTime: 8,
        },
      };

      mockFetchAPI.mockResolvedValueOnce(mockResponse);

      const result = await asyncDriverMatchingService.getSearchStatus(searchId);

      expect(mockFetchAPI).toHaveBeenCalledWith(
        `rides/flow/client/transport/async-search/${searchId}/status`
      );

      expect(result.searchId).toBe(searchId);
      expect(result.status).toBe('found');
      expect(result.matchedDriver).toBeDefined();
      expect(result.matchedDriver!.id).toBe(42);
      expect(result.matchedDriver!.firstName).toBe('Carlos');
      expect(result.matchedDriver!.rating).toBe(4.8);
    });

    it('should handle search without matched driver', async () => {
      const mockResponse = {
        data: {
          searchId,
          status: 'searching',
          message: 'Buscando conductor...',
          timeRemaining: 180,
        },
      };

      mockFetchAPI.mockResolvedValueOnce(mockResponse);

      const result = await asyncDriverMatchingService.getSearchStatus(searchId);

      expect(result.matchedDriver).toBeUndefined();
      expect(result.status).toBe('searching');
      expect(result.timeRemaining).toBe(180);
    });

    it('should handle API errors', async () => {
      mockFetchAPI.mockRejectedValueOnce(new Error('Search not found'));

      await expect(asyncDriverMatchingService.getSearchStatus(searchId))
        .rejects
        .toThrow('Search not found');
    });
  });

  describe('cancelSearch', () => {
    const searchId = 'search-123-test';

    it('should cancel search successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Búsqueda cancelada exitosamente',
          searchId,
        },
      };

      mockFetchAPI.mockResolvedValueOnce(mockResponse);

      const result = await asyncDriverMatchingService.cancelSearch(searchId);

      expect(mockFetchAPI).toHaveBeenCalledWith(
        'rides/flow/client/transport/async-search/cancel',
        {
          method: 'POST',
          body: JSON.stringify({ searchId }),
        }
      );

      expect(result.success).toBe(true);
      expect(result.searchId).toBe(searchId);
    });

    it('should handle cancellation errors', async () => {
      mockFetchAPI.mockRejectedValueOnce(new Error('Cancellation failed'));

      await expect(asyncDriverMatchingService.cancelSearch(searchId))
        .rejects
        .toThrow('Cancellation failed');
    });
  });

  describe('confirmDriver', () => {
    const searchId = 'search-123-test';
    const driverId = 42;
    const notes = 'Conductor confirmado automáticamente';

    it('should confirm driver successfully', async () => {
      const mockResponse = {
        data: {
          rideId: 123,
          driverId,
          status: 'confirmed',
          message: 'Conductor confirmado exitosamente',
          notificationSent: true,
          responseTimeoutMinutes: 5,
        },
      };

      mockFetchAPI.mockResolvedValueOnce(mockResponse);

      const result = await asyncDriverMatchingService.confirmDriver(searchId, {
        driverId,
        notes,
      });

      expect(mockFetchAPI).toHaveBeenCalledWith(
        'rides/flow/client/transport/async-search/confirm-driver',
        {
          method: 'POST',
          body: JSON.stringify({
            searchId,
            driverId,
            notes,
          }),
        }
      );

      expect(result.rideId).toBe(123);
      expect(result.driverId).toBe(driverId);
      expect(result.status).toBe('confirmed');
      expect(result.notificationSent).toBe(true);
    });

    it('should handle confirmation without notes', async () => {
      const mockResponse = {
        data: {
          rideId: 124,
          driverId,
          status: 'confirmed',
          message: 'Conductor confirmado',
          notificationSent: false,
          responseTimeoutMinutes: 3,
        },
      };

      mockFetchAPI.mockResolvedValueOnce(mockResponse);

      const result = await asyncDriverMatchingService.confirmDriver(searchId, {
        driverId,
      });

      expect(result.rideId).toBe(124);
      expect(result.notificationSent).toBe(false);
    });
  });

  describe('createSearchParams', () => {
    it('should create search params with defaults', () => {
      const params = asyncDriverMatchingService.createSearchParams(4.6097, -74.0817, 1);

      expect(params.lat).toBe(4.6097);
      expect(params.lng).toBe(-74.0817);
      expect(params.tierId).toBe(1);
      expect(params.vehicleTypeId).toBe(1); // default
      expect(params.radiusKm).toBe(5); // default
      expect(params.maxWaitTime).toBe(300); // default
      expect(params.priority).toBe('normal'); // default
    });

    it('should override defaults with provided options', () => {
      const params = asyncDriverMatchingService.createSearchParams(
        4.6097,
        -74.0817,
        1,
        {
          vehicleTypeId: 2,
          radiusKm: 10,
          priority: 'high',
        }
      );

      expect(params.vehicleTypeId).toBe(2);
      expect(params.radiusKm).toBe(10);
      expect(params.priority).toBe('high');
      expect(params.maxWaitTime).toBe(300); // still default
    });
  });

  describe('getConfig', () => {
    it('should return service configuration', () => {
      const config = asyncDriverMatchingService.getConfig();

      expect(config.defaultMaxWaitTime).toBe(300);
      expect(config.defaultRadius).toBe(5);
      expect(config.maxRadius).toBe(20);
      expect(config.priorityWeights).toEqual({
        high: 3,
        normal: 1,
        low: 0.5,
      });
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = asyncDriverMatchingService;
      const instance2 = asyncDriverMatchingService;

      expect(instance1).toBe(instance2);
    });
  });
});
