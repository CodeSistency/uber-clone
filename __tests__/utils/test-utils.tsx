import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Mock UIWrapper to avoid complex setup in tests
const MockUIWrapper = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 375, height: 812 },
      insets: { top: 44, left: 0, bottom: 34, right: 0 },
    }}
  >
    {children}
  </SafeAreaProvider>
);

// Custom render function that includes common providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MockUIWrapper>{children}</MockUIWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything from testing library
export * from "@testing-library/react-native";

// Override render method
export { customRender as render };

// ===== TEST HELPERS =====

// Mock user data
export const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  clerkId: "user_123",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

export const mockDriver = {
  id: 1,
  name: "Driver John",
  email: "driver@example.com",
  phone: "+1234567890",
  rating: 4.8,
  vehicleType: "sedan",
  licensePlate: "ABC123",
  currentLocation: { lat: 40.7128, lng: -74.006 },
};

export const mockRide = {
  id: 1,
  userId: 1,
  driverId: 1,
  status: "completed",
  pickupLocation: "123 Main St",
  destination: "456 Oak Ave",
  fare: 25.5,
  distance: 5.2,
  duration: 15,
  createdAt: "2024-01-01T10:00:00Z",
  completedAt: "2024-01-01T10:15:00Z",
};

// Mock API responses
export const mockApiResponse = {
  success: true,
  data: mockUser,
  message: "Success",
};

export const mockApiError = {
  success: false,
  message: "Something went wrong",
  error: "TEST_ERROR",
};

// Store mocks for testing
export const createMockStore = (initialState: any) => {
  const listeners = new Set<() => void>();

  return {
    getState: () => initialState,
    setState: (newState: any) => {
      Object.assign(initialState, newState);
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy: () => listeners.clear(),
  };
};

// Async utilities
export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

export const waitForMs = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock fetch for API calls
export const mockFetchResponse = (data: any, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      status: ok ? 200 : 400,
    } as any),
  );
};

export const mockFetchError = (error: any) => {
  global.fetch = jest.fn(() => Promise.reject(error));
};

// Mock navigation
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
};

// Mock router (expo-router)
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  reload: jest.fn(),
};

// Common test data factories
export const createMockRideData = (overrides = {}) => ({
  id: Math.random(),
  userId: 1,
  driverId: 1,
  status: "pending",
  pickupLocation: "123 Main St",
  destination: "456 Oak Ave",
  fare: 25.5,
  distance: 5.2,
  duration: 15,
  ...overrides,
});

export const createMockUserData = (overrides = {}) => ({
  id: Math.random(),
  name: "Test User",
  email: "test@example.com",
  clerkId: `user_${Math.random()}`,
  ...overrides,
});

export const createMockDriverData = (overrides = {}) => ({
  id: Math.random(),
  name: "Test Driver",
  email: "driver@example.com",
  rating: 4.5,
  vehicleType: "sedan",
  ...overrides,
});

// Performance testing utilities
export const measureRenderTime = async (component: ReactElement) => {
  const startTime = performance.now();

  const { rerender } = customRender(component);

  await waitForNextTick();

  const endTime = performance.now();
  const renderTime = endTime - startTime;

  return {
    renderTime,
    rerender,
    isFast: renderTime < 100, // Consider < 100ms as fast
    isAcceptable: renderTime < 500, // Consider < 500ms as acceptable
  };
};

// Accessibility testing helpers
export const checkAccessibility = (element: any) => {
  const issues = [];

  // Check for accessibilityLabel
  if (
    !element.props.accessibilityLabel &&
    !element.props.accessible === false
  ) {
    issues.push("Missing accessibilityLabel");
  }

  // Check for accessible role
  if (
    !element.props.accessibilityRole &&
    element.type?.displayName?.includes("Button")
  ) {
    issues.push("Button without accessibilityRole");
  }

  return {
    hasIssues: issues.length > 0,
    issues,
    score: Math.max(0, 100 - issues.length * 20), // Simple scoring
  };
};

// Memory leak detection (basic)
export const createMemoryMonitor = () => {
  const initialMemory = process.memoryUsage?.();

  return {
    checkLeak: () => {
      const currentMemory = process.memoryUsage?.();
      if (initialMemory && currentMemory) {
        const heapGrowth = currentMemory.heapUsed - initialMemory.heapUsed;
        return {
          heapGrowth,
          hasLeak: heapGrowth > 10 * 1024 * 1024, // > 10MB growth
          details: {
            initial: initialMemory.heapUsed,
            current: currentMemory.heapUsed,
            growth: heapGrowth,
          },
        };
      }
      return { heapGrowth: 0, hasLeak: false };
    },
  };
};

// Test scenarios
export const testScenarios = {
  userAuthenticated: {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
  },
  userLoading: {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  },
  userError: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: "Authentication failed",
  },
  rideInProgress: {
    ride: createMockRideData({ status: "in_progress" }),
    driver: mockDriver,
  },
  rideCompleted: {
    ride: createMockRideData({ status: "completed" }),
    driver: mockDriver,
  },
};

// Export commonly used test patterns
export const patterns = {
  // Common user interactions
  tap: async (element: any) => {
    await element.props.onPress();
  },

  // Form filling
  fillForm: (inputs: Record<string, string>) => {
    // Helper for filling multiple form inputs
    return inputs;
  },

  // Wait for conditions
  waitForState: (
    store: any,
    condition: (state: any) => boolean,
    timeout = 1000,
  ) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkCondition = () => {
        const state = store.getState();
        if (condition(state)) {
          resolve(state);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error("State condition not met within timeout"));
        } else {
          setTimeout(checkCondition, 10);
        }
      };

      checkCondition();
    });
  },
};
