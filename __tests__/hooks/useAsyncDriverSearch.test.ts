// Tests para el hook useAsyncDriverSearch
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAsyncDriverSearch } from '../../hooks/useAsyncDriverSearch';

// Mock del servicio
jest.mock('../../app/services/asyncDriverMatchingService', () => ({
  asyncDriverMatchingService: {
    startAsyncSearch: jest.fn(),
    getSearchStatus: jest.fn(),
    cancelSearch: jest.fn(),
    confirmDriver: jest.fn(),
    createSearchParams: jest.fn(),
  },
}));

// Mock de WebSocket
jest.mock('../../lib/websocket/matchingEvents', () => ({
  connectWebSocket: jest.fn(),
  disconnectWebSocket: jest.fn(),
  setupDefaultMatchingHandlers: jest.fn(),
  setCurrentSearchId: jest.fn(),
  isWebSocketConnected: jest.fn(),
}));

// Mock del store de mapFlow
jest.mock('../../store/mapFlow/mapFlow', () => ({
  useMapFlowStore: jest.fn(),
}));

// Mock del store de location
jest.mock('../../store', () => ({
  useLocationStore: jest.fn(),
}));

// Mock de UI
jest.mock('../../components/UIWrapper', () => ({
  useUI: jest.fn(),
}));

import { asyncDriverMatchingService } from '../../app/services/asyncDriverMatchingService';
import { connectWebSocket, isWebSocketConnected } from '../../lib/websocket/matchingEvents';
import { useMapFlowStore } from '../../store/mapFlow/mapFlow';
import { useLocationStore } from '../../store';
import { useUI } from '../../components/UIWrapper';

const mockAsyncDriverMatchingService = asyncDriverMatchingService as jest.Mocked<typeof asyncDriverMatchingService>;
const mockConnectWebSocket = connectWebSocket as jest.MockedFunction<typeof connectWebSocket>;
const mockIsWebSocketConnected = isWebSocketConnected as jest.MockedFunction<typeof isWebSocketConnected>;
const mockUseMapFlowStore = useMapFlowStore as jest.MockedFunction<typeof useMapFlowStore>;
const mockUseLocationStore = useLocationStore as jest.MockedFunction<typeof useLocationStore>;
const mockUseUI = useUI as jest.MockedFunction<typeof useUI>;

