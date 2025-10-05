import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { 
  WalletStore, 
  Transaction, 
  WalletLimits, 
  WalletStats, 
  TransactionFilters,
  TransferData,
  TransferResult
} from "@/types/wallet";
import { walletService } from "@/services/walletService";

export const useWalletStore = create<WalletStore>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    balance: 0,
    currency: 'USD',
    transactions: [],
    limits: null,
    stats: null,
    isLoading: false,
    error: null,

    // Acciones síncronas
    setBalance: (balance: number, currency: string = 'USD') => {
      console.log('[WalletStore] Setting balance:', balance, currency);
      set({ balance, currency });
    },

    setTransactions: (transactions: Transaction[]) => {
      console.log('[WalletStore] Setting transactions:', transactions.length);
      set({ transactions });
    },

    setLimits: (limits: WalletLimits) => {
      console.log('[WalletStore] Setting limits:', limits);
      set({ limits });
    },

    setStats: (stats: WalletStats) => {
      console.log('[WalletStore] Setting stats:', stats);
      set({ stats });
    },

    setLoading: (isLoading: boolean) => {
      console.log('[WalletStore] Setting loading:', isLoading);
      set({ isLoading });
    },

    setError: (error: string | null) => {
      console.log('[WalletStore] Setting error:', error);
      set({ error });
    },

    // Acciones asíncronas
    fetchWallet: async () => {
      const state = get();
      try {
        console.log('[WalletStore] Fetching wallet data');
        state.setLoading(true);
        state.setError(null);

        const walletData = await walletService.getWallet();
        
        state.setBalance(walletData.wallet.balance, walletData.wallet.currency);
        state.setTransactions(walletData.transactions);
        
        console.log('[WalletStore] Wallet data fetched successfully');
      } catch (error: any) {
        console.error('[WalletStore] Error fetching wallet:', error);
        state.setError(error.message || 'Error al cargar datos del wallet');
      } finally {
        state.setLoading(false);
      }
    },

    fetchBalance: async () => {
      const state = get();
      try {
        console.log('[WalletStore] Fetching balance');
        state.setLoading(true);
        state.setError(null);

        const balanceData = await walletService.getBalance();
        
        state.setBalance(balanceData.balance, balanceData.currency);
        
        console.log('[WalletStore] Balance fetched successfully');
      } catch (error: any) {
        console.error('[WalletStore] Error fetching balance:', error);
        state.setError(error.message || 'Error al cargar balance');
      } finally {
        state.setLoading(false);
      }
    },

    fetchTransactions: async (filters: TransactionFilters = {}) => {
      const state = get();
      try {
        console.log('[WalletStore] Fetching transactions with filters:', filters);
        state.setLoading(true);
        state.setError(null);

        const transactionList = await walletService.getTransactions(filters);
        
        state.setTransactions(transactionList.transactions);
        
        console.log('[WalletStore] Transactions fetched successfully');
      } catch (error: any) {
        console.error('[WalletStore] Error fetching transactions:', error);
        state.setError(error.message || 'Error al cargar transacciones');
      } finally {
        state.setLoading(false);
      }
    },

    transferFunds: async (data: TransferData): Promise<TransferResult> => {
      const state = get();
      try {
        console.log('[WalletStore] Transferring funds:', data);
        state.setLoading(true);
        state.setError(null);

        const result = await walletService.transferFunds(data);
        
        // Actualizar balance después de transferencia exitosa
        if (result.success) {
          state.setBalance(result.fromBalance);
          // Recargar transacciones para mostrar la nueva
          await state.fetchTransactions();
        }
        
        console.log('[WalletStore] Transfer completed successfully');
        return result;
      } catch (error: any) {
        console.error('[WalletStore] Error transferring funds:', error);
        state.setError(error.message || 'Error al transferir fondos');
        throw error;
      } finally {
        state.setLoading(false);
      }
    },

    validateTransfer: async (email: string, amount: number): Promise<boolean> => {
      const state = get();
      try {
        console.log('[WalletStore] Validating transfer:', { email, amount });
        state.setError(null);

        const result = await walletService.validateTransfer(email, amount);
        
        if (!result.valid) {
          state.setError(result.message);
        }
        
        console.log('[WalletStore] Transfer validation completed:', result.valid);
        return result.valid;
      } catch (error: any) {
        console.error('[WalletStore] Error validating transfer:', error);
        state.setError(error.message || 'Error al validar transferencia');
        return false;
      }
    },

    refreshWallet: async () => {
      const state = get();
      try {
        console.log('[WalletStore] Refreshing wallet data');
        state.setLoading(true);
        state.setError(null);

        // Cargar datos en paralelo
        await Promise.all([
          state.fetchBalance(),
          state.fetchTransactions(),
          walletService.getLimits().then(limits => state.setLimits(limits)),
          walletService.getStats().then(stats => state.setStats(stats))
        ]);
        
        console.log('[WalletStore] Wallet refreshed successfully');
      } catch (error: any) {
        console.error('[WalletStore] Error refreshing wallet:', error);
        state.setError(error.message || 'Error al actualizar wallet');
      } finally {
        state.setLoading(false);
      }
    },
  }))
);

// Selectors for optimized re-renders
export const useWalletBalance = () => useWalletStore((state) => state.balance);
export const useWalletCurrency = () => useWalletStore((state) => state.currency);
export const useWalletTransactions = () => useWalletStore((state) => state.transactions);
export const useWalletLimits = () => useWalletStore((state) => state.limits);
export const useWalletStats = () => useWalletStore((state) => state.stats);
export const useWalletLoading = () => useWalletStore((state) => state.isLoading);
export const useWalletError = () => useWalletStore((state) => state.error);

// Computed selectors
export const useFormattedBalance = () => useWalletStore((state) => {
  const { balance, currency } = state;
  if (balance === 0) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(balance);
});

export const useHasSufficientBalance = () => useWalletStore((state) => ({
  hasSufficientBalance: (amount: number) => state.balance >= amount,
  balance: state.balance,
}));

