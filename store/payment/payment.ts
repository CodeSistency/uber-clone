import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { paymentService, type GroupStatusResponse, type MultiplePaymentRequest, type MultiplePaymentResponse } from "@/app/services/paymentService";
import { transportClient } from "@/app/services/flowClientService";

// Types for Payment Store
export interface PaymentGroup {
  groupId: string;
  serviceType: "ride" | "delivery" | "errand" | "parcel";
  serviceId: number;
  totalAmount: number;
  status: "active" | "completed" | "cancelled" | "expired";
  payments: Payment[];
  confirmedAmount: number;
  remainingAmount: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface Payment {
  id: string;
  method: "cash" | "card" | "wallet";
  amount: number;
  percentage: number;
  bankCode?: string;
  description: string;
  status: "pending" | "pending_reference" | "confirmed" | "cancelled" | "expired";
  reference?: string;
  confirmedAt?: string;
  expiresAt?: string;
  errorMessage?: string;
}

export interface PaymentStats {
  totalGroups: number;
  activeGroups: number;
  completedGroups: number;
  totalAmount: number;
  successRate: number;
}

interface PaymentStore {
  // State
  activeGroups: Record<string, PaymentGroup>;
  completedGroups: PaymentGroup[];
  stats: PaymentStats;
  isLoading: boolean;
  error: string | null;

  // Actions
  // Group Management
  createPaymentGroup: (request: MultiplePaymentRequest) => Promise<MultiplePaymentResponse>;
  updateGroupStatus: (groupId: string, status: GroupStatusResponse) => void;
  cancelPaymentGroup: (groupId: string, reason?: string) => Promise<boolean>;
  refreshGroupStatus: (groupId: string) => Promise<void>;

  // Payment Management
  confirmPayment: (referenceNumber: string, bankCode: string) => Promise<boolean>;
  updatePaymentStatus: (groupId: string, paymentId: string, status: Payment["status"], additionalData?: Partial<Payment>) => void;

  // Utility Actions
  getActiveGroup: (serviceId: number, serviceType: string) => PaymentGroup | null;
  getGroupById: (groupId: string) => PaymentGroup | null;
  clearCompletedGroups: () => void;
  calculateStats: () => void;

  // 🆕 NEW: Real Transport Payment Methods
  payRideWithMultipleMethods: (rideId: number, paymentData: {
    totalAmount: number;
    payments: Array<{
      method: "transfer" | "pago_movil" | "zelle" | "bitcoin" | "cash";
      amount: number;
      bankCode?: string;
    }>;
  }) => Promise<any>;

  generateRidePaymentReference: (rideId: number, referenceData: {
    method: "transfer" | "pago_movil" | "zelle" | "bitcoin";
    bankCode?: string;
  }) => Promise<any>;

  confirmRidePaymentWithReference: (rideId: number, confirmationData: {
    referenceNumber: string;
    bankCode?: string;
  }) => Promise<any>;

  confirmRidePartialPayment: (rideId: number, confirmationData: {
    referenceNumber: string;
    bankCode?: string;
  }) => Promise<any>;

  getRidePaymentStatus: (rideId: number) => Promise<any>;

  // Error Handling
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;

