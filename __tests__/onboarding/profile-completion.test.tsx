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
    replace: jest.fn(),
  },
}));

// Mock fetchAPI
jest.mock("@/lib/fetch", () => ({
  fetchAPI: jest.fn(),
}));

describe("Profile Completion Component", () => {
  const mockStore = {
    currentStep: 3,
    progress: 75,
    userData: {},
    updateUserData: jest.fn(),
    completeOnboarding: jest.fn(),
    previousStep: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useOnboardingStore as unknown as jest.Mock).mockReturnValue(mockStore);
  });

  it("renders with Card UI components for each section", () => {
    const ProfileCompletion =
      require("@/app/(onboarding)/profile-completion").default;

    render(<ProfileCompletion />);

    // Check that all Card titles are rendered
    expect(screen.getByText("🏠 Home Address")).toBeTruthy();
    expect(screen.getByText("📸 Profile Picture")).toBeTruthy();
    expect(screen.getByText("🚨 Emergency Contact")).toBeTruthy();
  });

  it("renders TextField UI components within Cards", () => {
    const ProfileCompletion =
      require("@/app/(onboarding)/profile-completion").default;

    render(<ProfileCompletion />);

    // Check that TextField labels are present
    expect(screen.getByText("Address")).toBeTruthy();
    expect(screen.getByText("Contact Name")).toBeTruthy();
    expect(screen.getByText("Contact Phone")).toBeTruthy();
    expect(screen.getByText("Relationship")).toBeTruthy();
  });

  it("renders Glass UI components for profile picture options", () => {
    const ProfileCompletion =
      require("@/app/(onboarding)/profile-completion").default;

    render(<ProfileCompletion />);

    // Check that Glass components contain the correct text
    expect(screen.getByText("📷 Take Photo")).toBeTruthy();
    expect(screen.getByText("🖼️ Choose from Gallery")).toBeTruthy();
  });

  it("renders Button UI component for completion action", () => {
    const ProfileCompletion =
      require("@/app/(onboarding)/profile-completion").default;

    render(<ProfileCompletion />);

    // Check that Button component is rendered with correct title
    const completeButton = screen.getByText("🚀 Complete Setup & Start Riding");
    expect(completeButton).toBeTruthy();
  });

  it("shows Card subtitle for emergency contact", () => {
    const ProfileCompletion =
      require("@/app/(onboarding)/profile-completion").default;

    render(<ProfileCompletion />);

    // Check that the emergency contact card has the correct subtitle
    expect(
      screen.getByText("Optional - Leave all fields empty to skip"),
    ).toBeTruthy();
  });

  it("shows Card subtitle for profile picture", () => {
    const ProfileCompletion =
      require("@/app/(onboarding)/profile-completion").default;

    render(<ProfileCompletion />);

    // Check that the profile picture card has the correct subtitle
    expect(screen.getByText("Optional")).toBeTruthy();
  });
});
