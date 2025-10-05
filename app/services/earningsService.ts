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
      
      const response = await fetchAPI("driver/earnings/summary", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Trip History
  async getTripHistory(
    period: "today" | "week" | "month" | "all" = "week",
  ): Promise<TripEarning[]> {
    try {
      
      const response = await fetchAPI(
        `driver/earnings/trips?period=${period}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async getTripDetails(tripId: string): Promise<TripEarning> {
    try {
      
      const response = await fetchAPI(`driver/earnings/trips/${tripId}`, {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Promotions
  async getActivePromotions(): Promise<Promotion[]> {
    try {
      
      const response = await fetchAPI("driver/earnings/promotions/active", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async getAllPromotions(): Promise<Promotion[]> {
    try {
      
      const response = await fetchAPI("driver/earnings/promotions", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async getPromotionDetails(promotionId: string): Promise<Promotion> {
    try {
      
      const response = await fetchAPI(
        `driver/earnings/promotions/${promotionId}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Challenges
  async getActiveChallenges(): Promise<Challenge[]> {
    try {
      
      const response = await fetchAPI("driver/earnings/challenges/active", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async getAllChallenges(): Promise<Challenge[]> {
    try {
      
      const response = await fetchAPI("driver/earnings/challenges", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async getChallengeDetails(challengeId: string): Promise<Challenge> {
    try {
      
      const response = await fetchAPI(
        `driver/earnings/challenges/${challengeId}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      
      const response = await fetchAPI("driver/earnings/payment-methods", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async addPaymentMethod(
    paymentMethod: Omit<PaymentMethod, "id" | "isVerified">,
  ): Promise<PaymentMethod> {
    try {
      
      const response = await fetchAPI("driver/earnings/payment-methods", {
        method: "POST",
        body: JSON.stringify(paymentMethod),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async updatePaymentMethod(
    paymentMethodId: string,
    updates: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    try {
      
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
      
      throw error;
    }
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      
      await fetchAPI(`driver/earnings/payment-methods/${paymentMethodId}`, {
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }

  // Instant Pay
  async requestInstantPay(
    request: InstantPayRequest,
  ): Promise<InstantPayResult> {
    try {
      
      const response = await fetchAPI("driver/earnings/instant-pay", {
        method: "POST",
        body: JSON.stringify(request),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async getInstantPayHistory(): Promise<InstantPayResult[]> {
    try {
      
      const response = await fetchAPI("driver/earnings/instant-pay/history", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
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
      
      const response = await fetchAPI(
        `driver/earnings/analytics?period=${period}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      
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
      
      const response = await fetchAPI("driver/earnings/weekly-summary", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }
}

// Export singleton instance
export const earningsService = new EarningsService();
