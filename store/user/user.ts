import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mmkvStorage } from "@/lib/storage/zustandMMKVAdapter";

// ===== TYPES =====

interface User {
  id: number;
  name: string;
  email: string;
  clerkId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Additional properties for driver migration
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date | null;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  language?: string;
  currency?: string;
  timezone?: string;
}

interface Address {
  id: string;
  type: "home" | "work" | "gym" | "other";
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
  createdAt: Date;
}

interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  accountVerified: boolean;
  status: "pending" | "approved" | "rejected";
  verificationDate?: Date;
  rejectionReason?: string;
}

interface NotificationPreferences {
  push: boolean;
  sms: boolean;
  email: boolean;
  rideUpdates: boolean;
  promotional: boolean;
  emergencyAlerts: boolean;
}

interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  theme: "light" | "dark" | "auto";
  notifications: NotificationPreferences;
}

interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "paypal";
  last4?: string;
  brand?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
  createdAt: Date;
}

interface UserStore {
  // ===== AUTHENTICATION (existing) =====
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // ===== PROFILE EXTENDED (NEW) =====
  profile: {
    // Saved addresses
    savedAddresses: Address[];
    defaultAddress: Address | null;
    
    // Identity verification
    verification: VerificationStatus;
    
    // User preferences
    preferences: UserPreferences;
    
    // Saved payment methods
    paymentMethods: PaymentMethod[];
    defaultPaymentMethod: string | null;
  };

  // ===== AUTHENTICATION ACTIONS (existing) =====
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  clearUser: () => void;
  refreshUser: () => Promise<void>;

  // ===== PROFILE ACTIONS (NEW) =====
  updateProfile: (updates: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date | null;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }>) => Promise<void>;
  
  // Address actions
  addAddress: (address: Omit<Address, 'id' | 'createdAt'>) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  
  // Preferences actions
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  
  // Payment methods actions
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  
  // Verification actions
  updateEmailVerification: (verified: boolean) => void;
  updatePhoneVerification: (verified: boolean) => void;
  updateAccountVerification: (status: "pending" | "approved" | "rejected", reason?: string) => void;
}

// ===== INITIAL STATE =====

const initialState = {
  // Authentication
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // Profile
  profile: {
    savedAddresses: [],
    defaultAddress: null,
    verification: {
      emailVerified: false,
      phoneVerified: false,
      accountVerified: false,
      status: "pending" as const,
    },
    preferences: {
      language: "en",
      timezone: "UTC",
      currency: "USD",
      theme: "auto" as const,
      notifications: {
        push: true,
        sms: false,
        email: true,
        rideUpdates: true,
        promotional: false,
        emergencyAlerts: true,
      },
    },
    paymentMethods: [],
    defaultPaymentMethod: null,
  },
};

