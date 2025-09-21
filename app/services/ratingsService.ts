import { fetchAPI } from "@/lib/fetch";

// Types for Ratings Service
export interface Rating {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  rating: number;
  comment?: string;
  timestamp: Date;
  categories: {
    driving: number;
    cleanliness: number;
    communication: number;
    punctuality: number;
    safety: number;
  };
  tags: string[];
  isPublic: boolean;
}

export interface RatingSummary {
  overallRating: number;
  totalRatings: number;
  ratingDistribution: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
  categoryAverages: {
    driving: number;
    cleanliness: number;
    communication: number;
    punctuality: number;
    safety: number;
  };
  recentTrend: "up" | "down" | "stable";
  lastRatingDate: Date;
  averageRatingLastWeek: number;
  averageRatingLastMonth: number;
}

export interface PerformanceMetrics {
  acceptanceRate: number;
  cancellationRate: number;
  completionRate: number;
  onTimeRate: number;
  responseTime: number; // average response time in seconds
  customerSatisfaction: number;
  safetyScore: number;
  cleanlinessScore: number;
  communicationScore: number;
  drivingScore: number;
  punctualityScore: number;
}

export interface Feedback {
  id: string;
  rideId: string;
  passengerId: string;
  passengerName: string;
  type: "compliment" | "complaint" | "suggestion";
  category: "service" | "vehicle" | "behavior" | "safety" | "other";
  message: string;
  timestamp: Date;
  status: "new" | "acknowledged" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  response?: string;
  responseDate?: Date;
}

export interface SupportTicket {
  id: string;
  type:
    | "rating_dispute"
    | "account_issue"
    | "payment_issue"
    | "safety_concern"
    | "other";
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  resolution?: string;
  attachments: string[];
}

export interface RatingGoal {
  id: string;
  targetRating: number;
  currentRating: number;
  targetDate: Date;
  isActive: boolean;
  progress: number;
  milestones: {
    rating: number;
    date: Date;
    achieved: boolean;
  }[];
}

