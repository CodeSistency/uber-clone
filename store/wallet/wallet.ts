import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface WalletBalance {
  amount: number;
  currency: string;
  lastUpdated: Date;
}

interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  reference?: string;
  createdAt: Date;
}

interface WalletState {
  balance: WalletBalance | null;
  transactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setBalance: (balance: WalletBalance) => void;
  updateBalance: (amount: number, currency?: string) => void;
  addTransaction: (transaction: WalletTransaction) => void;
  loadWalletData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Computed
  hasWallet: boolean;
  hasSufficientBalance: (amount: number) => boolean;
  formattedBalance: string;
}

export const useWalletStore = create<WalletState>()(
  subscribeWithSelector((set, get) => ({
    balance: null,
    transactions: [],
    isLoading: false,
    error: null,

    setBalance: (balance) => set({ balance }),

    updateBalance: (amount, currency = "VES") => {
      const currentBalance = get().balance;
      const newBalance = {
        amount: (currentBalance?.amount || 0) + amount,
        currency,
        lastUpdated: new Date(),
      };
      set({ balance: newBalance });
    },

    addTransaction: (transaction) => {
      set((state) => ({
        transactions: [transaction, ...state.transactions].slice(0, 50), // Keep last 50
      }));
    },

    loadWalletData: async () => {
      try {
        set({ isLoading: true, error: null });

        // TODO: Implement API call to load wallet data
        // For now, simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data
        const mockBalance: WalletBalance = {
          amount: 150.00,
          currency: "VES",
          lastUpdated: new Date(),
        };

        set({
          balance: mockBalance,
          transactions: [
            {
              id: "1",
              type: "credit",
              amount: 50.00,
              description: "Recarga de wallet",
              createdAt: new Date(Date.now() - 86400000), // 1 day ago
            },
            {
              id: "2",
              type: "debit",
              amount: -25.50,
              description: "Pago de viaje",
              reference: "RIDE-123",
              createdAt: new Date(Date.now() - 3600000), // 1 hour ago
            },
          ],
        });
      } catch (error: any) {
        console.error("[WalletStore] Error loading wallet data:", error);
        set({ error: error.message || "Error al cargar datos del wallet" });
      } finally {
        set({ isLoading: false });
      }
    },

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Computed properties
    get hasWallet() {
      return get().balance !== null;
    },

    hasSufficientBalance: (amount: number) => {
      const balance = get().balance;
      return balance ? balance.amount >= amount : false;
    },

    get formattedBalance() {
      const balance = get().balance;
      if (!balance) return "₫0.00";

      return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: balance.currency === 'VES' ? 'VES' : 'USD',
        minimumFractionDigits: 2,
      }).format(balance.amount);
    },
  }))
);

// Selectors for optimized re-renders
export const useWalletBalance = () => useWalletStore((state) => state.balance);
export const useWalletTransactions = () => useWalletStore((state) => state.transactions);
export const useHasWallet = () => useWalletStore((state) => state.hasWallet);
export const useHasSufficientBalance = () => useWalletStore((state) => ({
  hasSufficientBalance: state.hasSufficientBalance,
  balance: state.balance,
}));
export const useWalletFormattedBalance = () => useWalletStore((state) => state.formattedBalance);
export const useWalletLoading = () => useWalletStore((state) => state.isLoading);
export const useWalletError = () => useWalletStore((state) => state.error);

