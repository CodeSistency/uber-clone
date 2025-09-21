import { fetchAPI } from "@/lib/fetch";

// Types for Earnings Service
export interface EarningsSummary {
  today: {
    rides: number;
    earnings: number;
    hours: number;
    averagePerRide: number;
  };
  week: {
    rides: number;
    earnings: number;
    hours: number;
    averagePerRide: number;
  };
  month: {
    rides: number;
    earnings: number;
    hours: number;
    averagePerRide: number;
  };
  total: {
    rides: number;
    earnings: number;
    hours: number;
    averagePerRide: number;
  };
}

export interface TripEarning {
  id: string;
  date: Date;
  passengerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
  tip: number;
  bonus: number;
  total: number;
  duration: number;
  distance: number;
  serviceType: string;
  rating: number;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: "bonus" | "multiplier" | "guarantee" | "challenge";
  value: number;
  target: number;
  progress: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  requirements: string[];
  reward: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  category: "rides" | "earnings" | "hours" | "rating";
}

export interface PaymentMethod {
  id: string;
  type: "bank_account" | "debit_card" | "instant_pay";
  lastFour: string;
  bankName?: string;
  isDefault: boolean;
  isVerified: boolean;
}

export interface InstantPayRequest {
  amount: number;
  paymentMethodId: string;
  fee: number;
  totalAmount: number;
}

export interface InstantPayResult {
  success: boolean;
  transactionId?: string;
  amount: number;
  fee: number;
  totalAmount: number;
  estimatedArrival: Date;
  status: "processing" | "completed" | "failed";
}

