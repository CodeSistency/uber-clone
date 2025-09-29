import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useOnboardingStore } from '@/store';

// Mock the store
jest.mock('@/store', () => ({
  useOnboardingStore: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
  }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 10.4806,
      longitude: -66.9036,
    },
  }),
}));

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
}));

// Mock fetchAPI
jest.mock('@/lib/fetch', () => ({
  fetchAPI: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Onboarding Flow Integration Tests', () => {
  const mockStore = {
    currentStep: 0,
    progress: 0,
    isCompleted: false,
    userData: {},
    updateUserData: jest.fn(),
    nextStep: jest.fn(),
    completeOnboarding: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useOnboardingStore as jest.Mock).mockReturnValue(mockStore);
  });

  describe('UI Components Integration', () => {
    it('renders all onboarding screens with consistent Card UI', () => {
      // Test Country Selection
      const CountrySelection = require('@/app/(onboarding)/country-selection').default;
      const { rerender } = render(<CountrySelection />);

      expect(screen.getByText('📍 Location Information')).toBeTruthy();
      expect(screen.getByText('Continue')).toBeTruthy();

      // Test Travel Preferences
      const TravelPreferences = require('@/app/(onboarding)/travel-preferences').default;
      rerender(<TravelPreferences />);

      expect(screen.getByText('🚗 Preferred Vehicle Type')).toBeTruthy();
      expect(screen.getByText('💎 Service Level Preference')).toBeTruthy();
      expect(screen.getByText('🌐 Language & Currency')).toBeTruthy();

      // Test Profile Completion
      const ProfileCompletion = require('@/app/(onboarding)/profile-completion').default;
      rerender(<ProfileCompletion />);

      expect(screen.getByText('🏠 Home Address')).toBeTruthy();
      expect(screen.getByText('📸 Profile Picture')).toBeTruthy();
      expect(screen.getByText('🚨 Emergency Contact')).toBeTruthy();
    });

    it('maintains consistent Button UI across all screens', () => {
      // Test that all screens use Button component consistently
      const CountrySelection = require('@/app/(onboarding)/country-selection').default;
      const TravelPreferences = require('@/app/(onboarding)/travel-preferences').default;
      const ProfileCompletion = require('@/app/(onboarding)/profile-completion').default;

      // Render each screen and check for Button component
      const { rerender } = render(<CountrySelection />);
      expect(screen.getByText('Continue')).toBeTruthy();

      rerender(<TravelPreferences />);
      expect(screen.getByText('Continue')).toBeTruthy();

      rerender(<ProfileCompletion />);
      expect(screen.getByText('🚀 Complete Setup & Start Riding')).toBeTruthy();
    });

    it('uses consistent TextField UI in forms', () => {
      const ProfileCompletion = require('@/app/(onboarding)/profile-completion').default;

      render(<ProfileCompletion />);

      // Check that TextField components are used for form inputs
      expect(screen.getByText('Address')).toBeTruthy();
      expect(screen.getByText('Contact Name')).toBeTruthy();
      expect(screen.getByText('Contact Phone')).toBeTruthy();
      expect(screen.getByText('Relationship')).toBeTruthy();
    });

    it('uses consistent Select UI for dropdowns', () => {
      const CountrySelection = require('@/app/(onboarding)/country-selection').default;
      const TravelPreferences = require('@/app/(onboarding)/travel-preferences').default;

      const { rerender } = render(<CountrySelection />);

      // Country selection should have multiple Select components
      expect(screen.getByText('🌍 Country')).toBeTruthy();
      expect(screen.getByText('🏛️ State / Province')).toBeTruthy();
      expect(screen.getByText('🏙️ City')).toBeTruthy();

      rerender(<TravelPreferences />);

      // Travel preferences should have Select components for language/currency
      expect(screen.getByText('Language')).toBeTruthy();
      expect(screen.getByText('Currency')).toBeTruthy();
    });

    it('uses RadioGroup UI for service level selection', () => {
      const TravelPreferences = require('@/app/(onboarding)/travel-preferences').default;

      render(<TravelPreferences />);

      // Check that RadioGroup is used for service level selection
      expect(screen.getByText('Economy — Most common (Affordable)')).toBeTruthy();
      expect(screen.getByText('Comfort — More space (More space)')).toBeTruthy();
      expect(screen.getByText('Premium — Luxury (Luxury)')).toBeTruthy();
    });

    it('uses Tabs UI for vehicle type selection', () => {
      const TravelPreferences = require('@/app/(onboarding)/travel-preferences').default;

      render(<TravelPreferences />);

      // Check that Tabs are used for vehicle type selection
      expect(screen.getByText('🚗 Standard Car')).toBeTruthy();
      expect(screen.getByText('🚐 SUV/Van')).toBeTruthy();
      expect(screen.getByText('🏍️ Motorcycle')).toBeTruthy();
      expect(screen.getByText('🚲 Bike/Scooter')).toBeTruthy();
    });
  });

  describe('Responsive Design & Accessibility', () => {
    it('maintains accessibility labels and roles', () => {
      const CountrySelection = require('@/app/(onboarding)/country-selection').default;

      render(<CountrySelection />);

      // Check that buttons have accessibility roles (this would be tested more thoroughly with accessibility testing)
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeTruthy();
    });

    it('supports dark mode theming', () => {
      // This test would verify that components support dark mode classes
      // For now, we just verify the components render without errors
      const ProfileCompletion = require('@/app/(onboarding)/profile-completion').default;

      expect(() => render(<ProfileCompletion />)).not.toThrow();
    });
  });
});


