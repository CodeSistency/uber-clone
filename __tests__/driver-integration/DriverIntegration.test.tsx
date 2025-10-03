import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

// Mock all dependencies
jest.mock("expo-router", () => ({
  Stack: {
    Screen: ({ children }: any) => children,
    screenOptions: {},
  },
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
  usePathname: () => "/(driver)/profile",
}));

jest.mock("@/components/UIWrapper", () => ({
  useUI: () => ({
    theme: "light",
    showError: jest.fn(),
    showSuccess: jest.fn(),
    showInfo: jest.fn(),
  }),
}));

jest.mock("@/store/user", () => ({
  useUserStore: () => ({
    user: { id: "user123", email: "test@example.com" },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

jest.mock("@/hooks/useDriverNavigation", () => ({
  useDriverNavigation: () => ({
    hasActiveRide: false,
    currentServiceType: null,
    navigateToVehicles: jest.fn(),
    navigateToEarnings: jest.fn(),
  }),
}));

jest.mock("@/store/driverProfile", () => ({
  useDriverProfileStore: () => ({
    profile: {
      id: "driver123",
      userId: "user123",
      firstName: "Carlos",
      lastName: "Rodriguez",
      email: "carlos@example.com",
      phone: "+1234567890",
      rating: 4.8,
      totalRides: 1247,
      joinDate: "2023-01-15",
      status: "active",
      isOnline: true,
      currentLocation: {
        latitude: 25.7617,
        longitude: -80.1918,
        address: "Miami, FL",
      },
    },
    vehicles: [],
    documents: [
      {
        id: "doc1",
        driverId: "driver123",
        type: "driver_license",
        name: "Driver License",
        status: "approved",
        uploadedAt: new Date(),
        isRequired: true,
      },
    ],
    isLoading: false,
    error: null,
    fetchProfile: jest.fn(),
  }),
}));

describe("Driver Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Driver Layout Integration", () => {
    it("should render driver layout with authenticated user", async () => {
      const { default: DriverLayout } = require("@/app/(driver)/_layout");

      const { getByText } = render(<DriverLayout />);

      // Should not show loading or unauthorized messages
      expect(() => getByText("Verifying driver access...")).toThrow();
      expect(() => getByText("Access Restricted")).toThrow();
    });

    it("should handle unauthenticated user redirect", async () => {
      // Mock unauthenticated state
      jest.doMock("@/store/user", () => ({
        useUserStore: () => ({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      }));

      const { default: DriverLayout } = require("@/app/(driver)/_layout");
      const { router } = require("expo-router");

      render(<DriverLayout />);

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith("/(auth)/sign-in");
      });
    });
  });

  describe("Driver Profile Integration", () => {
    it("should render profile with data from store", () => {
      const DriverProfile = require("@/app/(driver)/profile/index.tsx").default;

      const { getByText } = render(<DriverProfile />);

      expect(getByText("Carlos Rodriguez")).toBeTruthy();
      expect(getByText("carlos@example.com")).toBeTruthy();
      expect(getByText("⭐ 4.8")).toBeTruthy();
      expect(getByText("1247")).toBeTruthy();
    });

    it("should show quick actions for navigation", () => {
      const DriverProfile = require("@/app/(driver)/profile/index.tsx").default;
      const { useDriverNavigation } = require("@/hooks/useDriverNavigation");

      const mockNavigateToVehicles = jest.fn();
      const mockNavigateToEarnings = jest.fn();

      useDriverNavigation.mockReturnValue({
        hasActiveRide: false,
        currentServiceType: null,
        navigateToVehicles: mockNavigateToVehicles,
        navigateToEarnings: mockNavigateToEarnings,
      });

      const { getByText } = render(<DriverProfile />);

      const vehiclesButton = getByText("Manage Vehicles");
      const earningsButton = getByText("View Earnings");

      fireEvent.press(vehiclesButton);
      fireEvent.press(earningsButton);

      expect(mockNavigateToVehicles).toHaveBeenCalled();
      expect(mockNavigateToEarnings).toHaveBeenCalled();
    });

    it("should show document verification status", () => {
      const DriverProfile = require("@/app/(driver)/profile/index.tsx").default;

      const { getByText } = render(<DriverProfile />);

      expect(getByText("Verification Status")).toBeTruthy();
      expect(getByText("1/1")).toBeTruthy(); // 1 approved out of 1 document
    });
  });

  describe("Driver Vehicles Integration", () => {
    it("should render vehicles list from store", () => {
      const DriverVehicles =
        require("@/app/(driver)/vehicles/index.tsx").default;

      const { getByText, queryByText } = render(<DriverVehicles />);

      expect(getByText("My Vehicles")).toBeTruthy();
      expect(getByText("+ Add New Vehicle")).toBeTruthy();

      // Should show empty state when no vehicles
      expect(getByText("No Vehicles")).toBeTruthy();
    });

    it("should show active ride warning when applicable", () => {
      const { useDriverNavigation } = require("@/hooks/useDriverNavigation");

      useDriverNavigation.mockReturnValue({
        hasActiveRide: true,
        currentServiceType: "transport",
        navigateToVehicles: jest.fn(),
        navigateToEarnings: jest.fn(),
      });

      const DriverVehicles =
        require("@/app/(driver)/vehicles/index.tsx").default;

      const { getByText } = render(<DriverVehicles />);

      expect(getByText("Active transport")).toBeTruthy();
      expect(
        getByText("You cannot modify vehicles while on an active service."),
      ).toBeTruthy();
    });
  });

  describe("Driver Documents Integration", () => {
    it("should render documents from store", () => {
      const DriverDocuments =
        require("@/app/(driver)/documents/index.tsx").default;

      const { getByText } = render(<DriverDocuments />);

      expect(getByText("Documents")).toBeTruthy();
      expect(getByText("Verification Status")).toBeTruthy();
      expect(getByText("APPROVED")).toBeTruthy(); // Document status
    });

    it("should handle document upload actions", () => {
      const DriverDocuments =
        require("@/app/(driver)/documents/index.tsx").default;

      const { getByText } = render(<DriverDocuments />);

      // Should show upload/re-upload options based on document status
      expect(getByText("Manage Documents")).toBeTruthy();
    });
  });

  describe("Driver Earnings Integration", () => {
    it("should render earnings dashboard", () => {
      const DriverEarnings =
        require("@/app/(driver)/earnings/index.tsx").default;

      const { getByText } = render(<DriverEarnings />);

      expect(getByText("Earnings")).toBeTruthy();
      // Should render earnings data (mocked)
    });

    it("should show active service info when applicable", () => {
      const { useDriverNavigation } = require("@/hooks/useDriverNavigation");

      useDriverNavigation.mockReturnValue({
        hasActiveRide: true,
        currentServiceType: "delivery",
        navigateToVehicles: jest.fn(),
        navigateToEarnings: jest.fn(),
      });

      const DriverEarnings =
        require("@/app/(driver)/earnings/index.tsx").default;

      const { getByText } = render(<DriverEarnings />);

      expect(getByText("Active delivery")).toBeTruthy();
      expect(
        getByText("You can view your earnings while on a service."),
      ).toBeTruthy();
    });
  });

  describe("Navigation Guards Integration", () => {
    it("should prevent navigation to restricted routes during active rides", () => {
      const { useDriverNavigation } = require("@/hooks/useDriverNavigation");
      const { useUI } = require("@/components/UIWrapper");

      const mockShowError = jest.fn();

      useDriverNavigation.mockReturnValue({
        hasActiveRide: true,
        currentServiceType: "transport",
        navigateToVehicles: jest.fn(),
      });

      useUI.mockReturnValue({
        theme: "light",
        showError: mockShowError,
        showSuccess: jest.fn(),
        showInfo: jest.fn(),
      });

      const DriverProfile = require("@/app/(driver)/profile/index.tsx").default;

      const { getByText } = render(<DriverProfile />);

      const vehiclesButton = getByText("Manage Vehicles");
      fireEvent.press(vehiclesButton);

      expect(mockShowError).toHaveBeenCalledWith(
        "Action Not Available",
        "You cannot access management sections while on an active transport service. Please complete your current service first.",
      );
    });
  });
});
