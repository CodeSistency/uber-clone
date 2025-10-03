import React from "react";
import { render, screen } from "@testing-library/react-native";
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

// Mock fetchAPI
jest.mock("@/lib/fetch", () => ({
  fetchAPI: jest.fn(),
}));

describe("Travel Preferences Component", () => {
  const mockStore = {
    currentStep: 1,
    progress: 25,
    userData: {
      preferredVehicleType: "standard",
      preferredServiceLevel: "economy",
      language: "es",
      currency: "USD",
    },
    updateUserData: jest.fn(),
    nextStep: jest.fn(),
    previousStep: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useOnboardingStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it("renders with Card UI components for each preference section", () => {
    const TravelPreferences =
      require("@/app/(onboarding)/travel-preferences").default;

    render(<TravelPreferences />);

    // Check that all Card titles are rendered
    expect(screen.getByText("🚗 Preferred Vehicle Type")).toBeTruthy();
    expect(screen.getByText("💎 Service Level Preference")).toBeTruthy();
    expect(screen.getByText("🌐 Language & Currency")).toBeTruthy();
  });

  it("renders Tabs UI component for vehicle selection", () => {
    const TravelPreferences =
      require("@/app/(onboarding)/travel-preferences").default;

    render(<TravelPreferences />);

    // Check that vehicle type options are present
    expect(screen.getByText("🚗 Standard Car")).toBeTruthy();
    expect(screen.getByText("🚐 SUV/Van")).toBeTruthy();
    expect(screen.getByText("🏍️ Motorcycle")).toBeTruthy();
    expect(screen.getByText("🚲 Bike/Scooter")).toBeTruthy();
  });

  it("renders RadioGroup UI component for service level selection", () => {
    const TravelPreferences =
      require("@/app/(onboarding)/travel-preferences").default;

    render(<TravelPreferences />);

    // Check that service level options are present
    expect(screen.getByText("Economy — Most common (Affordable)")).toBeTruthy();
    expect(screen.getByText("Comfort — More space (More space)")).toBeTruthy();
    expect(screen.getByText("Premium — Luxury (Luxury)")).toBeTruthy();
  });

  it("renders Select UI components for language and currency", () => {
    const TravelPreferences =
      require("@/app/(onboarding)/travel-preferences").default;

    render(<TravelPreferences />);

    // Check that Select components have proper placeholders
    expect(screen.getByText("Language")).toBeTruthy();
    expect(screen.getByText("Currency")).toBeTruthy();
  });

  it("renders Button UI component for continue action", () => {
    const TravelPreferences =
      require("@/app/(onboarding)/travel-preferences").default;

    render(<TravelPreferences />);

    // Check that Button component is rendered with correct title
    const continueButton = screen.getByText("Continue");
    expect(continueButton).toBeTruthy();
  });
});
