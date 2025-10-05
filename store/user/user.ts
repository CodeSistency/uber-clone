import { create } from "zustand";

// User Store Interface
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

interface UserStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  clearUser: () => void;
  refreshUser: () => Promise<void>;
}

// User Store Implementation
export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  setUser: (user: User | null) => {
    set(() => ({
      user,
      isAuthenticated: !!user,
      error: null,
    }));
  },

  updateUser: (updates: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
      error: null,
    }));
  },

  setLoading: (loading: boolean) => {
    set(() => ({ isLoading: loading }));
  },

  setError: (error: string | null) => {
    set(() => ({ error }));
  },

  setAuthenticated: (authenticated: boolean) => {
    set(() => ({ isAuthenticated: authenticated }));
  },

  clearUser: () => {
    set(() => ({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
    }));
  },

  refreshUser: async () => {
    const state = get();

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
    } catch (error) {
      
      state.setError(error instanceof Error ? error.message : "Unknown error");
      state.clearUser();
    } finally {
      state.setLoading(false);
    }
  },
}));

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