// ===== STORE IMPLEMENTATION =====

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ===== AUTHENTICATION ACTIONS =====
      setUser: (user: User | null) => {
        console.log('[UserStore] setUser called with:', user);
        set(() => ({
          user,
          isAuthenticated: !!user,
          error: null,
        }));
      },

      updateUser: (updates: Partial<User>) => {
        console.log('[UserStore] updateUser called with:', updates);
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
          error: null,
        }));
      },

      setLoading: (loading: boolean) => {
        console.log('[UserStore] setLoading called with:', loading);
        set(() => ({ isLoading: loading }));
      },

      setError: (error: string | null) => {
        console.log('[UserStore] setError called with:', error);
        set(() => ({ error }));
      },

      setAuthenticated: (authenticated: boolean) => {
        console.log('[UserStore] setAuthenticated called with:', authenticated);
        set(() => ({ isAuthenticated: authenticated }));
      },

      clearUser: () => {
        console.log('[UserStore] clearUser called');
        set(() => ({
          ...initialState,
        }));
      },

      refreshUser: async () => {
        const state = get();
        console.log('[UserStore] refreshUser called');

        try {
          state.setLoading(true);
          state.setError(null);

          // Lazy import to avoid circular dependency
          const { getUserProfile } = require("@/lib/auth");
          const result = await getUserProfile();

          if (result.success && result.data) {
            state.setUser(result.data);
          } else {
            state.setError(result.message || "Failed to refresh user");
            state.clearUser();
          }
        } catch (error: any) {
          console.error('[UserStore] Error refreshing user:', error);
          state.setError(error.message || "Failed to refresh user");
          state.clearUser();
        } finally {
          state.setLoading(false);
        }
      },

      // ===== PROFILE ACTIONS =====
      updateProfile: async (updates) => {
        const state = get();
        console.log('[UserStore] updateProfile called with:', updates);

        try {
          state.setLoading(true);
          state.setError(null);

          // Update user data
          state.updateUser(updates);

          // TODO: Call API to update profile
          // const { ProfileService } = require("@/lib/api");
          // await ProfileService.updateProfile(updates);

          console.log('[UserStore] Profile updated successfully');
        } catch (error: any) {
          console.error('[UserStore] Error updating profile:', error);
          state.setError(error.message || "Failed to update profile");
        } finally {
          state.setLoading(false);
        }
      },

      // Address actions
      addAddress: async (addressData) => {
        const state = get();
        console.log('[UserStore] addAddress called with:', addressData);

        try {
          state.setLoading(true);
          state.setError(null);

          const newAddress: Address = {
            ...addressData,
            id: `addr_${Date.now()}`,
            createdAt: new Date(),
          };

          set((state) => ({
            profile: {
              ...state.profile,
              savedAddresses: [...state.profile.savedAddresses, newAddress],
            },
          }));

          console.log('[UserStore] Address added successfully');
        } catch (error: any) {
          console.error('[UserStore] Error adding address:', error);
          state.setError(error.message || "Failed to add address");
        } finally {
          state.setLoading(false);
        }
      },

      updateAddress: async (id, updates) => {
        const state = get();
        console.log('[UserStore] updateAddress called with id:', id, 'updates:', updates);

        try {
          state.setLoading(true);
          state.setError(null);

          set((state) => ({
            profile: {
              ...state.profile,
              savedAddresses: state.profile.savedAddresses.map(addr =>
                addr.id === id ? { ...addr, ...updates } : addr
              ),
            },
          }));

          console.log('[UserStore] Address updated successfully');
        } catch (error: any) {
          console.error('[UserStore] Error updating address:', error);
          state.setError(error.message || "Failed to update address");
        } finally {
          state.setLoading(false);
        }
      },

      deleteAddress: async (id) => {
        const state = get();
        console.log('[UserStore] deleteAddress called with id:', id);

        try {
          state.setLoading(true);
          state.setError(null);

          set((state) => ({
            profile: {
              ...state.profile,
              savedAddresses: state.profile.savedAddresses.filter(addr => addr.id !== id),
              defaultAddress: state.profile.defaultAddress?.id === id ? null : state.profile.defaultAddress,
            },
          }));

          console.log('[UserStore] Address deleted successfully');
        } catch (error: any) {
          console.error('[UserStore] Error deleting address:', error);
          state.setError(error.message || "Failed to delete address");
        } finally {
          state.setLoading(false);
        }
      },

      setDefaultAddress: async (id) => {
        const state = get();
        console.log('[UserStore] setDefaultAddress called with id:', id);

        try {
          state.setLoading(true);
          state.setError(null);

          const address = state.profile.savedAddresses.find(addr => addr.id === id);
          if (!address) {
            throw new Error("Address not found");
          }

          set((state) => ({
            profile: {
              ...state.profile,
              savedAddresses: state.profile.savedAddresses.map(addr => ({
                ...addr,
                isDefault: addr.id === id,
              })),
              defaultAddress: address,
            },
          }));

          console.log('[UserStore] Default address set successfully');
        } catch (error: any) {
          console.error('[UserStore] Error setting default address:', error);
          state.setError(error.message || "Failed to set default address");
        } finally {
          state.setLoading(false);
        }
      },

      // Preferences actions
      updatePreferences: async (prefs) => {
        const state = get();
        console.log('[UserStore] updatePreferences called with:', prefs);

        try {
          state.setLoading(true);
          state.setError(null);

          set((state) => ({
            profile: {
              ...state.profile,
              preferences: { ...state.profile.preferences, ...prefs },
            },
          }));

          console.log('[UserStore] Preferences updated successfully');
        } catch (error: any) {
          console.error('[UserStore] Error updating preferences:', error);
          state.setError(error.message || "Failed to update preferences");
        } finally {
          state.setLoading(false);
        }
      },

      // Payment methods actions
      addPaymentMethod: async (methodData) => {
        const state = get();
        console.log('[UserStore] addPaymentMethod called with:', methodData);

        try {
          state.setLoading(true);
          state.setError(null);

          const newMethod: PaymentMethod = {
            ...methodData,
            id: `pm_${Date.now()}`,
            createdAt: new Date(),
          };

          set((state) => ({
            profile: {
              ...state.profile,
              paymentMethods: [...state.profile.paymentMethods, newMethod],
            },
          }));

          console.log('[UserStore] Payment method added successfully');
        } catch (error: any) {
          console.error('[UserStore] Error adding payment method:', error);
          state.setError(error.message || "Failed to add payment method");
        } finally {
          state.setLoading(false);
        }
      },

      removePaymentMethod: async (id) => {
        const state = get();
        console.log('[UserStore] removePaymentMethod called with id:', id);

        try {
          state.setLoading(true);
          state.setError(null);

          set((state) => ({
            profile: {
              ...state.profile,
              paymentMethods: state.profile.paymentMethods.filter(pm => pm.id !== id),
              defaultPaymentMethod: state.profile.defaultPaymentMethod === id ? null : state.profile.defaultPaymentMethod,
            },
          }));

          console.log('[UserStore] Payment method removed successfully');
        } catch (error: any) {
          console.error('[UserStore] Error removing payment method:', error);
          state.setError(error.message || "Failed to remove payment method");
        } finally {
          state.setLoading(false);
        }
      },

      setDefaultPaymentMethod: async (id) => {
        const state = get();
        console.log('[UserStore] setDefaultPaymentMethod called with id:', id);

        try {
          state.setLoading(true);
          state.setError(null);

          const method = state.profile.paymentMethods.find(pm => pm.id === id);
          if (!method) {
            throw new Error("Payment method not found");
          }

          set((state) => ({
            profile: {
              ...state.profile,
              paymentMethods: state.profile.paymentMethods.map(pm => ({
                ...pm,
                isDefault: pm.id === id,
              })),
              defaultPaymentMethod: id,
            },
          }));

          console.log('[UserStore] Default payment method set successfully');
        } catch (error: any) {
          console.error('[UserStore] Error setting default payment method:', error);
          state.setError(error.message || "Failed to set default payment method");
        } finally {
          state.setLoading(false);
        }
      },

      // Verification actions
      updateEmailVerification: (verified) => {
        console.log('[UserStore] updateEmailVerification called with:', verified);
        set((state) => ({
          profile: {
            ...state.profile,
            verification: { ...state.profile.verification, emailVerified: verified },
          },
        }));
      },

      updatePhoneVerification: (verified) => {
        console.log('[UserStore] updatePhoneVerification called with:', verified);
        set((state) => ({
          profile: {
            ...state.profile,
            verification: { ...state.profile.verification, phoneVerified: verified },
          },
        }));
      },

      updateAccountVerification: (status, reason) => {
        console.log('[UserStore] updateAccountVerification called with:', status, reason);
        set((state) => ({
          profile: {
            ...state.profile,
            verification: {
              ...state.profile.verification,
              accountVerified: status === "approved",
              status,
              rejectionReason: reason,
              verificationDate: status === "approved" ? new Date() : undefined,
            },
          },
        }));
      },
    }),
    {
      name: 'user-store',
      storage: mmkvStorage as any,
      partialize: (state) => ({
        // Only persist essential data, not loading states or errors
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        profile: state.profile,
      } as any),
    }
  )
);

