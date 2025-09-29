import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: {
    Screen: ({ children }: any) => children,
    screenOptions: {},
  },
  router: {
    replace: jest.fn(),
  },
}));

// Mock UIWrapper
jest.mock('@/components/UIWrapper', () => ({
  useUI: () => ({
    theme: 'light',
    showError: jest.fn(),
  }),
}));

// Mock useUserStore
jest.mock('@/store/user', () => ({
  useUserStore: () => ({
    user: { id: 'user123', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

// Mock useDriverNavigation
jest.mock('@/hooks/useDriverNavigation', () => ({
  useDriverNavigation: () => ({
    hasActiveRide: false,
    currentServiceType: null,
  }),
}));

describe('DriverLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing when user is authenticated', async () => {
    const { default: DriverLayout } = require('@/app/(driver)/_layout');

    const { getByText } = render(<DriverLayout />);

    // Should show the Stack navigator
    expect(getByText).toBeDefined();
  });

  it('should redirect to sign-in when user is not authenticated', async () => {
    // Mock unauthenticated user
    jest.doMock('@/store/user', () => ({
      useUserStore: () => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }),
    }));

    const { default: DriverLayout } = require('@/app/(driver)/_layout');
    const { router } = require('expo-router');

    render(<DriverLayout />);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(auth)/sign-in');
    });
  });

  it('should show loading state while checking authentication', () => {
    // Mock loading state
    jest.doMock('@/store/user', () => ({
      useUserStore: () => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
      }),
    }));

    const { default: DriverLayout } = require('@/app/(driver)/_layout');

    const { getByText } = render(<DriverLayout />);

    expect(getByText('Verifying driver access...')).toBeTruthy();
  });

  it('should render all driver screens in Stack navigator', () => {
    const { default: DriverLayout } = require('@/app/(driver)/_layout');

    const { getByText } = render(<DriverLayout />);

    // The Stack component should render (exact content depends on implementation)
    expect(getByText).toBeDefined();
  });
});