export class RatingsService {
  // Driver rates customer
  async rateCustomer(payload: {
    rideId: number;
    rating: number;
    comment?: string;
    tip?: number;
  }): Promise<{ success: boolean }> {
    try {
      const { rideId, rating, comment, tip } = payload;
      const res = await fetchAPI(`rides/flow/driver/rate/${rideId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, tip }),
        requiresAuth: true,
      } as any);
      return res || { success: true };
    } catch (error) {
      console.error("[RatingsService] Error sending rating:", error);
      throw error;
    }
  }
  // Ratings
  async getRatings(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    ratings: Rating[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      console.log("[RatingsService] Fetching ratings:", { page, limit });
      const response = await fetchAPI(
        `driver/ratings?page=${page}&limit=${limit}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      console.error("[RatingsService] Error fetching ratings:", error);
      throw error;
    }
  }

  async getRatingDetails(ratingId: string): Promise<Rating> {
    try {
      console.log("[RatingsService] Fetching rating details:", ratingId);
      const response = await fetchAPI(`driver/ratings/${ratingId}`, {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[RatingsService] Error fetching rating details:", error);
      throw error;
    }
  }

  async getRatingSummary(): Promise<RatingSummary> {
    try {
      console.log("[RatingsService] Fetching rating summary");
      const response = await fetchAPI("driver/ratings/summary", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[RatingsService] Error fetching rating summary:", error);
      throw error;
    }
  }

  async getRecentRatings(limit: number = 10): Promise<Rating[]> {
    try {
      console.log("[RatingsService] Fetching recent ratings:", limit);
      const response = await fetchAPI(`driver/ratings/recent?limit=${limit}`, {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[RatingsService] Error fetching recent ratings:", error);
      throw error;
    }
  }

  async getRatingsByCategory(
    category: keyof Rating["categories"],
  ): Promise<Rating[]> {
    try {
      console.log("[RatingsService] Fetching ratings by category:", category);
      const response = await fetchAPI(`driver/ratings/category/${category}`, {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error(
        "[RatingsService] Error fetching ratings by category:",
        error,
      );
      throw error;
    }
  }

  // Performance Metrics
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      console.log("[RatingsService] Fetching performance metrics");
      const response = await fetchAPI("driver/ratings/performance", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error(
        "[RatingsService] Error fetching performance metrics:",
        error,
      );
      throw error;
    }
  }

  async getPerformanceTrends(
    period: "week" | "month" | "quarter" | "year" = "month",
  ): Promise<{
    dates: string[];
    ratings: number[];
    acceptanceRates: number[];
    completionRates: number[];
    onTimeRates: number[];
  }> {
    try {
      console.log("[RatingsService] Fetching performance trends:", period);
      const response = await fetchAPI(
        `driver/ratings/performance/trends?period=${period}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      console.error(
        "[RatingsService] Error fetching performance trends:",
        error,
      );
      throw error;
    }
  }

  // Feedback
  async getFeedback(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    feedback: Feedback[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      console.log("[RatingsService] Fetching feedback:", { page, limit });
      const response = await fetchAPI(
        `driver/ratings/feedback?page=${page}&limit=${limit}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      console.error("[RatingsService] Error fetching feedback:", error);
      throw error;
    }
  }

  async getFeedbackDetails(feedbackId: string): Promise<Feedback> {
    try {
      console.log("[RatingsService] Fetching feedback details:", feedbackId);
      const response = await fetchAPI(`driver/ratings/feedback/${feedbackId}`, {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[RatingsService] Error fetching feedback details:", error);
      throw error;
    }
  }

  async respondToFeedback(
    feedbackId: string,
    response: string,
  ): Promise<Feedback> {
    try {
      console.log("[RatingsService] Responding to feedback:", feedbackId);
      const result = await fetchAPI(
        `driver/ratings/feedback/${feedbackId}/respond`,
        {
          method: "POST",
          body: JSON.stringify({ response }),
          requiresAuth: true,
        },
      );
      return result;
    } catch (error) {
      console.error("[RatingsService] Error responding to feedback:", error);
      throw error;
    }
  }

  async getFeedbackByCategory(
    category: Feedback["category"],
  ): Promise<Feedback[]> {
    try {
      console.log("[RatingsService] Fetching feedback by category:", category);
      const response = await fetchAPI(
        `driver/ratings/feedback/category/${category}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      console.error(
        "[RatingsService] Error fetching feedback by category:",
        error,
      );
      throw error;
    }
  }

  // Support Tickets
  async getSupportTickets(): Promise<SupportTicket[]> {
    try {
      console.log("[RatingsService] Fetching support tickets");
      const response = await fetchAPI("driver/ratings/support-tickets", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[RatingsService] Error fetching support tickets:", error);
      throw error;
    }
  }

  async createSupportTicket(
    ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "status">,
  ): Promise<SupportTicket> {
    try {
      console.log("[RatingsService] Creating support ticket:", ticket);
      const response = await fetchAPI("driver/ratings/support-tickets", {
        method: "POST",
        body: JSON.stringify(ticket),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[RatingsService] Error creating support ticket:", error);
      throw error;
    }
  }

  async getSupportTicketDetails(ticketId: string): Promise<SupportTicket> {
    try {
      console.log(
        "[RatingsService] Fetching support ticket details:",
        ticketId,
      );
      const response = await fetchAPI(
        `driver/ratings/support-tickets/${ticketId}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      console.error(
        "[RatingsService] Error fetching support ticket details:",
        error,
      );
      throw error;
    }
  }

  async updateSupportTicket(
    ticketId: string,
    updates: Partial<SupportTicket>,
  ): Promise<SupportTicket> {
    try {
      console.log(
        "[RatingsService] Updating support ticket:",
        ticketId,
        updates,
      );
      const response = await fetchAPI(
        `driver/ratings/support-tickets/${ticketId}`,
        {
          method: "PUT",
          body: JSON.stringify(updates),
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      console.error("[RatingsService] Error updating support ticket:", error);
      throw error;
    }
  }

  // Rating Goals
  async getRatingGoals(): Promise<RatingGoal[]> {
    try {
      console.log("[RatingsService] Fetching rating goals");
      const response = await fetchAPI("driver/ratings/goals", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[RatingsService] Error fetching rating goals:", error);
      throw error;
    }
  }

  async createRatingGoal(
    goal: Omit<RatingGoal, "id" | "currentRating" | "progress" | "milestones">,
  ): Promise<RatingGoal> {
    try {
      console.log("[RatingsService] Creating rating goal:", goal);
      const response = await fetchAPI("driver/ratings/goals", {
        method: "POST",
        body: JSON.stringify(goal),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[RatingsService] Error creating rating goal:", error);
      throw error;
    }
  }

  async updateRatingGoal(
    goalId: string,
    updates: Partial<RatingGoal>,
  ): Promise<RatingGoal> {
    try {
      console.log("[RatingsService] Updating rating goal:", goalId, updates);
      const response = await fetchAPI(`driver/ratings/goals/${goalId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[RatingsService] Error updating rating goal:", error);
      throw error;
    }
  }

  async deleteRatingGoal(goalId: string): Promise<void> {
    try {
      console.log("[RatingsService] Deleting rating goal:", goalId);
      await fetchAPI(`driver/ratings/goals/${goalId}`, {
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      console.error("[RatingsService] Error deleting rating goal:", error);
      throw error;
    }
  }

  // Rating Analytics
  async getRatingAnalytics(
    period: "week" | "month" | "quarter" | "year" = "month",
  ): Promise<{
    averageRating: number;
    totalRatings: number;
    ratingTrend: "up" | "down" | "stable";
    categoryBreakdown: {
      driving: number;
      cleanliness: number;
      communication: number;
      punctuality: number;
      safety: number;
    };
    commonTags: { tag: string; count: number }[];
    improvementAreas: string[];
    strengths: string[];
  }> {
    try {
      console.log("[RatingsService] Fetching rating analytics:", period);
      const response = await fetchAPI(
        `driver/ratings/analytics?period=${period}`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      console.error("[RatingsService] Error fetching rating analytics:", error);
      throw error;
    }
  }

  // Rating Disputes
  async disputeRating(
    ratingId: string,
    reason: string,
    evidence?: string[],
  ): Promise<{
    disputeId: string;
    status: "pending" | "under_review" | "resolved" | "rejected";
    submittedAt: Date;
  }> {
    try {
      console.log("[RatingsService] Disputing rating:", ratingId, reason);
      const response = await fetchAPI(`driver/ratings/${ratingId}/dispute`, {
        method: "POST",
        body: JSON.stringify({ reason, evidence }),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[RatingsService] Error disputing rating:", error);
      throw error;
    }
  }

  async getRatingDisputes(): Promise<
    {
      id: string;
      ratingId: string;
      reason: string;
      status: "pending" | "under_review" | "resolved" | "rejected";
      submittedAt: Date;
      resolvedAt?: Date;
      resolution?: string;
    }[]
  > {
    try {
      console.log("[RatingsService] Fetching rating disputes");
      const response = await fetchAPI("driver/ratings/disputes", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      console.error("[RatingsService] Error fetching rating disputes:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const ratingsService = new RatingsService();
