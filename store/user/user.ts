import { create } from "zustand";

// User Store Interface
interface User {
  id: number;
  name: string;
  email: string;
  clerkId?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
    console.log("[UserStore] 👤 setUser called with:", user);
    set(() => ({
      user,
      isAuthenticated: !!user,
      error: null
    }));
  },

  updateUser: (updates: Partial<User>) => {
    console.log("[UserStore] 🔄 updateUser called with:", updates);
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
      error: null
    }));
  },

  setLoading: (loading: boolean) => {
    console.log("[UserStore] ⏳ setLoading called with:", loading);
    set(() => ({ isLoading: loading }));
  },

  setError: (error: string | null) => {
    console.log("[UserStore] ❌ setError called with:", error);
    set(() => ({ error }));
  },

  setAuthenticated: (authenticated: boolean) => {
    console.log("[UserStore] 🔐 setAuthenticated called with:", authenticated);
    set(() => ({ isAuthenticated: authenticated }));
  },

  clearUser: () => {
    console.log("[UserStore] 🗑️ clearUser called");
    set(() => ({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false
    }));
  },

  refreshUser: async () => {
    console.log("[UserStore] 🔄 refreshUser called");
    const state = get();

    try {
      state.setLoading(true);
      state.setError(null);

      // Lazy import to avoid circular dependency
      const { getUserProfile } = require("@/lib/auth");
      const result = await getUserProfile();

      if (result.success && result.data) {
        console.log("[UserStore] ✅ User refreshed successfully:", result.data);
        state.setUser(result.data);
      } else {
        console.log("[UserStore] ❌ Failed to refresh user:", result.message);
        state.setError(result.message || "Failed to refresh user");
        state.clearUser();
      }
    } catch (error) {
      console.error("[UserStore] 💥 Error refreshing user:", error);
      state.setError(error instanceof Error ? error.message : "Unknown error");
      state.clearUser();
    } finally {
      state.setLoading(false);
    }
  },
}));
