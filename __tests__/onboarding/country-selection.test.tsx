import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { useOnboardingStore } from "@/store";

// Mock the store
jest.mock("@/store", () => ({
  useOnboardingStore: jest.fn(),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
  },
}));

// Mock expo-location
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({
    status: "granted",
  }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 10.4806,
      longitude: -66.9036,
    },
  }),
}));

// Mock Haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

// Mock fetchAPI
jest.mock("@/lib/fetch", () => ({
  fetchAPI: jest.fn(),
}));

describe("Country Selection Component", () => {
  const mockStore = {
    currentStep: 0,
    progress: 0,
    userData: {},
    updateUserData: jest.fn(),
    nextStep: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useOnboardingStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it("renders with Card UI components", () => {
    // Import the component dynamically to avoid issues with mocks
    const CountrySelection =
      require("@/app/(onboarding)/country-selection").default;

    render(<CountrySelection />);

    // Check that Card component is rendered with title
    expect(screen.getByText("📍 Location Information")).toBeTruthy();

    // Check that Select components are present
    expect(screen.getByText("🌍 Country")).toBeTruthy();
    expect(screen.getByText("🏛️ State / Province")).toBeTruthy();
    expect(screen.getByText("🏙️ City")).toBeTruthy();
  });

  it("renders Button UI component", () => {
    const CountrySelection =
      require("@/app/(onboarding)/country-selection").default;

    render(<CountrySelection />);

    // Check that Button component is rendered with correct title
    const continueButton = screen.getByText("Continue");
    expect(continueButton).toBeTruthy();
  });

  it("shows disabled button when no country/city selected", () => {
    const CountrySelection =
      require("@/app/(onboarding)/country-selection").default;

    render(<CountrySelection />);

    const continueButton = screen.getByText("Continue");
    // Button should be disabled by default (no country/city selected)
    expect(continueButton).toBeDisabled();
  });

  it("includes GPS detection button", () => {
    const CountrySelection =
      require("@/app/(onboarding)/country-selection").default;

    render(<CountrySelection />);

    // Check for GPS detection button
    expect(screen.getByText("📍 Detect My Location")).toBeTruthy();
  });
});