// ===== OPTIMIZED SELECTORS =====
// These selectors prevent unnecessary re-renders by only returning the specific data that components need

export const useUser = () => useUserStore((state) => state.user);
export const useUserId = () => useUserStore((state) => state.user?.id);
export const useUserName = () => useUserStore((state) => state.user?.name);
export const useUserEmail = () => useUserStore((state) => state.user?.email);
export const useIsAuthenticated = () =>
  useUserStore((state) => state.isAuthenticated);
export const useIsLoading = () => useUserStore((state) => state.isLoading);
export const useUserError = () => useUserStore((state) => state.error);

// Combined selectors for common use cases
export const useUserBasicInfo = () =>
  useUserStore((state) => ({
    id: state.user?.id,
    name: state.user?.name,
    email: state.user?.email,
  }));

export const useAuthStatus = () =>
  useUserStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
  }));

// Derived state selectors (computed values)
export const useIsUserComplete = () =>
  useUserStore((state) => {
    const user = state.user;
    return !!(user?.name && user?.email && user?.id);
  });

// ===== PROFILE SELECTORS (NEW) =====

// Address selectors
export const useSavedAddresses = () => useUserStore((state) => state.profile.savedAddresses);
export const useDefaultAddress = () => useUserStore((state) => state.profile.defaultAddress);
export const useHasSavedAddresses = () => useUserStore((state) => state.profile.savedAddresses.length > 0);

