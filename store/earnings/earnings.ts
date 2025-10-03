import { create } from "zustand";

// Types for Earnings
export interface DailyEarnings {
  date: string;
  totalEarnings: number;
  totalRides: number;
  totalTime: number; // in minutes
  totalDistance: number; // in km
  baseFare: number;
  timeFare: number;
  distanceFare: number;
  surgeMultiplier: number;
  tips: number;
  bonuses: number;
  tolls: number;
  fees: number;
}

export interface WeeklyEarnings {
  weekStart: string;
  weekEnd: string;
  totalEarnings: number;
  totalRides: number;
  totalTime: number;
  totalDistance: number;
  dailyBreakdown: DailyEarnings[];
}

export interface MonthlyEarnings {
  month: string;
  year: number;
  totalEarnings: number;
  totalRides: number;
  totalTime: number;
  totalDistance: number;
  weeklyBreakdown: WeeklyEarnings[];
}

export interface RideEarning {
  rideId: string;
  date: Date;
  passengerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  distance: number;
  duration: number;
  baseFare: number;
  timeFare: number;
  distanceFare: number;
  surgeMultiplier: number;
  tip: number;
  bonus: number;
  tolls: number;
  fees: number;
  totalEarnings: number;
  rating: number;
}

export interface Transaction {
  id: string;
  type: "ride" | "bonus" | "tip" | "adjustment" | "instant_pay" | "weekly_pay";
  amount: number;
  description: string;
  date: Date;
  status: "pending" | "completed" | "failed";
  reference?: string;
}

export interface HourlyEarnings {
  hour: number; // 0-23
  earnings: number;
  rides: number;
  averageEarningsPerRide: number;
}

export interface PeakHour {
  hour: number;
  multiplier: number;
  demand: "low" | "medium" | "high" | "surge";
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: "challenge" | "bonus" | "surge" | "guarantee";
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  requirements?: {
    minRides?: number;
    minEarnings?: number;
    specificHours?: number[];
    specificZones?: string[];
  };
  reward: {
    type: "fixed" | "percentage" | "multiplier";
    amount: number;
  };
  progress?: {
    current: number;
    target: number;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  requirements: {
    minRides: number;
    timeWindow: number; // in hours
    specificZones?: string[];
  };
  reward: number;
  progress: {
    currentRides: number;
    targetRides: number;
  };
  isCompleted: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "bank_account" | "debit_card";
  lastFour: string;
  bankName?: string;
  isDefault: boolean;
}

export interface InstantPayRequest {
  amount: number;
  paymentMethodId: string;
  fee: number;
  netAmount: number;
  estimatedArrival: Date;
}

// Earnings Store Interface
interface EarningsStore {
  // State
  dailyEarnings: DailyEarnings | null;
  weeklyEarnings: WeeklyEarnings | null;
  monthlyEarnings: MonthlyEarnings | null;
  rideDetails: RideEarning[];
  transactionHistory: Transaction[];
  hourlyEarnings: HourlyEarnings[];
  peakHours: PeakHour[];
  activePromotions: Promotion[];
  completedChallenges: Challenge[];
  instantPayAvailable: boolean;
  instantPayFee: number;
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDailyEarnings: (date: string) => Promise<void>;
  fetchWeeklyEarnings: (weekStart: string) => Promise<void>;
  fetchMonthlyEarnings: (month: string, year: number) => Promise<void>;
  fetchRideDetails: (date: string) => Promise<void>;
  fetchTransactionHistory: (limit?: number) => Promise<void>;
  fetchHourlyEarnings: (date: string) => Promise<void>;
  fetchPeakHours: () => Promise<void>;
  fetchActivePromotions: () => Promise<void>;
  fetchCompletedChallenges: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;

  // Instant Pay
  requestInstantPay: (request: InstantPayRequest) => Promise<void>;
  checkInstantPayAvailability: () => Promise<void>;

