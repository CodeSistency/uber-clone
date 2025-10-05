import { create } from "zustand";

// Types for Ratings
export interface RatingBreakdown {
  five: number;
  four: number;
  three: number;
  two: number;
  one: number;
}

export interface PassengerComment {
  id: string;
  rideId: string;
  passengerName: string;
  rating: number;
  comment: string;
  timestamp: Date;
  category: "excellent" | "good" | "average" | "poor" | "terrible";
  tags: string[];
}

export interface PerformanceMetrics {
  acceptanceRate: number;
  cancellationRate: number;
  completionRate: number;
  averageRating: number;
  totalRides: number;
  totalRatings: number;
  onTimeArrival: number;
  cleanVehicle: number;
  safeDriving: number;
  friendlyService: number;
}

export interface SupportTicket {
  id: string;
  type:
    | "ride_issue"
    | "payment_issue"
    | "app_issue"
    | "safety_concern"
    | "general";
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: Date;
  updatedAt: Date;
  rideId?: string;
  attachments?: string[];
  responses: SupportResponse[];
}

export interface SupportResponse {
  id: string;
  ticketId: string;
  message: string;
  isFromSupport: boolean;
  timestamp: Date;
  attachments?: string[];
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: "earnings" | "safety" | "app" | "payments" | "rides" | "account";
  tags: string[];
  lastUpdated: Date;
  helpful: number;
  notHelpful: number;
}

// Ratings Store Interface
interface RatingsStore {
  // State
  overallRating: number;
  totalRatings: number;
  ratingBreakdown: RatingBreakdown;
  recentComments: PassengerComment[];
  performanceMetrics: PerformanceMetrics | null;
  supportTickets: SupportTicket[];
  helpArticles: HelpArticle[];

  // Loading and Error States
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRatings: () => Promise<void>;
  fetchRatingBreakdown: () => Promise<void>;
  fetchRecentComments: (limit?: number) => Promise<void>;
  fetchPerformanceMetrics: () => Promise<void>;

  // Support Functions
  createSupportTicket: (
    ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "responses">,
  ) => Promise<void>;
  fetchSupportTickets: () => Promise<void>;
  updateSupportTicket: (
    ticketId: string,
    updates: Partial<SupportTicket>,
  ) => Promise<void>;
  addSupportResponse: (
    ticketId: string,
    response: Omit<SupportResponse, "id" | "timestamp">,
  ) => Promise<void>;

  // Help Functions
  searchHelpArticles: (query: string) => Promise<HelpArticle[]>;
  fetchHelpArticles: (category?: string) => Promise<void>;
  rateHelpArticle: (articleId: string, helpful: boolean) => Promise<void>;

  // Utility Functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useRatingsStore = create<RatingsStore>((set, get) => ({
  // Initial State
  overallRating: 4.8,
  totalRatings: 1247,
  ratingBreakdown: {
    five: 892,
    four: 234,
    three: 89,
    two: 23,
    one: 9,
  },
  recentComments: [],
  performanceMetrics: null,
  supportTickets: [],
  helpArticles: [],

  // Loading and Error States
  isLoading: false,
  error: null,

  // Actions
  fetchRatings: async () => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockRatings = {
        overallRating: 4.8,
        totalRatings: 1247,
      };

