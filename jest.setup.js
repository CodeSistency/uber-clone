import "react-native-gesture-handler/jestSetup";

// Fix for React Native window redefinition issue
Object.defineProperty(global, "window", {
  writable: true,
  value: global.window,
});

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock react-native-mmkv
jest.mock("react-native-mmkv", () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(),
    getAllKeys: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

// Mock Expo modules
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      serverUrl: "http://localhost:3000",
      wsUrl: "ws://localhost:3000",
      clerkPublishableKey: "test-clerk-key",
      placesApiKey: "test-places-key",
      directionsApiKey: "test-directions-key",
      geoapifyApiKey: "test-geoapify-key",
      stripePublishableKey: "pk_test_123",
      firebaseApiKey: "test-firebase-key",
      firebaseAuthDomain: "test.firebaseapp.com",
      firebaseProjectId: "test-project",
      firebaseStorageBucket: "test.appspot.com",
      firebaseMessagingSenderId: "123456789",
      firebaseAppId: "1:123456789:web:abcdef123456",
    },
  },
}));

jest.mock("expo-font");
jest.mock("expo-linear-gradient", () => "LinearGradient");
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new Map(),
  Link: "Link",
  Stack: {
    Screen: "Stack.Screen",
  },
}));

jest.mock("expo-location");
jest.mock("expo-notifications");
jest.mock("expo-haptics");

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => ({
  ...jest.requireActual("react-native-reanimated/mock"),
  useSharedValue: (value) => ({ value }),
  useAnimatedStyle: (callback) => callback(),
  withTiming: (value) => value,
  withSpring: (value) => value,
}));

// Mock @gorhom/bottom-sheet
jest.mock("@gorhom/bottom-sheet", () => ({
  BottomSheetModal: "BottomSheetModal",
  BottomSheetModalProvider: "BottomSheetModalProvider",
  useBottomSheetModal: () => ({
    present: jest.fn(),
    dismiss: jest.fn(),
  }),
}));

// Mock socket.io-client
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    once: jest.fn(),
    connected: true,
    id: "mock-socket-id",
  })),
}));

// Mock react-native-maps
jest.mock("react-native-maps", () => ({
  __esModule: true,
  default: "MapView",
  MapView: "MapView",
  Marker: "Marker",
  Polyline: "Polyline",
  PROVIDER_DEFAULT: "PROVIDER_DEFAULT",
  LatLng: jest.fn(),
  Region: jest.fn(),
}));

// Mock expo modules
jest.mock("expo-device");
jest.mock("expo-local-authentication");
jest.mock("expo-linking");

// Mock zustand stores
jest.mock("@/store", () => ({
  useUserStore: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    setUser: jest.fn(),
    clearUser: jest.fn(),
  })),
  useLocationStore: jest.fn(() => ({
    userLatitude: null,
    userLongitude: null,
    userAddress: null,
    destinationLatitude: null,
    destinationLongitude: null,
    destinationAddress: null,
    setUserLocation: jest.fn(),
    setDestinationLocation: jest.fn(),
  })),
  useUIStore: jest.fn(() => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showLoading: jest.fn(),
  })),
}));

// Global test utilities
global.fetch = jest.fn();

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Mock timers for performance tests
jest.useFakeTimers();