  // Promotions and Challenges
  joinChallenge: (challengeId: string) => Promise<void>;
  claimPromotion: (promotionId: string) => Promise<void>;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useEarningsStore = create<EarningsStore>((set, get) => ({
  // Initial State
  dailyEarnings: {
    date: new Date().toISOString().split("T")[0],
    totalEarnings: 144.5,
    totalRides: 12,
    totalTime: 510, // 8.5 hours in minutes
    totalDistance: 45.2,
    baseFare: 120.0,
    timeFare: 15.5,
    distanceFare: 9.0,
    surgeMultiplier: 1.0,
    tips: 18.0,
    bonuses: 0,
    tolls: 5.0,
    fees: 12.0,
  },
  weeklyEarnings: {
    weekStart: "2024-01-15",
    weekEnd: "2024-01-21",
    totalEarnings: 892.3,
    totalRides: 67,
    totalTime: 2712, // 45.2 hours in minutes
    totalDistance: 234.5,
    dailyBreakdown: [],
  },
  monthlyEarnings: {
    month: "January",
    year: 2024,
    totalEarnings: 3245.8,
    totalRides: 234,
    totalTime: 9397, // 156.7 hours in minutes
    totalDistance: 1245.8,
    weeklyBreakdown: [],
  },
  rideDetails: [],
  transactionHistory: [],
  hourlyEarnings: [],
  peakHours: [],
  activePromotions: [],
  completedChallenges: [],
  instantPayAvailable: false,
  instantPayFee: 0.5, // $0.50 fee
  paymentMethods: [],
  isLoading: false,
  error: null,

  // Actions
  fetchDailyEarnings: async (date: string) => {
    console.log("[EarningsStore] Fetching daily earnings for:", date);
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockEarnings: DailyEarnings = {
        date,
        totalEarnings: 144.5,
        totalRides: 12,
        totalTime: 480, // 8 hours
        totalDistance: 120.5,
        baseFare: 96.0,
        timeFare: 24.0,
        distanceFare: 18.5,
        surgeMultiplier: 1.2,
        tips: 15.0,
        bonuses: 8.0,
        tolls: 3.5,
        fees: 12.5,
      };

      set(() => ({ dailyEarnings: mockEarnings }));
    } catch (error) {
      console.error("[EarningsStore] Error fetching daily earnings:", error);
      state.setError(
        (error as Error).message || "Failed to fetch daily earnings",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchWeeklyEarnings: async (weekStart: string) => {
    console.log("[EarningsStore] Fetching weekly earnings for:", weekStart);
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockWeeklyEarnings: WeeklyEarnings = {
        weekStart,
        weekEnd: new Date(
          new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .split("T")[0],
        totalEarnings: 1012.75,
        totalRides: 84,
        totalTime: 3360, // 56 hours
        totalDistance: 843.5,
        dailyBreakdown: [], // Will be populated with daily data
      };

      set(() => ({ weeklyEarnings: mockWeeklyEarnings }));
    } catch (error) {
      console.error("[EarningsStore] Error fetching weekly earnings:", error);
      state.setError(
        (error as Error).message || "Failed to fetch weekly earnings",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchMonthlyEarnings: async (month: string, year: number) => {
    console.log("[EarningsStore] Fetching monthly earnings for:", month, year);
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockMonthlyEarnings: MonthlyEarnings = {
        month,
        year,
        totalEarnings: 4250.3,
        totalRides: 352,
        totalTime: 14080, // 234.67 hours
        totalDistance: 3520.8,
        weeklyBreakdown: [], // Will be populated with weekly data
      };

      set(() => ({ monthlyEarnings: mockMonthlyEarnings }));
    } catch (error) {
      console.error("[EarningsStore] Error fetching monthly earnings:", error);
      state.setError(
        (error as Error).message || "Failed to fetch monthly earnings",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchRideDetails: async (date: string) => {
    console.log("[EarningsStore] Fetching ride details for:", date);
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockRideDetails: RideEarning[] = [
        {
          rideId: "ride_001",
          date: new Date(),
          passengerName: "John Doe",
          pickupLocation: "Downtown",
          dropoffLocation: "Airport",
          distance: 15.2,
          duration: 25,
          baseFare: 8.0,
          timeFare: 2.5,
          distanceFare: 3.8,
          surgeMultiplier: 1.2,
          tip: 5.0,
          bonus: 0,
          tolls: 2.5,
          fees: 1.25,
          totalEarnings: 12.05,
          rating: 5,
        },
        // Add more mock rides...
      ];

      set(() => ({ rideDetails: mockRideDetails }));
    } catch (error) {
      console.error("[EarningsStore] Error fetching ride details:", error);
      state.setError(
        (error as Error).message || "Failed to fetch ride details",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchTransactionHistory: async (limit = 50) => {
    console.log("[EarningsStore] Fetching transaction history, limit:", limit);
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockTransactions: Transaction[] = [
        {
          id: "txn_001",
          type: "ride",
          amount: 12.05,
          description: "Ride to Airport",
          date: new Date(),
          status: "completed",
          reference: "ride_001",
        },
        {
          id: "txn_002",
          type: "instant_pay",
          amount: -50.0,
          description: "Instant Pay to Bank Account",
          date: new Date(),
          status: "completed",
          reference: "ip_001",
        },
        // Add more mock transactions...
      ];

      set(() => ({ transactionHistory: mockTransactions }));
    } catch (error) {
      console.error(
        "[EarningsStore] Error fetching transaction history:",
        error,
      );
      state.setError(
        (error as Error).message || "Failed to fetch transaction history",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchHourlyEarnings: async (date: string) => {
    console.log("[EarningsStore] Fetching hourly earnings for:", date);
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockHourlyEarnings: HourlyEarnings[] = Array.from(
        { length: 24 },
        (_, hour) => ({
          hour,
          earnings: Math.random() * 20,
          rides: Math.floor(Math.random() * 5),
          averageEarningsPerRide: Math.random() * 15,
        }),
      );

      set(() => ({ hourlyEarnings: mockHourlyEarnings }));
    } catch (error) {
      console.error("[EarningsStore] Error fetching hourly earnings:", error);
      state.setError(
        (error as Error).message || "Failed to fetch hourly earnings",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchPeakHours: async () => {
    console.log("[EarningsStore] Fetching peak hours");
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockPeakHours: PeakHour[] = [
        { hour: 7, multiplier: 1.5, demand: "high" },
        { hour: 8, multiplier: 2.0, demand: "surge" },
        { hour: 17, multiplier: 1.8, demand: "high" },
        { hour: 18, multiplier: 2.2, demand: "surge" },
      ];

      set(() => ({ peakHours: mockPeakHours }));
    } catch (error) {
      console.error("[EarningsStore] Error fetching peak hours:", error);
      state.setError((error as Error).message || "Failed to fetch peak hours");
    } finally {
      state.setLoading(false);
    }
  },

  fetchActivePromotions: async () => {
    console.log("[EarningsStore] Fetching active promotions");
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockPromotions: Promotion[] = [
        {
          id: "promo_001",
          title: "Weekend Warrior",
          description: "Complete 20 rides this weekend for a $50 bonus",
          type: "challenge",
          startDate: new Date(),
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          isActive: true,
          requirements: {
            minRides: 20,
            specificHours: [18, 19, 20, 21, 22, 23],
          },
          reward: {
            type: "fixed",
            amount: 50,
          },
          progress: {
            current: 12,
            target: 20,
          },
        },
      ];

      set(() => ({ activePromotions: mockPromotions }));
    } catch (error) {
      console.error("[EarningsStore] Error fetching active promotions:", error);
      state.setError(
        (error as Error).message || "Failed to fetch active promotions",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchCompletedChallenges: async () => {
    console.log("[EarningsStore] Fetching completed challenges");
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockChallenges: Challenge[] = [
        {
          id: "challenge_001",
          title: "Early Bird",
          description: "Complete 10 rides before 9 AM",
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isActive: false,
          requirements: {
            minRides: 10,
            timeWindow: 3, // 6 AM to 9 AM
          },
          reward: 25,
          progress: {
            currentRides: 10,
            targetRides: 10,
          },
          isCompleted: true,
        },
      ];

      set(() => ({ completedChallenges: mockChallenges }));
    } catch (error) {
      console.error(
        "[EarningsStore] Error fetching completed challenges:",
        error,
      );
      state.setError(
        (error as Error).message || "Failed to fetch completed challenges",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchPaymentMethods: async () => {
    console.log("[EarningsStore] Fetching payment methods");
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: "pm_001",
          type: "bank_account",
          lastFour: "1234",
          bankName: "Chase Bank",
          isDefault: true,
        },
        {
          id: "pm_002",
          type: "debit_card",
          lastFour: "5678",
          isDefault: false,
        },
      ];

      set(() => ({ paymentMethods: mockPaymentMethods }));
    } catch (error) {
      console.error("[EarningsStore] Error fetching payment methods:", error);
      state.setError(
        (error as Error).message || "Failed to fetch payment methods",
      );
    } finally {
      state.setLoading(false);
    }
  },

  requestInstantPay: async (request: InstantPayRequest) => {
    console.log("[EarningsStore] Requesting instant pay:", request);
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Add transaction to history
      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: "instant_pay",
        amount: -request.amount,
        description: `Instant Pay to ${request.paymentMethodId}`,
        date: new Date(),
        status: "completed",
        reference: `ip_${Date.now()}`,
      };

      set((state) => ({
        transactionHistory: [newTransaction, ...state.transactionHistory],
      }));

      console.log("[EarningsStore] Instant pay request completed");
    } catch (error) {
      console.error("[EarningsStore] Error requesting instant pay:", error);
      state.setError(
        (error as Error).message || "Failed to request instant pay",
      );
    } finally {
      state.setLoading(false);
    }
  },

  checkInstantPayAvailability: async () => {
    console.log("[EarningsStore] Checking instant pay availability");
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      set(() => ({
        instantPayAvailable: true,
        instantPayFee: 0.5,
      }));
    } catch (error) {
      console.error(
        "[EarningsStore] Error checking instant pay availability:",
        error,
      );
      state.setError(
        (error as Error).message || "Failed to check instant pay availability",
      );
    } finally {
      state.setLoading(false);
    }
  },

  joinChallenge: async (challengeId: string) => {
    console.log("[EarningsStore] Joining challenge:", challengeId);
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(
        "[EarningsStore] Successfully joined challenge:",
        challengeId,
      );
    } catch (error) {
      console.error("[EarningsStore] Error joining challenge:", error);
      state.setError((error as Error).message || "Failed to join challenge");
    } finally {
      state.setLoading(false);
    }
  },

  claimPromotion: async (promotionId: string) => {
    console.log("[EarningsStore] Claiming promotion:", promotionId);
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(
        "[EarningsStore] Successfully claimed promotion:",
        promotionId,
      );
    } catch (error) {
      console.error("[EarningsStore] Error claiming promotion:", error);
      state.setError((error as Error).message || "Failed to claim promotion");
    } finally {
      state.setLoading(false);
    }
  },

  // Utility Actions
  setLoading: (loading: boolean) => {
    console.log("[EarningsStore] Setting loading:", loading);
    set(() => ({ isLoading: loading }));
  },

  setError: (error: string | null) => {
    console.log("[EarningsStore] Setting error:", error);
    set(() => ({ error }));
  },

  clearError: () => {
    console.log("[EarningsStore] Clearing error");
    set(() => ({ error: null }));
  },
}));