// Verification selectors
export const useVerificationStatus = () => useUserStore((state) => state.profile.verification);
export const useIsEmailVerified = () => useUserStore((state) => state.profile.verification.emailVerified);
export const useIsPhoneVerified = () => useUserStore((state) => state.profile.verification.phoneVerified);
export const useIsAccountVerified = () => useUserStore((state) => state.profile.verification.accountVerified);

// Preferences selectors
export const useUserPreferences = () => useUserStore((state) => state.profile.preferences);
export const useUserTheme = () => useUserStore((state) => state.profile.preferences.theme);
export const useUserLanguage = () => useUserStore((state) => state.profile.preferences.language);
export const useUserCurrency = () => useUserStore((state) => state.profile.preferences.currency);
export const useUserTimezone = () => useUserStore((state) => state.profile.preferences.timezone);
export const useNotificationPreferences = () => useUserStore((state) => state.profile.preferences.notifications);

// Payment methods selectors
export const usePaymentMethods = () => useUserStore((state) => state.profile.paymentMethods);
export const useDefaultPaymentMethod = () => useUserStore((state) => state.profile.defaultPaymentMethod);
export const useHasPaymentMethods = () => useUserStore((state) => state.profile.paymentMethods.length > 0);

// Combined profile selectors
export const useUserProfile = () => useUserStore((state) => ({
  user: state.user,
  addresses: state.profile.savedAddresses,
  verification: state.profile.verification,
  preferences: state.profile.preferences,
  paymentMethods: state.profile.paymentMethods,
}));

export const useUserFullData = () => useUserStore((state) => ({
  ...state.user,
  profile: state.profile,
}));

export const useUserDisplayName = () =>
  useUserStore((state) => {
    const user = state.user;
    return user?.name || user?.email?.split("@")[0] || "User";
  });

// Action selectors (for components that only need actions)
export const useUserActions = () =>
  useUserStore((state) => ({
    setUser: state.setUser,
    updateUser: state.updateUser,
    clearUser: state.clearUser,
    refreshUser: state.refreshUser,
  }));
