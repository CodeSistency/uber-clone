/**
 * Wallet Module Types
 * 
 * Definiciones de tipos TypeScript para el módulo de wallet
 * Incluye interfaces para Wallet, Transaction, TransferData y respuestas de API
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export interface Wallet {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  amount: number;
  transactionType: TransactionType;
  description: string;
  reference?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransferData {
  toUserEmail: string;
  amount: number;
  description: string;
  referenceType?: ReferenceType;
}

// ============================================================================
// ENUMS
// ============================================================================

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  TRANSFER = 'transfer',
  REFUND = 'refund',
  TOP_UP = 'top_up',
  PAYMENT = 'payment',
  WITHDRAWAL = 'withdrawal',
  ADMIN_ADJUSTMENT = 'admin_adjustment'
}

export enum TransferStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ReferenceType {
  USER_TRANSFER = 'user_transfer',
  REFERRAL_REWARD = 'referral_reward',
  ADMIN_TRANSFER = 'admin_transfer',
  RIDE_PAYMENT = 'ride_payment',
  REFUND = 'refund'
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface WalletData {
  wallet: Wallet;
  transactions: Transaction[];
}

export interface BalanceData {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface TransactionList {
  transactions: Transaction[];
  pagination: PaginationData;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
  limits?: WalletLimits;
}

export interface TransferResult {
  success: boolean;
  transactionId: string;
  fromBalance: number;
  toBalance: number;
  message: string;
}

export interface WalletLimits {
  dailyLimit: number;
  singleTransactionLimit: number;
  transferLimit: number;
  usedToday: number;
  remainingToday: number;
}

export interface WalletStats {
  totalTransactions: number;
  totalCredits: number;
  totalDebits: number;
  averageTransaction: number;
  monthlyStats: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  credits: number;
  debits: number;
  net: number;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType | 'all';
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface WalletCardProps {
  balance: number;
  currency?: string;
  showDetails?: boolean;
  className?: string;
}

export interface TransactionItemProps {
  transaction: Transaction;
  showAvatar?: boolean;
  onPress?: () => void;
  className?: string;
}

export interface ActionButtonProps {
  icon: React.ComponentType<any>;
  label: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
  onPress: () => void;
  disabled?: boolean;
  className?: string;
}

export interface EmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  className?: string;
}

export interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  maxAmount?: number;
  className?: string;
}

export interface UserCardProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  isVerified?: boolean;
  className?: string;
}

// ============================================================================
// STORE TYPES
// ============================================================================

export interface WalletStore {
  // Estado
  balance: number;
  currency: string;
  transactions: Transaction[];
  limits: WalletLimits | null;
  stats: WalletStats | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  setBalance: (balance: number, currency?: string) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setLimits: (limits: WalletLimits) => void;
  setStats: (stats: WalletStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones asíncronas
  fetchWallet: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  transferFunds: (data: TransferData) => Promise<TransferResult>;
  validateTransfer: (email: string, amount: number) => Promise<boolean>;
  refreshWallet: () => Promise<void>;
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

export interface WalletService {
  getWallet(): Promise<WalletData>;
  getBalance(): Promise<BalanceData>;
  getTransactions(filters?: TransactionFilters): Promise<TransactionList>;
  transferFunds(data: TransferData): Promise<TransferResult>;
  validateTransfer(email: string, amount: number): Promise<ValidationResult>;
  getLimits(): Promise<WalletLimits>;
  getStats(): Promise<WalletStats>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const WALLET_CONSTANTS = {
  MIN_TRANSFER_AMOUNT: 0.01,
  MAX_TRANSFER_AMOUNT: 500,
  MAX_DAILY_LIMIT: 1000,
  CURRENCY: 'USD',
  DECIMAL_PLACES: 2,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  AMOUNT_REGEX: /^\d+(\.\d{1,2})?$/,
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type WalletAction = 
  | 'add_funds'
  | 'transfer'
  | 'deduct'
  | 'refund';

export type TransactionStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type WalletError = 
  | 'INSUFFICIENT_FUNDS'
  | 'INVALID_EMAIL'
  | 'USER_NOT_FOUND'
  | 'DAILY_LIMIT_EXCEEDED'
  | 'INVALID_AMOUNT'
  | 'TRANSFER_FAILED'
  | 'NETWORK_ERROR';

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const WALLET_ENDPOINTS = {
  WALLET: '/api/user/wallet',
  BALANCE: '/api/user/wallet/balance',
  TRANSACTIONS: '/api/user/wallet/transactions',
  TRANSFER: '/api/user/wallet/transfer',
  VALIDATE: '/api/user/wallet/validate',
  LIMITS: '/api/user/wallet/limits',
  STATS: '/api/user/wallet/stats',
} as const;





