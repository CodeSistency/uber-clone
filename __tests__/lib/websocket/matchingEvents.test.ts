// Tests para WebSocket matching events
import {
  connectWebSocket,
  disconnectWebSocket,
  setupMatchingEventListeners,
  setCurrentSearchId,
  isWebSocketConnected,
  handleDriverFoundEvent,
  handleSearchTimeoutEvent,
  handleSearchCancelledEvent,
  getWebSocketMatchingState,
  resetWebSocketState,
} from '../../../lib/websocket/matchingEvents';

// Mock de socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  };
  return jest.fn(() => mockSocket);
});

// Mock del event manager
jest.mock('../../../lib/websocketEventManager', () => ({
  websocketEventManager: {
    on: jest.fn(),
    emit: jest.fn(),
    clearAllListeners: jest.fn(),
  },
}));

import io from 'socket.io-client';
import { websocketEventManager } from '../../../lib/websocketEventManager';

const mockIo = io as jest.MockedFunction<typeof io>;
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  connected: false,
};
const mockWebSocketEventManager = websocketEventManager as jest.Mocked<typeof websocketEventManager>;

describe('WebSocket Matching Events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIo.mockReturnValue(mockSocket as any);
    resetWebSocketState();
  });

  describe('connectWebSocket', () => {
    it('should connect successfully', async () => {
      mockSocket.connected = true;
      mockSocket.on.mockImplementation((event, callback) => {
        if (event === 'connect') {
          setTimeout(() => callback(), 10);
        }
      });

      const result = await connectWebSocket(123);

      expect(result).toBe(true);
      expect(mockSocket.emit).toHaveBeenCalledWith('join-user-room', { userId: 123 });
    });

    it('should handle connection failure', async () => {
      mockSocket.on.mockImplementation((event, callback) => {
        if (event === 'connect_error') {
          setTimeout(() => callback(new Error('Connection failed')), 10);
        }
      });

      await expect(connectWebSocket()).rejects.toThrow('Connection failed');
    });

    it('should handle connection timeout', async () => {
      mockSocket.on.mockImplementation(() => {
        // No callback for connect event
      });

      await expect(connectWebSocket()).rejects.toThrow('Connection timeout');
    }, 21000); // Longer timeout for this test
  });

  describe('disconnectWebSocket', () => {
    it('should disconnect successfully', () => {
      // First connect
      connectWebSocket(123);

      disconnectWebSocket();

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should handle disconnect when not connected', () => {
      expect(() => disconnectWebSocket()).not.toThrow();
    });
  });

  describe('setupMatchingEventListeners', () => {
    it('should setup listeners when socket is available', () => {
      // Simulate connected socket
      connectWebSocket(123);

      const onDriverFound = jest.fn();
      const onSearchTimeout = jest.fn();
      const onSearchCancelled = jest.fn();

      setupMatchingEventListeners(onDriverFound, onSearchTimeout, onSearchCancelled);

      expect(mockSocket.on).toHaveBeenCalledWith('matching-event', expect.any(Function));
      expect(mockWebSocketEventManager.on).toHaveBeenCalledTimes(3);
    });

    it('should warn when no socket connection', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      setupMatchingEventListeners();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[WebSocketMatching] No socket connection, cannot setup listeners'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('setCurrentSearchId', () => {
    it('should set search ID', () => {
      const searchId = 'search-123';
      setCurrentSearchId(searchId);

      const state = getWebSocketMatchingState();
      expect(state.searchId).toBe(searchId);
    });

    it('should clear search ID', () => {
      setCurrentSearchId(null);

      const state = getWebSocketMatchingState();
      expect(state.searchId).toBe(null);
    });
  });

  describe('isWebSocketConnected', () => {
    it('should return false when not connected', () => {
      expect(isWebSocketConnected()).toBe(false);
    });

    it('should return true when connected', () => {
      connectWebSocket(123);
      mockSocket.connected = true;

      expect(isWebSocketConnected()).toBe(true);
    });
  });

  describe('handleDriverFoundEvent', () => {
    it('should handle valid driver found event', () => {
      const mockDriver = {
        driverId: 42,
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        rating: 4.8,
        vehicle: { carModel: 'Toyota', licensePlate: 'ABC123', carSeats: 4 },
        location: { distance: 1.2, estimatedArrival: 8 },
        pricing: { tierId: 1, tierName: 'Economy', estimatedFare: 12.50 },
        matchScore: 87.5,
        totalRides: 150,
      };

      const callback = jest.fn();

      handleDriverFoundEvent(mockDriver, callback);

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        id: 42,
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        rating: 4.8,
        carModel: 'Toyota',
        licensePlate: 'ABC123',
        price: '$12.50',
        distance: '1.2 km',
      }));

      expect(mockWebSocketEventManager.emit).toHaveBeenCalledWith(
        'driver-notification',
        expect.objectContaining({
          type: 'driver-found',
          message: expect.stringContaining('Carlos'),
        })
      );
    });

    it('should handle invalid driver data', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      handleDriverFoundEvent(null);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[WebSocketMatching] Invalid driver data in driver-found event'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('handleSearchTimeoutEvent', () => {
    it('should handle search timeout', () => {
      const callback = jest.fn();

      handleSearchTimeoutEvent({}, callback);

      expect(callback).toHaveBeenCalled();
      expect(mockWebSocketEventManager.emit).toHaveBeenCalledWith(
        'driver-notification',
        expect.objectContaining({
          type: 'search-timeout',
          message: expect.stringContaining('No se encontraron'),
        })
      );
    });

    it('should clear current search ID', () => {
      setCurrentSearchId('search-123');

      handleSearchTimeoutEvent({});

      const state = getWebSocketMatchingState();
      expect(state.searchId).toBe(null);
    });
  });

  describe('handleSearchCancelledEvent', () => {
    it('should handle search cancellation', () => {
      const callback = jest.fn();

      handleSearchCancelledEvent({}, callback);

      expect(callback).toHaveBeenCalled();
      expect(mockWebSocketEventManager.emit).toHaveBeenCalledWith(
        'driver-notification',
        expect.objectContaining({
          type: 'search-cancelled',
          message: expect.stringContaining('cancelada'),
        })
      );
    });

    it('should clear current search ID', () => {
      setCurrentSearchId('search-123');

      handleSearchCancelledEvent({});

      const state = getWebSocketMatchingState();
      expect(state.searchId).toBe(null);
    });
  });

  describe('getWebSocketMatchingState', () => {
    it('should return current state', () => {
      setCurrentSearchId('search-123');

      const state = getWebSocketMatchingState();

      expect(state.searchId).toBe('search-123');
      expect(state.userId).toBe(null);
      expect(state.connectionState).toBe('disconnected');
    });
  });

  describe('resetWebSocketState', () => {
    it('should reset all state', () => {
      // Set some state
      setCurrentSearchId('search-123');

      resetWebSocketState();

      const state = getWebSocketMatchingState();
      expect(state.searchId).toBe(null);
      expect(state.userId).toBe(null);
      expect(state.connectionState).toBe('disconnected');
    });
  });
});