describe('useAsyncDriverSearch', () => {
  const mockStoreValues = {
    rideId: 123,
    confirmedOrigin: { latitude: 4.6097, longitude: -74.0817 },
    selectedTierId: 1,
    selectedVehicleTypeId: 2,
  };

  const mockLocationValues = {
    userLatitude: 4.6097,
    userLongitude: -74.0817,
  };

  const mockUIValues = {
    showError: jest.fn(),
    showSuccess: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockUseMapFlowStore.mockReturnValue(mockStoreValues);
    mockUseLocationStore.mockReturnValue(mockLocationValues);
    mockUseUI.mockReturnValue(mockUIValues);
    mockIsWebSocketConnected.mockReturnValue(false);
  });

  describe('initial state', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useAsyncDriverSearch());

      expect(result.current.searchState).toEqual({
        searchId: null,
        status: 'idle',
        matchedDriver: null,
        timeRemaining: 0,
        error: null,
        startTime: null,
      });

      expect(result.current.wsConnected).toBe(false);
      expect(typeof result.current.startSearch).toBe('function');
      expect(typeof result.current.cancelSearch).toBe('function');
      expect(typeof result.current.confirmDriver).toBe('function');
      expect(typeof result.current.retrySearch).toBe('function');
    });
  });

  describe('startSearch', () => {
    it('should start search successfully', async () => {
      const mockSearchResponse = {
        searchId: 'search-123',
        status: 'searching' as const,
        message: 'Buscando conductor...',
        searchCriteria: {
          lat: 4.6097,
          lng: -74.0817,
          tierId: 1,
        },
        timeRemaining: 300,
        createdAt: '2024-01-15T10:30:00.000Z',
      };

      mockAsyncDriverMatchingService.startAsyncSearch.mockResolvedValueOnce(mockSearchResponse);
      mockConnectWebSocket.mockResolvedValueOnce(true);
      mockIsWebSocketConnected.mockReturnValueOnce(true);

      const { result } = renderHook(() => useAsyncDriverSearch());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.startSearch();
      });

      expect(success).toBe(true);
      expect(mockAsyncDriverMatchingService.startAsyncSearch).toHaveBeenCalledWith({
        lat: 4.6097,
        lng: -74.0817,
        tierId: 1,
        vehicleTypeId: 2,
        radiusKm: 5,
        priority: 'normal',
      });

      expect(result.current.searchState.searchId).toBe('search-123');
      expect(result.current.searchState.status).toBe('searching');
      expect(result.current.searchState.timeRemaining).toBe(300);
    });

    it('should handle search start failure', async () => {
      mockAsyncDriverMatchingService.startAsyncSearch.mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useAsyncDriverSearch());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.startSearch();
      });

      expect(success).toBe(false);
      expect(result.current.searchState.status).toBe('idle');
      expect(result.current.searchState.error).toBe('Network error');
      expect(mockUIValues.showError).toHaveBeenCalledWith('Error', 'Network error');
    });

    it('should fail when location is missing', async () => {
      mockUseLocationStore.mockReturnValueOnce({
        userLatitude: undefined,
        userLongitude: undefined,
      });

      const { result } = renderHook(() => useAsyncDriverSearch());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.startSearch();
      });

      expect(success).toBe(false);
      expect(mockUIValues.showError).toHaveBeenCalledWith(
        'Error',
        'Ubicación no disponible para buscar conductores'
      );
    });

    it('should fail when tier is not selected', async () => {
      mockUseMapFlowStore.mockReturnValueOnce({
        ...mockStoreValues,
        selectedTierId: undefined,
      });

      const { result } = renderHook(() => useAsyncDriverSearch());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.startSearch();
      });

      expect(success).toBe(false);
      expect(mockUIValues.showError).toHaveBeenCalledWith(
        'Error',
        'Faltan datos necesarios para buscar conductores'
      );
    });
  });

  describe('cancelSearch', () => {
    it('should cancel active search', async () => {
      const mockCancelResponse = {
        success: true,
        message: 'Búsqueda cancelada',
        searchId: 'search-123',
      };

      mockAsyncDriverMatchingService.cancelSearch.mockResolvedValueOnce(mockCancelResponse);

      const { result } = renderHook(() => useAsyncDriverSearch());

      // Set up active search state
      act(() => {
        result.current.searchState.searchId = 'search-123';
        result.current.searchState.status = 'searching';
      });

      let success: boolean = false;
      await act(async () => {
        success = await result.current.cancelSearch();
      });

      expect(success).toBe(true);
      expect(mockAsyncDriverMatchingService.cancelSearch).toHaveBeenCalledWith('search-123');
      expect(result.current.searchState.status).toBe('idle');
      expect(result.current.searchState.searchId).toBe(null);
    });

    it('should handle cancel failure', async () => {
      mockAsyncDriverMatchingService.cancelSearch.mockRejectedValueOnce(
        new Error('Cancel failed')
      );

      const { result } = renderHook(() => useAsyncDriverSearch());

      // Set up active search state
      act(() => {
        result.current.searchState.searchId = 'search-123';
        result.current.searchState.status = 'searching';
      });

      let success: boolean = true;
      await act(async () => {
        success = await result.current.cancelSearch();
      });

      expect(success).toBe(false);
      expect(mockUIValues.showError).toHaveBeenCalledWith(
        'Error',
        'No se pudo cancelar la búsqueda'
      );
    });
  });

  describe('confirmDriver', () => {
    it('should confirm driver successfully', async () => {
      const mockConfirmResponse = {
        rideId: 456,
        driverId: 42,
        status: 'confirmed',
        message: 'Conductor confirmado',
        notificationSent: true,
        responseTimeoutMinutes: 5,
      };

      mockAsyncDriverMatchingService.confirmDriver.mockResolvedValueOnce(mockConfirmResponse);

      const { result } = renderHook(() => useAsyncDriverSearch());

      // Set up found state
      act(() => {
        result.current.searchState.searchId = 'search-123';
        result.current.searchState.status = 'found';
        result.current.searchState.matchedDriver = {
          id: 42,
          firstName: 'Carlos',
          lastName: 'Rodriguez',
          profileImageUrl: '',
          carModel: 'Toyota',
          licensePlate: 'ABC123',
          carSeats: 4,
          rating: 4.8,
          time: 8,
          price: '$12.50',
          distance: '1.2 km',
          tierId: 1,
          tierName: 'Economy',
          matchScore: 87.5,
          totalRides: 150,
        };
      });

      let success: boolean = false;
      await act(async () => {
        success = await result.current.confirmDriver(42);
      });

      expect(success).toBe(true);
      expect(mockAsyncDriverMatchingService.confirmDriver).toHaveBeenCalledWith('search-123', {
        driverId: 42,
        notes: 'Conductor confirmado automáticamente',
      });
      expect(result.current.searchState.status).toBe('idle');
      expect(mockUIValues.showSuccess).toHaveBeenCalledWith(
        '¡Conductor confirmado!',
        'Carlos Rodriguez viene en camino'
      );
    });

    it('should fail when no search is active', async () => {
      const { result } = renderHook(() => useAsyncDriverSearch());

      let success: boolean = true;
      await act(async () => {
        success = await result.current.confirmDriver(42);
      });

      expect(success).toBe(false);
      expect(mockUIValues.showError).toHaveBeenCalledWith(
        'Error',
        'No hay búsqueda activa o conductor para confirmar'
      );
    });
  });

  describe('retrySearch', () => {
    it('should retry search successfully', async () => {
      const mockSearchResponse = {
        searchId: 'search-456',
        status: 'searching' as const,
        message: 'Buscando conductor...',
        searchCriteria: {
          lat: 4.6097,
          lng: -74.0817,
          tierId: 1,
        },
        timeRemaining: 300,
        createdAt: '2024-01-15T10:35:00.000Z',
      };

      mockAsyncDriverMatchingService.startAsyncSearch.mockResolvedValueOnce(mockSearchResponse);
      mockConnectWebSocket.mockResolvedValueOnce(true);

      const { result } = renderHook(() => useAsyncDriverSearch());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.retrySearch();
      });

      expect(success).toBe(true);
      expect(mockAsyncDriverMatchingService.startAsyncSearch).toHaveBeenCalled();
      expect(result.current.searchState.searchId).toBe('search-456');
    });
  });

  describe('WebSocket integration', () => {
    it('should connect to WebSocket when starting search', async () => {
      const mockSearchResponse = {
        searchId: 'search-123',
        status: 'searching' as const,
        message: 'Buscando...',
        searchCriteria: { lat: 4.6097, lng: -74.0817, tierId: 1 },
        timeRemaining: 300,
        createdAt: '2024-01-15T10:30:00.000Z',
      };

      mockAsyncDriverMatchingService.startAsyncSearch.mockResolvedValueOnce(mockSearchResponse);
      mockConnectWebSocket.mockResolvedValueOnce(true);

      const { result } = renderHook(() => useAsyncDriverSearch());

      await act(async () => {
        await result.current.startSearch();
      });

      expect(mockConnectWebSocket).toHaveBeenCalled();
    });
  });
});
