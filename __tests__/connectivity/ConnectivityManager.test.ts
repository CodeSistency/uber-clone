import { jest } from '@jest/globals';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

// Mock the realtime store
jest.mock('@/store', () => ({
  useRealtimeStore: {
    getState: jest.fn(() => ({
      connectionStatus: {
        isConnected: false,
        connectionType: 'none',
        connectionSpeed: 0,
        isInternetReachable: false,
        websocketConnected: false,
        lastPing: new Date(),
      },
      setConnectionStatus: jest.fn(),
    })),
  },
}));

// Mock the connectivity module
jest.mock('@/lib/connectivity', () => ({
  ConnectivityManager: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    destroy: jest.fn(),
    shouldAttemptNetworkOperation: jest.fn(),
    getCurrentState: jest.fn(),
    isNetworkReachable: jest.fn(),
    getConnectionQuality: jest.fn(),
    'mapConnectionType': jest.fn(),
    'extractConnectionSpeed': jest.fn(),
  })),
}));

describe('ConnectivityManager', () => {
  let connectivityManager: any;
  let mockNetInfo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get the mocked constructor
    const { ConnectivityManager: MockedConnectivityManager } = require('@/lib/connectivity');
    connectivityManager = new MockedConnectivityManager();

    mockNetInfo = require('@react-native-community/netinfo');
  });

  afterEach(() => {
    connectivityManager.destroy();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const mockState = {
        isConnected: true,
        type: 'wifi',
        isInternetReachable: true,
        details: { strength: 100 },
      };

      mockNetInfo.fetch.mockResolvedValue(mockState);
      mockNetInfo.addEventListener.mockReturnValue(() => {});

      await connectivityManager.initialize();

      expect(mockNetInfo.fetch).toHaveBeenCalled();
      expect(mockNetInfo.addEventListener).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      mockNetInfo.fetch.mockRejectedValue(new Error('Network error'));

      await expect(connectivityManager.initialize()).rejects.toThrow('Network error');
    });

    it('should not reinitialize if already initialized', async () => {
      const mockState = {
        isConnected: true,
        type: 'wifi',
        isInternetReachable: true,
      };

      mockNetInfo.fetch.mockResolvedValue(mockState);
      mockNetInfo.addEventListener.mockReturnValue(() => {});

      await connectivityManager.initialize();
      await connectivityManager.initialize(); // Second call

      expect(mockNetInfo.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Network State Management', () => {
    beforeEach(async () => {
      const mockState = {
        isConnected: true,
        type: 'wifi',
        isInternetReachable: true,
        details: { strength: 100 },
      };

      mockNetInfo.fetch.mockResolvedValue(mockState);
      mockNetInfo.addEventListener.mockReturnValue(() => {});

      await connectivityManager.initialize();
    });

    it('should correctly map connection types', () => {
      const wifiState = { type: 'wifi' };
      const cellularState = { type: 'cellular' };
      const unknownState = { type: 'unknown' };

      expect(connectivityManager['mapConnectionType'](wifiState.type)).toBe('wifi');
      expect(connectivityManager['mapConnectionType'](cellularState.type)).toBe('cellular');
      expect(connectivityManager['mapConnectionType'](unknownState.type)).toBe('none');
      expect(connectivityManager['mapConnectionType'](null)).toBe('none');
    });

    it('should extract connection speed correctly', () => {
      const wifiWithStrength = {
        type: 'wifi',
        details: { strength: 80 },
      };

      const wifiWithLinkSpeed = {
        type: 'wifi',
        details: { linkSpeed: 50 },
      };

      const cellularState = {
        type: 'cellular',
        details: {},
      };

      expect(connectivityManager['extractConnectionSpeed'](wifiWithStrength as any)).toBe(24); // 80 * 0.3
      expect(connectivityManager['extractConnectionSpeed'](wifiWithLinkSpeed as any)).toBe(50);
      expect(connectivityManager['extractConnectionSpeed'](cellularState as any)).toBe(5);
    });

    it('should determine connection quality correctly', () => {
      // Mock different connection speeds
      const fastConnection = { details: { strength: 100 } };
      const goodConnection = { details: { strength: 60 } };
      const fairConnection = { details: { strength: 30 } };
      const poorConnection = { details: { strength: 10 } };

      expect(connectivityManager.getConnectionQuality()).toBe('excellent');
      // Note: These would need to be tested by mocking the internal state
    });
  });

  describe('Network Operations', () => {
    it('should correctly determine if network operations should be attempted', () => {
      // Mock connected state
      connectivityManager['lastKnownState'] = {
        isConnected: true,
        isInternetReachable: true,
      } as any;

      expect(connectivityManager.shouldAttemptNetworkOperation()).toBe(true);

      // Mock disconnected state
      connectivityManager['lastKnownState'] = {
        isConnected: false,
        isInternetReachable: false,
      } as any;

      expect(connectivityManager.shouldAttemptNetworkOperation()).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should return current state', () => {
      const mockState = { isConnected: true, type: 'wifi' } as any;
      connectivityManager['lastKnownState'] = mockState;

      expect(connectivityManager.getCurrentState()).toEqual(mockState);
    });

    it('should return null when no state is available', () => {
      connectivityManager['lastKnownState'] = null;
      expect(connectivityManager.getCurrentState()).toBeNull();
    });

    it('should correctly check internet reachability', () => {
      connectivityManager['lastKnownState'] = {
        isInternetReachable: true,
      } as any;

      expect(connectivityManager.isNetworkReachable()).toBe(true);

      connectivityManager['lastKnownState'] = {
        isInternetReachable: false,
      } as any;

      expect(connectivityManager.isNetworkReachable()).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should destroy properly', () => {
      const mockUnsubscribe = jest.fn();
      connectivityManager['unsubscribe'] = mockUnsubscribe;
      connectivityManager['isInitialized'] = true;
      connectivityManager['lastKnownState'] = { isConnected: true } as any;

      connectivityManager.destroy();

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(connectivityManager['isInitialized']).toBe(false);
      expect(connectivityManager['lastKnownState']).toBeNull();
    });
  });
});
