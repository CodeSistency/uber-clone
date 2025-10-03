import { renderHook } from "@testing-library/react-native";
import { useDriverNavigation } from "@/hooks/useDriverNavigation";

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => "/(driver)/profile",
}));

// Mock useUI
jest.mock("@/components/UIWrapper", () => ({
  useUI: () => ({
    showError: jest.fn(),
    showSuccess: jest.fn(),
    showInfo: jest.fn(),
  }),
}));

// Mock useDriverProfileStore
jest.mock("@/store/driverProfile", () => ({
  useDriverProfileStore: () => ({
    profile: {
      id: "driver123",
      firstName: "John",
      lastName: "Doe",
    },
  }),
}));

// Mock useMapFlowStore
jest.mock("@/store/mapFlow/mapFlow", () => ({
  useMapFlowStore: () => ({
    step: "DRIVER_DISPONIBILIDAD",
    rideId: null,
    orderId: null,
    errandId: null,
    parcelId: null,
    role: "driver",
    isActive: true,
  }),
}));

describe("useDriverNavigation", () => {
  describe("Active Ride Detection", () => {
    it("should detect no active ride when no service identifiers exist", () => {
      // Mock no active ride
      jest.doMock("@/store/mapFlow/mapFlow", () => ({
        useMapFlowStore: () => ({
          step: "DRIVER_DISPONIBILIDAD",
          rideId: null,
          orderId: null,
          errandId: null,
          parcelId: null,
          role: "driver",
          isActive: true,
        }),
      }));

      const { result } = renderHook(() => useDriverNavigation());

      expect(result.current.hasActiveRide).toBe(false);
      expect(result.current.currentServiceType).toBe(null);
    });

    it("should detect active ride when rideId exists", () => {
      // Mock active ride
      jest.doMock("@/store/mapFlow/mapFlow", () => ({
        useMapFlowStore: () => ({
          step: "DRIVER_TRANSPORT_EN_VIAJE",
          rideId: 123,
          orderId: null,
          errandId: null,
          parcelId: null,
          role: "driver",
          isActive: true,
        }),
      }));

      const { result } = renderHook(() => useDriverNavigation());

      expect(result.current.hasActiveRide).toBe(true);
      expect(result.current.currentServiceType).toBe("transport");
    });

    it("should detect active delivery when orderId exists", () => {
      // Mock active delivery
      jest.doMock("@/store/mapFlow/mapFlow", () => ({
        useMapFlowStore: () => ({
          step: "DRIVER_DELIVERY_EN_CAMINO_ENTREGA",
          rideId: null,
          orderId: 456,
          errandId: null,
          parcelId: null,
          role: "driver",
          isActive: true,
        }),
      }));

      const { result } = renderHook(() => useDriverNavigation());

      expect(result.current.hasActiveRide).toBe(true);
      expect(result.current.currentServiceType).toBe("delivery");
    });
  });

  describe("Route Restriction Detection", () => {
    it("should identify restricted routes during active rides", () => {
      // Mock active ride and restricted route
      jest.doMock("expo-router", () => ({
        useRouter: () => ({
          push: jest.fn(),
          replace: jest.fn(),
        }),
        usePathname: () => "/(driver)/vehicles",
      }));

      jest.doMock("@/store/mapFlow/mapFlow", () => ({
        useMapFlowStore: () => ({
          step: "DRIVER_TRANSPORT_EN_VIAJE",
          rideId: 123,
          orderId: null,
          errandId: null,
          parcelId: null,
          role: "driver",
          isActive: true,
        }),
      }));

      const { result } = renderHook(() => useDriverNavigation());

      expect(result.current.hasActiveRide).toBe(true);
      expect(result.current.isCurrentRouteRestricted).toBe(true);
    });

    it("should allow unrestricted routes during active rides", () => {
      // Mock active ride but allowed route
      jest.doMock("expo-router", () => ({
        useRouter: () => ({
          push: jest.fn(),
          replace: jest.fn(),
        }),
        usePathname: () => "/(driver)/earnings",
      }));

      jest.doMock("@/store/mapFlow/mapFlow", () => ({
        useMapFlowStore: () => ({
          step: "DRIVER_TRANSPORT_EN_VIAJE",
          rideId: 123,
          orderId: null,
          errandId: null,
          parcelId: null,
          role: "driver",
          isActive: true,
        }),
      }));

      const { result } = renderHook(() => useDriverNavigation());

      expect(result.current.hasActiveRide).toBe(true);
      expect(result.current.isCurrentRouteRestricted).toBe(false);
    });
  });

  describe("Navigation Guards", () => {
    it("should prevent navigation to restricted routes during active rides", async () => {
      const { useUI } = require("@/components/UIWrapper");
      const mockShowError = jest.fn();

      useUI.mockReturnValue({
        showError: mockShowError,
        showSuccess: jest.fn(),
        showInfo: jest.fn(),
      });

      // Mock active ride
      jest.doMock("@/store/mapFlow/mapFlow", () => ({
        useMapFlowStore: () => ({
          step: "DRIVER_TRANSPORT_EN_VIAJE",
          rideId: 123,
          orderId: null,
          errandId: null,
          parcelId: null,
          role: "driver",
          isActive: true,
        }),
      }));

      const { result } = renderHook(() => useDriverNavigation());

      // Try to navigate to vehicles (restricted)
      result.current.navigateToVehicles();

      expect(mockShowError).toHaveBeenCalledWith(
        "Action Not Available",
        "You cannot access management sections while on an active transport service. Please complete your current service first.",
      );
    });

    it("should allow navigation to unrestricted routes during active rides", () => {
      const { useRouter } = require("expo-router");
      const mockPush = jest.fn();

      useRouter.mockReturnValue({
        push: mockPush,
        replace: jest.fn(),
      });

      // Mock active ride
      jest.doMock("@/store/mapFlow/mapFlow", () => ({
        useMapFlowStore: () => ({
          step: "DRIVER_TRANSPORT_EN_VIAJE",
          rideId: 123,
          orderId: null,
          errandId: null,
          parcelId: null,
          role: "driver",
          isActive: true,
        }),
      }));

      const { result } = renderHook(() => useDriverNavigation());

      // Try to navigate to earnings (allowed)
      result.current.navigateToEarnings();

      expect(mockPush).toHaveBeenCalledWith("/(driver)/earnings");
    });

    it("should allow navigation when no active ride exists", () => {
      const { useRouter } = require("expo-router");
      const mockPush = jest.fn();

      useRouter.mockReturnValue({
        push: mockPush,
        replace: jest.fn(),
      });

      // Mock no active ride
      jest.doMock("@/store/mapFlow/mapFlow", () => ({
        useMapFlowStore: () => ({
          step: "DRIVER_DISPONIBILIDAD",
          rideId: null,
          orderId: null,
          errandId: null,
          parcelId: null,
          role: "driver",
          isActive: true,
        }),
      }));

      const { result } = renderHook(() => useDriverNavigation());

      // Try to navigate to vehicles (should work)
      result.current.navigateToVehicles();

      expect(mockPush).toHaveBeenCalledWith("/(driver)/vehicles");
    });
  });

  describe("Navigation Methods", () => {
    beforeEach(() => {
      const { useRouter } = require("expo-router");
      const mockPush = jest.fn();

      useRouter.mockReturnValue({
        push: mockPush,
        replace: jest.fn(),
      });
    });

    it("should provide all navigation methods", () => {
      const { result } = renderHook(() => useDriverNavigation());

      expect(typeof result.current.navigateToProfile).toBe("function");
      expect(typeof result.current.navigateToVehicles).toBe("function");
      expect(typeof result.current.navigateToDocuments).toBe("function");
      expect(typeof result.current.navigateToEarnings).toBe("function");
      expect(typeof result.current.navigateToAvailable).toBe("function");
      expect(typeof result.current.navigateToEarningsFromRide).toBe("function");
    });
  });
});