export class EarningsService {
  // Earnings Summary
  async getEarningsSummary(): Promise<EarningsSummary> {
    try {
      console.log("[EarningsService] Fetching earnings summary");
      const response = await fetchAPI("driver/earnings/summary", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error(
        "[EarningsService] Error fetching earnings summary:",
        error,
      );
      throw error;
    }
  }

  // Trip History
  async getTripHistory(
    period: "today" | "week" | "month" | "all" = "week",
  ): Promise<TripEarning[]> {
    try {
      console.log(
        "[EarningsService] Fetching trip history for period:",
        period,
      );
      const response = await fetchAPI(
        `driver/earnings/trips?period=${period}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      console.error("[EarningsService] Error fetching trip history:", error);
      throw error;
    }
  }

  async getTripDetails(tripId: string): Promise<TripEarning> {
    try {
      console.log("[EarningsService] Fetching trip details:", tripId);
      const response = await fetchAPI(`driver/earnings/trips/${tripId}`, {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[EarningsService] Error fetching trip details:", error);
      throw error;
    }
  }

  // Promotions
  async getActivePromotions(): Promise<Promotion[]> {
    try {
      console.log("[EarningsService] Fetching active promotions");
      const response = await fetchAPI("driver/earnings/promotions/active", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error(
        "[EarningsService] Error fetching active promotions:",
        error,
      );
      throw error;
    }
  }

  async getAllPromotions(): Promise<Promotion[]> {
    try {
      console.log("[EarningsService] Fetching all promotions");
      const response = await fetchAPI("driver/earnings/promotions", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[EarningsService] Error fetching all promotions:", error);
      throw error;
    }
  }

  async getPromotionDetails(promotionId: string): Promise<Promotion> {
    try {
      console.log("[EarningsService] Fetching promotion details:", promotionId);
      const response = await fetchAPI(
        `driver/earnings/promotions/${promotionId}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      console.error(
        "[EarningsService] Error fetching promotion details:",
        error,
      );
      throw error;
    }
  }

  // Challenges
  async getActiveChallenges(): Promise<Challenge[]> {
    try {
      console.log("[EarningsService] Fetching active challenges");
      const response = await fetchAPI("driver/earnings/challenges/active", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error(
        "[EarningsService] Error fetching active challenges:",
        error,
      );
      throw error;
    }
  }

  async getAllChallenges(): Promise<Challenge[]> {
    try {
      console.log("[EarningsService] Fetching all challenges");
      const response = await fetchAPI("driver/earnings/challenges", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[EarningsService] Error fetching all challenges:", error);
      throw error;
    }
  }

  async getChallengeDetails(challengeId: string): Promise<Challenge> {
    try {
      console.log("[EarningsService] Fetching challenge details:", challengeId);
      const response = await fetchAPI(
        `driver/earnings/challenges/${challengeId}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      console.error(
        "[EarningsService] Error fetching challenge details:",
        error,
      );
      throw error;
    }
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      console.log("[EarningsService] Fetching payment methods");
      const response = await fetchAPI("driver/earnings/payment-methods", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[EarningsService] Error fetching payment methods:", error);
      throw error;
    }
  }

  async addPaymentMethod(
    paymentMethod: Omit<PaymentMethod, "id" | "isVerified">,
  ): Promise<PaymentMethod> {
    try {
      console.log("[EarningsService] Adding payment method:", paymentMethod);
      const response = await fetchAPI("driver/earnings/payment-methods", {
        method: "POST",
        body: JSON.stringify(paymentMethod),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[EarningsService] Error adding payment method:", error);
      throw error;
    }
  }

  async updatePaymentMethod(
    paymentMethodId: string,
    updates: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    try {
      console.log(
        "[EarningsService] Updating payment method:",
        paymentMethodId,
        updates,
      );
      const response = await fetchAPI(
        `driver/earnings/payment-methods/${paymentMethodId}`,
        {
          method: "PUT",
          body: JSON.stringify(updates),
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      console.error("[EarningsService] Error updating payment method:", error);
      throw error;
    }
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      console.log(
        "[EarningsService] Deleting payment method:",
        paymentMethodId,
      );
      await fetchAPI(`driver/earnings/payment-methods/${paymentMethodId}`, {
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      console.error("[EarningsService] Error deleting payment method:", error);
      throw error;
    }
  }

  // Instant Pay
  async requestInstantPay(
    request: InstantPayRequest,
  ): Promise<InstantPayResult> {
    try {
      console.log("[EarningsService] Requesting instant pay:", request);
      const response = await fetchAPI("driver/earnings/instant-pay", {
        method: "POST",
        body: JSON.stringify(request),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[EarningsService] Error requesting instant pay:", error);
      throw error;
    }
  }

  async getInstantPayHistory(): Promise<InstantPayResult[]> {
    try {
      console.log("[EarningsService] Fetching instant pay history");
      const response = await fetchAPI("driver/earnings/instant-pay/history", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error(
        "[EarningsService] Error fetching instant pay history:",
        error,
      );
      throw error;
    }
  }

  // Analytics
  async getEarningsAnalytics(
    period: "week" | "month" | "quarter" | "year" = "month",
  ): Promise<{
    hourlyEarnings: { hour: number; earnings: number }[];
    dailyEarnings: { date: string; earnings: number }[];
    weeklyEarnings: { week: string; earnings: number }[];
    monthlyEarnings: { month: string; earnings: number }[];
    topEarningHours: { hour: number; earnings: number; rides: number }[];
    topEarningDays: { day: string; earnings: number; rides: number }[];
  }> {
    try {
      console.log(
        "[EarningsService] Fetching earnings analytics for period:",
        period,
      );
      const response = await fetchAPI(
        `driver/earnings/analytics?period=${period}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      console.error(
        "[EarningsService] Error fetching earnings analytics:",
        error,
      );
      throw error;
    }
  }

  // Weekly Summary
  async getWeeklySummary(): Promise<{
    week: string;
    rides: number;
    earnings: number;
    hours: number;
    averagePerRide: number;
    averagePerHour: number;
    topDay: string;
    topHour: number;
    promotions: number;
    challenges: number;
  }> {
    try {
      console.log("[EarningsService] Fetching weekly summary");
      const response = await fetchAPI("driver/earnings/weekly-summary", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[EarningsService] Error fetching weekly summary:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const earningsService = new EarningsService();