      set(() => ({
        overallRating: mockRatings.overallRating,
        totalRatings: mockRatings.totalRatings,
      }));

      
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to fetch ratings");
    } finally {
      state.setLoading(false);
    }
  },

  fetchRatingBreakdown: async () => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockBreakdown: RatingBreakdown = {
        five: 892,
        four: 234,
        three: 89,
        two: 23,
        one: 9,
      };

      set(() => ({ ratingBreakdown: mockBreakdown }));
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to fetch rating breakdown",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchRecentComments: async (limit = 10) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockComments: PassengerComment[] = [
        {
          id: "comment_001",
          rideId: "ride_001",
          passengerName: "John D.",
          rating: 5,
          comment: "Excellent driver! Very professional and friendly.",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          category: "excellent",
          tags: ["professional", "friendly", "on-time"],
        },
        {
          id: "comment_002",
          rideId: "ride_002",
          passengerName: "Sarah M.",
          rating: 5,
          comment: "Great ride, clean car and safe driving.",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          category: "excellent",
          tags: ["clean", "safe", "comfortable"],
        },
        {
          id: "comment_003",
          rideId: "ride_003",
          passengerName: "Mike R.",
          rating: 4,
          comment: "Good driver, arrived on time.",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          category: "good",
          tags: ["on-time", "reliable"],
        },
      ];

      set(() => ({ recentComments: mockComments.slice(0, limit) }));
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to fetch recent comments",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchPerformanceMetrics: async () => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockMetrics: PerformanceMetrics = {
        acceptanceRate: 95.2,
        cancellationRate: 2.1,
        completionRate: 98.7,
        averageRating: 4.8,
        totalRides: 1247,
        totalRatings: 1189,
        onTimeArrival: 96.5,
        cleanVehicle: 98.2,
        safeDriving: 97.8,
        friendlyService: 95.9,
      };

      set(() => ({ performanceMetrics: mockMetrics }));
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to fetch performance metrics",
      );
    } finally {
      state.setLoading(false);
    }
  },

  createSupportTicket: async (
    ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "responses">,
  ) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      const ticketId = `ticket_${Date.now()}`;
      const newTicket: SupportTicket = {
        ...ticket,
        id: ticketId,
        createdAt: new Date(),
        updatedAt: new Date(),
        responses: [],
      };

      set((state) => ({
        supportTickets: [newTicket, ...state.supportTickets],
      }));

      // TODO: Send to backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to create support ticket",
      );
    } finally {
      state.setLoading(false);
    }
  },

  fetchSupportTickets: async () => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockTickets: SupportTicket[] = [
        {
          id: "ticket_001",
          type: "ride_issue",
          subject: "Passenger was rude",
          description:
            "The passenger was very rude and made inappropriate comments during the ride.",
          status: "open",
          priority: "medium",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          rideId: "ride_001",
          responses: [],
        },
        {
          id: "ticket_002",
          type: "payment_issue",
          subject: "Payment not received",
          description:
            "I completed a ride but the payment is not showing in my earnings.",
          status: "in_progress",
          priority: "high",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          rideId: "ride_002",
          responses: [
            {
              id: "response_001",
              ticketId: "ticket_002",
              message:
                "We are looking into this payment issue and will resolve it within 24 hours.",
              isFromSupport: true,
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
          ],
        },
      ];

      set(() => ({ supportTickets: mockTickets }));
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to fetch support tickets",
      );
    } finally {
      state.setLoading(false);
    }
  },

  updateSupportTicket: async (
    ticketId: string,
    updates: Partial<SupportTicket>,
  ) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        supportTickets: state.supportTickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, ...updates, updatedAt: new Date() }
            : ticket,
        ),
      }));

      // TODO: Update in backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to update support ticket",
      );
    } finally {
      state.setLoading(false);
    }
  },

  addSupportResponse: async (
    ticketId: string,
    response: Omit<SupportResponse, "id" | "timestamp">,
  ) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      const responseId = `response_${Date.now()}`;
      const newResponse: SupportResponse = {
        ...response,
        id: responseId,
        timestamp: new Date(),
      };

      set((state) => ({
        supportTickets: state.supportTickets.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                responses: [...ticket.responses, newResponse],
                updatedAt: new Date(),
              }
            : ticket,
        ),
      }));

      // TODO: Send to backend
      
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to add support response",
      );
    } finally {
      state.setLoading(false);
    }
  },

  searchHelpArticles: async (query: string) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockArticles: HelpArticle[] = [
        {
          id: "article_001",
          title: "How to view your earnings",
          content:
            "You can view your earnings in the Earnings section of the app...",
          category: "earnings",
          tags: ["earnings", "payments", "dashboard"],
          lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          helpful: 45,
          notHelpful: 2,
        },
        {
          id: "article_002",
          title: "Safety features and emergency contacts",
          content:
            "The app includes several safety features to help keep you safe...",
          category: "safety",
          tags: ["safety", "emergency", "contacts"],
          lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          helpful: 78,
          notHelpful: 5,
        },
      ];

      // Filter articles based on query
      const filteredArticles = mockArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.content.toLowerCase().includes(query.toLowerCase()) ||
          article.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase()),
          ),
      );

      set(() => ({ helpArticles: filteredArticles }));
      return filteredArticles;
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to search help articles",
      );
      return [];
    } finally {
      state.setLoading(false);
    }
  },

  fetchHelpArticles: async (category?: string) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      // TODO: Replace with actual API call
      const mockArticles: HelpArticle[] = [
        {
          id: "article_001",
          title: "How to view your earnings",
          content:
            "You can view your earnings in the Earnings section of the app...",
          category: "earnings",
          tags: ["earnings", "payments", "dashboard"],
          lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          helpful: 45,
          notHelpful: 2,
        },
        {
          id: "article_002",
          title: "Safety features and emergency contacts",
          content:
            "The app includes several safety features to help keep you safe...",
          category: "safety",
          tags: ["safety", "emergency", "contacts"],
          lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          helpful: 78,
          notHelpful: 5,
        },
        {
          id: "article_003",
          title: "App troubleshooting guide",
          content: "If you are experiencing issues with the app...",
          category: "app",
          tags: ["app", "troubleshooting", "technical"],
          lastUpdated: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
          helpful: 32,
          notHelpful: 8,
        },
      ];

      const filteredArticles = category
        ? mockArticles.filter((article) => article.category === category)
        : mockArticles;

      set(() => ({ helpArticles: filteredArticles }));
    } catch (error) {
      
      state.setError(
        (error as Error).message || "Failed to fetch help articles",
      );
    } finally {
      state.setLoading(false);
    }
  },

  rateHelpArticle: async (articleId: string, helpful: boolean) => {
    
    const state = get();

    try {
      state.setLoading(true);
      state.clearError();

      set((state) => ({
        helpArticles: state.helpArticles.map((article) =>
          article.id === articleId
            ? {
                ...article,
                helpful: helpful ? article.helpful + 1 : article.helpful,
                notHelpful: !helpful
                  ? article.notHelpful + 1
                  : article.notHelpful,
              }
            : article,
        ),
      }));

      // TODO: Send rating to backend
      
    } catch (error) {
      
      state.setError((error as Error).message || "Failed to rate help article");
    } finally {
      state.setLoading(false);
    }
  },

  // Utility Functions
  setLoading: (loading: boolean) => {
    
    set(() => ({ isLoading: loading }));
  },

  setError: (error: string | null) => {
    
    set(() => ({ error }));
  },

  clearError: () => {
    
    set(() => ({ error: null }));
  },
}));
