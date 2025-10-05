import { fetchAPI } from "@/lib/fetch";

// Types for Payment Service
export interface PaymentMethod {
  method: "cash" | "card" | "wallet";
  bankCode?: string;
  amount: number;
  description: string;
}

export interface MultiplePaymentRequest {
  serviceType: "ride" | "delivery" | "errand" | "parcel";
  serviceId: number;
  totalAmount: number;
  payments: PaymentMethod[];
  groupId?: string;
  idempotencyKey?: string;
}

export interface MultiplePaymentResponse {
  success: boolean;
  groupId: string;
  payments: {
    id: string;
    method: string;
    amount: number;
    bankCode?: string;
    reference?: string;
    status: "pending" | "pending_reference" | "confirmed" | "cancelled";
    expiresAt?: string;
  }[];
  totalAmount: number;
  createdAt: string;
  expiresAt: string;
}

export interface PaymentConfirmationRequest {
  referenceNumber: string;
  bankCode: string;
  idempotencyKey?: string;
}

export interface PaymentConfirmationResponse {
  success: boolean;
  paymentId: string;
  status: "confirmed" | "already_confirmed" | "expired" | "invalid";
  amount: number;
  confirmedAt?: string;
  groupId: string;
  remainingPayments?: number;
  groupCompleted?: boolean;
}