  // Cleanup
  cleanup: () => void;
}

// Helper functions
const calculateGroupProgress = (payments: Payment[]): { confirmedAmount: number; remainingAmount: number; progress: number } => {
  const confirmedAmount = payments
    .filter(p => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = totalAmount - confirmedAmount;
  const progress = totalAmount > 0 ? Math.round((confirmedAmount / totalAmount) * 100) : 0;

  return { confirmedAmount, remainingAmount, progress };
};

const isGroupExpired = (expiresAt: string): boolean => {
  return new Date(expiresAt) < new Date();
};

// Create the store
export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      activeGroups: {},
      completedGroups: [],
      stats: {
        totalGroups: 0,
        activeGroups: 0,
        completedGroups: 0,
        totalAmount: 0,
        successRate: 0,
      },
      isLoading: false,
      error: null,

      // Create payment group
      createPaymentGroup: async (request: MultiplePaymentRequest): Promise<MultiplePaymentResponse> => {
        const store = get();
        store.setLoading(true);
        store.setError(null);

        try {
          console.log("[PaymentStore] Creating payment group:", request);

          const response = await paymentService.initiateMultiple(request);

          if (response.success) {
            // Convert response to PaymentGroup format
            const payments: Payment[] = response.payments.map(p => ({
              id: p.id,
              method: p.method as "cash" | "card" | "wallet",
              amount: p.amount,
              percentage: Math.round((p.amount / response.totalAmount) * 100),
              bankCode: p.bankCode,
              description: p.method === "cash" ? "Pago en efectivo" :
                         p.method === "card" ? "Transferencia bancaria" : "Pago digital",
              status: p.status as Payment["status"],
              reference: p.reference,
              expiresAt: p.expiresAt,
            }));

            const { confirmedAmount, remainingAmount, progress } = calculateGroupProgress(payments);

            const paymentGroup: PaymentGroup = {
              groupId: response.groupId,
              serviceType: request.serviceType,
              serviceId: request.serviceId,
              totalAmount: response.totalAmount,
              status: "active",
              payments,
              confirmedAmount,
              remainingAmount,
              progress,
              createdAt: response.createdAt,
              updatedAt: response.createdAt,
              expiresAt: response.expiresAt,
            };

            // Add to active groups
            set((state) => ({
              activeGroups: {
                ...state.activeGroups,
                [response.groupId]: paymentGroup,
              },
            }));

            // Recalculate stats
            get().calculateStats();

            console.log("[PaymentStore] Payment group created successfully:", response.groupId);
          }

          return response;
        } catch (error: any) {
          const errorMessage = error?.message || "Error al crear grupo de pagos";
          console.error("[PaymentStore] Error creating payment group:", error);
          store.setError(errorMessage);
          throw error;
        } finally {
          store.setLoading(false);
        }
      },

      // Update group status
      updateGroupStatus: (groupId: string, statusData: GroupStatusResponse) => {
        console.log("[PaymentStore] Updating group status:", groupId, statusData);

        const payments: Payment[] = statusData.payments.map(p => ({
          id: p.id,
          method: p.method as "cash" | "card" | "wallet",
          amount: p.amount,
          percentage: Math.round((p.amount / statusData.totalAmount) * 100),
          bankCode: p.bankCode,
          description: p.method === "cash" ? "Pago en efectivo" :
                     p.method === "card" ? "Transferencia bancaria" : "Pago digital",
          status: p.status as Payment["status"],
          reference: p.reference,
          confirmedAt: p.confirmedAt,
          expiresAt: p.expiresAt,
        }));

        const { confirmedAmount, remainingAmount, progress } = calculateGroupProgress(payments);

        const updatedGroup: PaymentGroup = {
          groupId: statusData.groupId,
          serviceType: statusData.serviceType as "ride" | "delivery" | "errand" | "parcel",
          serviceId: statusData.serviceId,
          totalAmount: statusData.totalAmount,
          status: statusData.status,
          payments,
          confirmedAmount,
          remainingAmount,
          progress,
          createdAt: statusData.createdAt,
          updatedAt: statusData.updatedAt,
          expiresAt: statusData.expiresAt,
        };

        set((state) => {
          const newActiveGroups = { ...state.activeGroups };

          if (statusData.status === "completed" || statusData.status === "cancelled") {
            // Move to completed groups
            delete newActiveGroups[groupId];
            return {
              activeGroups: newActiveGroups,
              completedGroups: [updatedGroup, ...state.completedGroups].slice(0, 50), // Keep last 50
            };
          } else {
            // Update active group
            newActiveGroups[groupId] = updatedGroup;
            return {
              activeGroups: newActiveGroups,
            };
          }
        });

        // Recalculate stats
        get().calculateStats();
      },

      // Cancel payment group
      cancelPaymentGroup: async (groupId: string, reason?: string): Promise<boolean> => {
        const store = get();
        store.setLoading(true);
        store.setError(null);

        try {
          console.log("[PaymentStore] Cancelling payment group:", groupId);

          await paymentService.cancelGroup(groupId, reason);

          // Update local state
          set((state) => {
            const group = state.activeGroups[groupId];
            if (group) {
              const cancelledGroup: PaymentGroup = {
                ...group,
                status: "cancelled",
                updatedAt: new Date().toISOString(),
                payments: group.payments.map(p => ({
                  ...p,
                  status: "cancelled" as const,
                })),
              };

              const newActiveGroups = { ...state.activeGroups };
              delete newActiveGroups[groupId];

              return {
                activeGroups: newActiveGroups,
                completedGroups: [cancelledGroup, ...state.completedGroups].slice(0, 50),
              };
            }
            return state;
          });

          // Recalculate stats
          get().calculateStats();

          console.log("[PaymentStore] Payment group cancelled successfully:", groupId);
          return true;
        } catch (error: any) {
          const errorMessage = error?.message || "Error al cancelar grupo de pagos";
          console.error("[PaymentStore] Error cancelling payment group:", error);
          store.setError(errorMessage);
          return false;
        } finally {
          store.setLoading(false);
        }
      },

      // Refresh group status
      refreshGroupStatus: async (groupId: string) => {
        const store = get();
        store.setLoading(true);

        try {
          console.log("[PaymentStore] Refreshing group status:", groupId);

          const statusData = await paymentService.getGroupStatus(groupId);
          store.updateGroupStatus(groupId, statusData);

          console.log("[PaymentStore] Group status refreshed:", groupId);
        } catch (error: any) {
          console.error("[PaymentStore] Error refreshing group status:", error);
          store.setError(error?.message || "Error al actualizar estado del grupo");
        } finally {
          store.setLoading(false);
        }
      },

      // Confirm payment
      confirmPayment: async (referenceNumber: string, bankCode: string): Promise<boolean> => {
        const store = get();
        store.setLoading(true);
        store.setError(null);

        try {
          console.log("[PaymentStore] Confirming payment:", referenceNumber);

          const response = await paymentService.confirmPartial({
            referenceNumber,
            bankCode,
          });

          if (response.success) {
            // Find the group containing this payment
            const activeGroups = get().activeGroups;
            let groupId: string | null = null;
            let paymentId: string | null = null;

            for (const [gid, group] of Object.entries(activeGroups)) {
              const payment = group.payments.find(p => p.reference === referenceNumber);
              if (payment) {
                groupId = gid;
                paymentId = payment.id;
                break;
              }
            }

            if (groupId && paymentId) {
              // Update payment status
              store.updatePaymentStatus(groupId, paymentId, "confirmed", {
                confirmedAt: response.confirmedAt,
              });

              console.log("[PaymentStore] Payment confirmed successfully:", referenceNumber);
              return true;
            }
          }

          return false;
        } catch (error: any) {
          const errorMessage = error?.message || "Error al confirmar pago";
          console.error("[PaymentStore] Error confirming payment:", error);
          store.setError(errorMessage);
          return false;
        } finally {
          store.setLoading(false);
        }
      },

      // Update payment status
      updatePaymentStatus: (groupId: string, paymentId: string, status: Payment["status"], additionalData?: Partial<Payment>) => {
        console.log("[PaymentStore] Updating payment status:", { groupId, paymentId, status });

        set((state) => {
          const group = state.activeGroups[groupId];
          if (!group) return state;

          const updatedPayments = group.payments.map(p =>
            p.id === paymentId
              ? { ...p, status, ...additionalData }
              : p
          );

          const { confirmedAmount, remainingAmount, progress } = calculateGroupProgress(updatedPayments);

          // Check if group is completed
          const allConfirmed = updatedPayments.every(p => p.status === "confirmed");
          const hasCancelled = updatedPayments.some(p => p.status === "cancelled");
          const hasExpired = updatedPayments.some(p => p.expiresAt && isGroupExpired(p.expiresAt));

          let groupStatus = group.status;
          if (allConfirmed) {
            groupStatus = "completed";
          } else if (hasCancelled) {
            groupStatus = "cancelled";
          } else if (hasExpired) {
            groupStatus = "expired";
          }

          const updatedGroup: PaymentGroup = {
            ...group,
            status: groupStatus,
            payments: updatedPayments,
            confirmedAmount,
            remainingAmount,
            progress,
            updatedAt: new Date().toISOString(),
          };

          const newActiveGroups = { ...state.activeGroups };

          if (groupStatus === "completed" || groupStatus === "cancelled" || groupStatus === "expired") {
            // Move to completed groups
            delete newActiveGroups[groupId];
            return {
              activeGroups: newActiveGroups,
              completedGroups: [updatedGroup, ...state.completedGroups].slice(0, 50),
            };
          } else {
            // Update active group
            newActiveGroups[groupId] = updatedGroup;
            return {
              activeGroups: newActiveGroups,
            };
          }
        });

        // Recalculate stats
        get().calculateStats();
      },

      // Get active group for service
      getActiveGroup: (serviceId: number, serviceType: string): PaymentGroup | null => {
        const activeGroups = get().activeGroups;
        for (const group of Object.values(activeGroups)) {
          if (group.serviceId === serviceId && group.serviceType === serviceType) {
            return group;
          }
        }
        return null;
      },

      // Get group by ID
      getGroupById: (groupId: string): PaymentGroup | null => {
        const activeGroups = get().activeGroups;
        if (activeGroups[groupId]) {
          return activeGroups[groupId];
        }

        const completedGroups = get().completedGroups;
        return completedGroups.find(g => g.groupId === groupId) || null;
      },

      // Clear completed groups
      clearCompletedGroups: () => {
        console.log("[PaymentStore] Clearing completed groups");
        set((state) => ({
          completedGroups: [],
        }));
        get().calculateStats();
      },

      // Calculate stats
      calculateStats: () => {
        const state = get();
        const allGroups = [
          ...Object.values(state.activeGroups),
          ...state.completedGroups,
        ];

        const totalGroups = allGroups.length;
        const activeGroups = Object.keys(state.activeGroups).length;
        const completedGroups = allGroups.filter(g => g.status === "completed").length;
        const totalAmount = allGroups.reduce((sum, g) => sum + g.totalAmount, 0);
        const successRate = totalGroups > 0 ? Math.round((completedGroups / totalGroups) * 100) : 0;

        const stats: PaymentStats = {
          totalGroups,
          activeGroups,
          completedGroups,
          totalAmount,
          successRate,
        };

        set({ stats });
        console.log("[PaymentStore] Stats calculated:", stats);
      },

      // 🆕 NEW: Pay ride with multiple methods using real endpoints
      payRideWithMultipleMethods: async (rideId: number, paymentData: {
        totalAmount: number;
        payments: Array<{
          method: "transfer" | "pago_movil" | "zelle" | "bitcoin" | "cash";
          amount: number;
          bankCode?: string;
        }>;
      }) => {
        const store = get();
        store.setLoading(true);
        store.setError(null);

        try {
          console.log("[PaymentStore] Paying ride with multiple methods:", { rideId, paymentData });

          const result = await transportClient.payWithMultipleMethods(rideId, paymentData);

          // Handle response based on new API structure
          if (result.data.groupId) {
            // Multiple payments - update group status
            const statusData = await transportClient.getPaymentStatus(rideId);
            if (statusData.data.hasPaymentGroup && statusData.data.groupId) {
              store.updateGroupStatus(statusData.data.groupId, statusData.data);
            }
          }
          // For cash payments, result.data.status will be "complete"

          console.log("[PaymentStore] Ride payment completed:", result);
          return result;
        } catch (error: any) {
          const errorMessage = error?.message || "Error al procesar pago múltiple";
          console.error("[PaymentStore] Error paying ride with multiple methods:", error);
          store.setError(errorMessage);
          throw error;
        } finally {
          store.setLoading(false);
        }
      },

      // 🆕 NEW: Generate payment reference for ride
      generateRidePaymentReference: async (rideId: number, referenceData: {
        method: "transfer" | "pago_movil" | "zelle" | "bitcoin";
        bankCode?: string;
      }) => {
        const store = get();
        store.setLoading(true);
        store.setError(null);

        try {
          console.log("[PaymentStore] Generating ride payment reference:", { rideId, referenceData });

          const result = await transportClient.generatePaymentReference(rideId, referenceData);

          console.log("[PaymentStore] Payment reference generated:", result);
          return result;
        } catch (error: any) {
          const errorMessage = error?.message || "Error al generar referencia de pago";
          console.error("[PaymentStore] Error generating payment reference:", error);
          store.setError(errorMessage);
          throw error;
        } finally {
          store.setLoading(false);
        }
      },

      // 🆕 NEW: Confirm ride payment with reference
      confirmRidePaymentWithReference: async (rideId: number, confirmationData: {
        referenceNumber: string;
        bankCode?: string;
      }) => {
        const store = get();
        store.setLoading(true);
        store.setError(null);

        try {
          console.log("[PaymentStore] Confirming ride payment with reference:", { rideId, confirmationData });

          const result = await transportClient.confirmPaymentWithReference(rideId, confirmationData);

          // Update group status if payment was successful
          if (result.data.success && result.data.groupId) {
            const statusData = await transportClient.getPaymentStatus(rideId);
            if (statusData.data.hasPaymentGroup) {
              store.updateGroupStatus(result.data.groupId, statusData.data);
            }
          }

          console.log("[PaymentStore] Payment confirmed with reference:", result);
          return result;
        } catch (error: any) {
          const errorMessage = error?.message || "Error al confirmar pago con referencia";
          console.error("[PaymentStore] Error confirming payment with reference:", error);
          store.setError(errorMessage);
          throw error;
        } finally {
          store.setLoading(false);
        }
      },

      // 🆕 NEW: Confirm partial payment in ride
      confirmRidePartialPayment: async (rideId: number, confirmationData: {
        referenceNumber: string;
        bankCode?: string;
      }) => {
        const store = get();
        store.setLoading(true);
        store.setError(null);

        try {
          console.log("[PaymentStore] Confirming ride partial payment:", { rideId, confirmationData });

          const result = await transportClient.confirmPartialPayment(rideId, confirmationData);

          // Update group status
          if (result.data.groupId) {
            const statusData = await transportClient.getPaymentStatus(rideId);
            if (statusData.data.hasPaymentGroup) {
              store.updateGroupStatus(result.data.groupId, statusData.data);
            }
          }

          console.log("[PaymentStore] Partial payment confirmed:", result);
          return result;
        } catch (error: any) {
          const errorMessage = error?.message || "Error al confirmar pago parcial";
          console.error("[PaymentStore] Error confirming partial payment:", error);
          store.setError(errorMessage);
          throw error;
        } finally {
          store.setLoading(false);
        }
      },

      // 🆕 NEW: Get ride payment status
      getRidePaymentStatus: async (rideId: number) => {
        const store = get();
        store.setLoading(true);

        try {
          console.log("[PaymentStore] Getting ride payment status:", rideId);

          const result = await transportClient.getPaymentStatus(rideId);

          // Update group status if exists
          if (result.data.hasPaymentGroup && result.data.groupId) {
            store.updateGroupStatus(result.data.groupId, result.data);
          }

          console.log("[PaymentStore] Ride payment status retrieved:", result);
          return result;
        } catch (error: any) {
          const errorMessage = error?.message || "Error al obtener estado de pagos";
          console.error("[PaymentStore] Error getting ride payment status:", error);
          store.setError(errorMessage);
          throw error;
        } finally {
          store.setLoading(false);
        }
      },

      // Error handling
      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Cleanup
      cleanup: () => {
        console.log("[PaymentStore] Cleaning up payment store");
        set({
          activeGroups: {},
          completedGroups: [],
          stats: {
            totalGroups: 0,
            activeGroups: 0,
            completedGroups: 0,
            totalAmount: 0,
            successRate: 0,
          },
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "payment-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist certain parts of the state
      partialize: (state) => ({
        activeGroups: state.activeGroups,
        completedGroups: state.completedGroups.slice(0, 20), // Keep only last 20 completed
        stats: state.stats,
      }),
    }
  )
);

// Types are already exported as interfaces above
// No additional type exports needed
