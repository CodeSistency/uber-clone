import { create } from "zustand";
import type {
  EarningsSummary,
  TripEarning,
  Promotion,
  Challenge,
} from "@/types/driver";
import { earningsService } from "@/app/services/earningsService";

interface DriverEarningsState {
  // Estado de ganancias
  earningsSummary: EarningsSummary | null;
  tripHistory: TripEarning[];
  promotions: Promotion[];
  challenges: Challenge[];

  // Estado de filtros y visualización
  selectedPeriod: "today" | "week" | "month" | "total";
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };

  // Estados de carga y error
  isLoading: boolean;
  error: string | null;

  // Estadísticas calculadas
  totalEarnings: number;
  totalTrips: number;
  averagePerTrip: number;

  // Acciones
  fetchEarningsSummary: (
    period?: "today" | "week" | "month" | "total",
  ) => Promise<void>;
  fetchTripHistory: (limit?: number, offset?: number) => Promise<void>;
  fetchPromotions: () => Promise<void>;
  fetchChallenges: () => Promise<void>;
  setSelectedPeriod: (period: "today" | "week" | "month" | "total") => void;
  setDateRange: (startDate: Date | null, endDate: Date | null) => void;
  refreshEarnings: () => Promise<void>;

  // Utilidades
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useDriverEarningsStore = create<DriverEarningsState>(
  (set, get) => ({
    // Estado inicial
    earningsSummary: null,
    tripHistory: [],
    promotions: [],
    challenges: [],
    selectedPeriod: "today",
    dateRange: {
      startDate: null,
      endDate: null,
    },
    isLoading: false,
    error: null,
    totalEarnings: 0,
    totalTrips: 0,
    averagePerTrip: 0,

    // Acciones
    fetchEarningsSummary: async (period = "today") => {
      const state = get();
      

      try {
        state.setLoading(true);
        state.setError(null);

        // Real API call
        const summary = await earningsService.getEarningsSummary();

        // Calculate totals from real API response
        const totalEarnings = Object.values(summary).reduce(
          (sum, period) => sum + period.earnings,
          0,
        );
        const totalTrips = Object.values(summary).reduce(
          (sum, period) => sum + period.rides,
          0,
        );
        const averagePerTrip = totalTrips > 0 ? totalEarnings / totalTrips : 0;

        set({
          earningsSummary: {
            ...summary,
            totalEarnings,
            todayEarnings: summary.today?.earnings || 0,
            weekEarnings: summary.week?.earnings || 0,
            monthEarnings: summary.month?.earnings || 0,
            completedTrips: totalTrips,
            averageEarningsPerTrip: averagePerTrip,
            bonuses: 0,
            tips: 0,
          },
          totalEarnings,
          totalTrips,
          averagePerTrip,
        });

        
      } catch (error: any) {
        
        state.setError(error.message || "Failed to fetch earnings summary");
        throw error;
      } finally {
        state.setLoading(false);
      }
    },

    fetchTripHistory: async (limit = 50, offset = 0) => {
      const state = get();
      

      try {
        state.setLoading(true);
        state.setError(null);

        // Real API call using earningsService
        const trips = await earningsService.getTripHistory("week");

        // Validate response
        if (!Array.isArray(trips)) {
          throw new Error("Invalid response format from trip history API");
        }

        // Update state with API response
        set({ tripHistory: trips as any });
        
      } catch (error: any) {
        

        // Enhanced error handling with specific messages
        let errorMessage = "Failed to fetch trip history";
        if (error.message) {
          errorMessage = error.message;
        } else if (error.statusCode === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (error.statusCode === 403) {
          errorMessage = "You don't have permission to view trip history";
        } else if (error.statusCode >= 500) {
          errorMessage = "Server error. Please try again later.";
        }

        state.setError(errorMessage);
        throw error;
      } finally {
        state.setLoading(false);
      }
    },

    fetchPromotions: async () => {
      const state = get();
      

      try {
        state.setLoading(true);
        state.setError(null);

        // Real API call using earningsService
        const promotions = await earningsService.getActivePromotions();

        // Validate response
        if (!Array.isArray(promotions)) {
          throw new Error("Invalid response format from promotions API");
        }

        // Update state with API response
        set({ promotions: promotions as any });
        
      } catch (error: any) {
        

        // Enhanced error handling with specific messages
        let errorMessage = "Failed to fetch promotions";
        if (error.message) {
          errorMessage = error.message;
        } else if (error.statusCode === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (error.statusCode === 403) {
          errorMessage = "You don't have permission to view promotions";
        } else if (error.statusCode >= 500) {
          errorMessage = "Server error. Please try again later.";
        }

        state.setError(errorMessage);
        throw error;
      } finally {
        state.setLoading(false);
      }
    },

    fetchChallenges: async () => {
      const state = get();
      

      try {
        state.setLoading(true);
        state.setError(null);

        // Real API call using earningsService
        const challenges = await earningsService.getActiveChallenges();

        // Validate response
        if (!Array.isArray(challenges)) {
          throw new Error("Invalid response format from challenges API");
        }

        // Update state with API response
        set({ challenges: challenges as any });
        
      } catch (error: any) {
        

        // Enhanced error handling with specific messages
        let errorMessage = "Failed to fetch challenges";
        if (error.message) {
          errorMessage = error.message;
        } else if (error.statusCode === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (error.statusCode === 403) {
          errorMessage = "You don't have permission to view challenges";
        } else if (error.statusCode >= 500) {
          errorMessage = "Server error. Please try again later.";
        }

        state.setError(errorMessage);
        throw error;
      } finally {
        state.setLoading(false);
      }
    },

    setSelectedPeriod: (period) => {
      
      set({ selectedPeriod: period });
    },

    setDateRange: (startDate, endDate) => {
      
      set({
        dateRange: {
          startDate,
          endDate,
        },
      });
    },

    refreshEarnings: async () => {
      const state = get();
      

      try {
        state.setLoading(true);
        state.setError(null);

        // Refresh all earnings data
        await Promise.all([
          state.fetchEarningsSummary(state.selectedPeriod),
          state.fetchTripHistory(),
          state.fetchPromotions(),
          state.fetchChallenges(),
        ]);

        
      } catch (error: any) {
        
        state.setError(error.message || "Failed to refresh earnings");
        throw error;
      } finally {
        state.setLoading(false);
      }
    },

    // Utilidades
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),
  }),
);