export interface GroupStatusResponse {
  groupId: string;
  serviceType: string;
  serviceId: number;
  totalAmount: number;
  status: "active" | "completed" | "cancelled" | "expired";
  payments: {
    id: string;
    method: string;
    amount: number;
    status: "pending" | "pending_reference" | "confirmed" | "cancelled";
    reference?: string;
    bankCode?: string;
    confirmedAt?: string;
    expiresAt?: string;
  }[];
  confirmedAmount: number;
  remainingAmount: number;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CancelGroupResponse {
  success: boolean;
  groupId: string;
  cancelledPayments: number;
  cancelledAt: string;
}

// Base URL for Payment APIs
const PAYMENT_BASE_URL = `${process.env.EXPO_PUBLIC_SERVER_URL || "https://gnuhealth-back.alcaravan.com.ve"}/api/payments`;

// Utility function to generate idempotency key
export const generatePaymentIdempotencyKey = (): string => {
  return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Payment Service Class
export class PaymentService {
  /**
   * Initiate Multiple Payments
   * POST /payments/initiate-multiple
   */
  async initiateMultiple(
    request: MultiplePaymentRequest,
  ): Promise<MultiplePaymentResponse> {
    try {
      

      const payload = {
        serviceType: request.serviceType,
        serviceId: request.serviceId,
        totalAmount: request.totalAmount,
        payments: request.payments.map((payment) => ({
          method: payment.method,
          amount: payment.amount,
          bankCode: payment.bankCode,
          description: payment.description,
        })),
        groupId: request.groupId,
        idempotencyKey:
          request.idempotencyKey || generatePaymentIdempotencyKey(),
      };

      const response = await fetchAPI(`${PAYMENT_BASE_URL}/initiate-multiple`, {
        method: "POST",
        body: JSON.stringify(payload),
        requiresAuth: true,
      });

      
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Confirm Partial Payment
   * POST /payments/confirm-partial
   */
  async confirmPartial(
    request: PaymentConfirmationRequest,
  ): Promise<PaymentConfirmationResponse> {
    try {
      

      const payload = {
        referenceNumber: request.referenceNumber,
        bankCode: request.bankCode,
        idempotencyKey:
          request.idempotencyKey || generatePaymentIdempotencyKey(),
      };

      const response = await fetchAPI(`${PAYMENT_BASE_URL}/confirm-partial`, {
        method: "POST",
        body: JSON.stringify(payload),
        requiresAuth: true,
      });

      
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Get Group Status
   * GET /payments/group-status/{groupId}
   */
  async getGroupStatus(groupId: string): Promise<GroupStatusResponse> {
    try {
      

      const response = await fetchAPI(
        `${PAYMENT_BASE_URL}/group-status/${groupId}`,
        {
          requiresAuth: true,
        },
      );

      
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Cancel Payment Group
   * POST /payments/cancel-group/{groupId}
   */
  async cancelGroup(
    groupId: string,
    reason?: string,
    idempotencyKey?: string,
  ): Promise<CancelGroupResponse> {
    try {
      

      const payload = {
        reason: reason || "Cancelled by user",
        idempotencyKey: idempotencyKey || generatePaymentIdempotencyKey(),
      };

      const response = await fetchAPI(
        `${PAYMENT_BASE_URL}/cancel-group/${groupId}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          requiresAuth: true,
        },
      );

      
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Validate Payment Group
   * Helper function to validate group before operations
   */
  async validateGroup(groupId: string): Promise<boolean> {
    try {
      const status = await this.getGroupStatus(groupId);
      return status.status === "active";
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Get Payment Reference Info
   * GET /payments/reference/{referenceNumber}
   */
  async getPaymentReference(referenceNumber: string): Promise<{
    referenceNumber: string;
    amount: number;
    bankCode: string;
    status: string;
    expiresAt: string;
    groupId: string;
    paymentId: string;
  }> {
    try {
      

      const response = await fetchAPI(
        `${PAYMENT_BASE_URL}/reference/${referenceNumber}`,
        {
          requiresAuth: true,
        },
      );

      
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Retry Failed Payment
   * POST /payments/retry/{paymentId}
   */
  async retryPayment(
    paymentId: string,
    idempotencyKey?: string,
  ): Promise<PaymentConfirmationResponse> {
    try {
      

      const payload = {
        idempotencyKey: idempotencyKey || generatePaymentIdempotencyKey(),
      };

      const response = await fetchAPI(
        `${PAYMENT_BASE_URL}/retry/${paymentId}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          requiresAuth: true,
        },
      );

      
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Get User's Payment Groups
   * GET /payments/groups?serviceType={type}&status={status}&limit={limit}
   */
  async getUserPaymentGroups(
    filters: {
      serviceType?: "ride" | "delivery" | "errand" | "parcel";
      status?: "active" | "completed" | "cancelled" | "expired";
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{
    groups: GroupStatusResponse[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      

      const queryParams = new URLSearchParams();
      if (filters.serviceType)
        queryParams.append("serviceType", filters.serviceType);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.offset)
        queryParams.append("offset", filters.offset.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${PAYMENT_BASE_URL}/groups?${queryString}`
        : `${PAYMENT_BASE_URL}/groups`;

      const response = await fetchAPI(endpoint, {
        requiresAuth: true,
      });

      
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Get Payment Statistics
   * GET /payments/stats?period={period}
   */
  async getPaymentStats(
    period: "today" | "week" | "month" | "year" = "month",
  ): Promise<{
    period: string;
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    successRate: number;
    averagePaymentAmount: number;
    paymentMethods: Record<string, number>;
    topFailureReasons?: string[];
  }> {
    try {
      

      const response = await fetchAPI(
        `${PAYMENT_BASE_URL}/stats?period=${period}`,
        {
          requiresAuth: true,
        },
      );

      
      return response;
    } catch (error) {
      
      throw error;
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Utility functions for payment validation and formatting
export const paymentUtils = {
  /**
   * Format amount for display
   */
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
      minimumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Validate reference number format
   */
  isValidReference: (reference: string): boolean => {
    // Venezuelan bank references are typically 20 digits
    return /^\d{20}$/.test(reference);
  },

  /**
   * Check if reference is expired
   */
  isExpired: (expiresAt: string): boolean => {
    return new Date(expiresAt) < new Date();
  },

  /**
   * Calculate progress percentage
   */
  calculateProgress: (confirmedAmount: number, totalAmount: number): number => {
    if (totalAmount === 0) return 0;
    return Math.round((confirmedAmount / totalAmount) * 100);
  },

  /**
   * Get time remaining for reference
   */
  getTimeRemaining: (
    expiresAt: string,
  ): {
    hours: number;
    minutes: number;
    expired: boolean;
  } => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) {
      return { hours: 0, minutes: 0, expired: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, expired: false };
  },
};
