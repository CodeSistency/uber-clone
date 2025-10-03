import { renderHook, act } from "@testing-library/react-native";
import { useAutoNavigation } from "@/hooks/useAutoNavigation";
import { websocketEventManager } from "@/lib/websocketEventManager";

// Mock del websocketEventManager
jest.mock("@/lib/websocketEventManager", () => ({
  websocketEventManager: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}));

// Mock del useMapFlow
jest.mock("@/hooks/useMapFlow", () => ({
  useMapFlow: () => ({
    next: jest.fn(),
    back: jest.fn(),
    startWithDriverStep: jest.fn(),
    currentStep: "WAITING_FOR_ACCEPTANCE",
    rideId: "test-ride-123",
    matchedDriver: { id: "driver-123", firstName: "Juan" },
    confirmedDestination: { address: "Centro" },
  }),
}));

// Mock del useRealtimeStore
jest.mock("@/store/realtime/realtime", () => ({
  useRealtimeStore: () => ({
    activeRide: {
      ride_id: "test-ride-123",
      status: "pending",
    },
  }),
}));

describe("useAutoNavigation Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Hook Initialization", () => {
    it("should initialize with correct navigation state", () => {
      const { result } = renderHook(() => useAutoNavigation());

      expect(result.current.navigationState).toEqual({
        currentStep: "WAITING_FOR_ACCEPTANCE",
        rideId: "test-ride-123",
        activeRideStatus: "pending",
        hasMatchedDriver: true,
        hasDestination: true,
        isAutoNavigationActive: true,
      });
    });

    it("should setup WebSocket listeners on mount", () => {
      renderHook(() => useAutoNavigation());

      // Verificar que se configuraron listeners para todos los eventos
      expect(websocketEventManager.on).toHaveBeenCalledWith(
        "ride:accepted",
        expect.any(Function),
      );
      expect(websocketEventManager.on).toHaveBeenCalledWith(
        "ride:rejected",
        expect.any(Function),
      );
      expect(websocketEventManager.on).toHaveBeenCalledWith(
        "ride:arrived",
        expect.any(Function),
      );
      expect(websocketEventManager.on).toHaveBeenCalledWith(
        "ride:started",
        expect.any(Function),
      );
      expect(websocketEventManager.on).toHaveBeenCalledWith(
        "ride:completed",
        expect.any(Function),
      );
      expect(websocketEventManager.on).toHaveBeenCalledWith(
        "ride:cancelled",
        expect.any(Function),
      );
    });

    it("should cleanup WebSocket listeners on unmount", () => {
      const { unmount } = renderHook(() => useAutoNavigation());

      unmount();

      // Verificar que se limpiaron todos los listeners
      expect(websocketEventManager.off).toHaveBeenCalledWith(
        "ride:accepted",
        expect.any(Function),
      );
      expect(websocketEventManager.off).toHaveBeenCalledWith(
        "ride:rejected",
        expect.any(Function),
      );
      expect(websocketEventManager.off).toHaveBeenCalledWith(
        "ride:arrived",
        expect.any(Function),
      );
      expect(websocketEventManager.off).toHaveBeenCalledWith(
        "ride:started",
        expect.any(Function),
      );
      expect(websocketEventManager.off).toHaveBeenCalledWith(
        "ride:completed",
        expect.any(Function),
      );
      expect(websocketEventManager.off).toHaveBeenCalledWith(
        "ride:cancelled",
        expect.any(Function),
      );
    });
  });

  describe("Event Validation", () => {
    it("should validate event for correct rideId", () => {
      const { result } = renderHook(() => useAutoNavigation());

      const isValid = result.current.validateEventForRide({
        rideId: "test-ride-123",
      });

      expect(isValid).toBe(true);
    });

    it("should reject event for different rideId", () => {
      const { result } = renderHook(() => useAutoNavigation());

      const isValid = result.current.validateEventForRide({
        rideId: "different-ride-456",
      });

      expect(isValid).toBe(false);
    });

    it("should validate state transitions correctly", () => {
      const { result } = renderHook(() => useAutoNavigation());

      expect(
        result.current.validateStateTransition("pending", "accepted"),
      ).toBe(true);
      expect(
        result.current.validateStateTransition("accepted", "started"),
      ).toBe(true);
      expect(
        result.current.validateStateTransition("completed", "accepted"),
      ).toBe(false);
    });
  });

  describe("Auto Navigation Events", () => {
    it("should handle ride:accepted event and trigger navigation", () => {
      const mockNext = jest.fn();
      const useMapFlowMock = require("@/hooks/useMapFlow");
      useMapFlowMock.useMapFlow.mockReturnValue({
        next: mockNext,
        back: jest.fn(),
        startWithDriverStep: jest.fn(),
        currentStep: "WAITING_FOR_ACCEPTANCE",
        rideId: "test-ride-123",
        matchedDriver: { id: "driver-123", firstName: "Juan" },
        confirmedDestination: { address: "Centro" },
      });

      renderHook(() => useAutoNavigation());

      // Simular evento ride:accepted
      const acceptedHandler = (
        websocketEventManager.on as jest.Mock
      ).mock.calls.find((call: any) => call[0] === "ride:accepted")?.[1];

      act(() => {
        acceptedHandler({
          rideId: "test-ride-123",
          driverId: "driver-123",
        });
      });

      // Verificar que se llamó a next()
      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle ride:rejected event and trigger back navigation", () => {
      const mockBack = jest.fn();
      const useMapFlowMock = require("@/hooks/useMapFlow");
      useMapFlowMock.useMapFlow.mockReturnValue({
        next: jest.fn(),
        back: mockBack,
        startWithDriverStep: jest.fn(),
        currentStep: "WAITING_FOR_ACCEPTANCE",
        rideId: "test-ride-123",
        matchedDriver: { id: "driver-123", firstName: "Juan" },
        confirmedDestination: { address: "Centro" },
      });

      renderHook(() => useAutoNavigation());

      // Simular evento ride:rejected
      const rejectedHandler = (
        websocketEventManager.on as jest.Mock
      ).mock.calls.find((call: any) => call[0] === "ride:rejected")?.[1];

      act(() => {
        rejectedHandler({
          rideId: "test-ride-123",
          reason: "Conductor ocupado",
        });
      });

      // Verificar que se llamó a back()
      expect(mockBack).toHaveBeenCalled();
    });

    it("should ignore events for different rides", () => {
      const mockNext = jest.fn();
      const useMapFlowMock = require("@/hooks/useMapFlow");
      useMapFlowMock.useMapFlow.mockReturnValue({
        next: mockNext,
        back: jest.fn(),
        startWithDriverStep: jest.fn(),
        currentStep: "WAITING_FOR_ACCEPTANCE",
        rideId: "test-ride-123",
        matchedDriver: { id: "driver-123", firstName: "Juan" },
        confirmedDestination: { address: "Centro" },
      });

      renderHook(() => useAutoNavigation());

      // Simular evento ride:accepted para ride diferente
      const acceptedHandler = (
        websocketEventManager.on as jest.Mock
      ).mock.calls.find((call: any) => call[0] === "ride:accepted")?.[1];

      act(() => {
        acceptedHandler({
          rideId: "different-ride-456",
          driverId: "driver-123",
        });
      });

      // Verificar que NO se llamó a next()
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Force Navigation", () => {
    it("should allow manual navigation override", () => {
      const mockNext = jest.fn();
      const useMapFlowMock = require("@/hooks/useMapFlow");
      useMapFlowMock.useMapFlow.mockReturnValue({
        next: mockNext,
        back: jest.fn(),
        startWithDriverStep: jest.fn(),
        currentStep: "WAITING_FOR_ACCEPTANCE",
        rideId: "test-ride-123",
        matchedDriver: { id: "driver-123", firstName: "Juan" },
        confirmedDestination: { address: "Centro" },
      });

      const { result } = renderHook(() => useAutoNavigation());

      act(() => {
        result.current.forceNavigate("next", "Manual override for testing");
      });

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("Available Events", () => {
    it("should expose all available transition events", () => {
      const { result } = renderHook(() => useAutoNavigation());

      expect(result.current.EVENT_TRANSITIONS).toEqual([
        "ride:accepted",
        "ride:rejected",
        "ride:arrived",
        "ride:started",
        "ride:completed",
        "ride:cancelled",
      ]);
    });
  });
});
