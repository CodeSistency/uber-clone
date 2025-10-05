/**
 * Wallet Service
 * 
 * Servicio para manejar todas las operaciones de API del módulo wallet
 * Incluye métodos para obtener balance, transacciones, transferencias y validaciones
 */

import { fetchAPI } from '@/lib/fetch';
import { 
  WalletData, 
  BalanceData, 
  TransactionList, 
  TransferData, 
  TransferResult, 
  ValidationResult, 
  WalletLimits, 
  WalletStats, 
  TransactionFilters,
  WALLET_ENDPOINTS 
} from '@/types/wallet';

export class WalletService {
  private static instance: WalletService;

  private constructor() {}

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  /**
   * Obtener wallet completa con balance y transacciones
   */
  async getWallet(): Promise<WalletData> {
    try {
      console.log('[WalletService] Getting wallet data');
      
      const response = await fetchAPI(WALLET_ENDPOINTS.WALLET, {
        method: 'GET',
        requiresAuth: true
      });

      console.log('[WalletService] Wallet data retrieved successfully');
      return response.data || response;
    } catch (error: any) {
      console.error('[WalletService] Error getting wallet:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener solo el balance actual
   */
  async getBalance(): Promise<BalanceData> {
    try {
      console.log('[WalletService] Getting balance');
      
      const response = await fetchAPI(WALLET_ENDPOINTS.BALANCE, {
        method: 'GET',
        requiresAuth: true
      });

      console.log('[WalletService] Balance retrieved successfully');
      return response;
    } catch (error: any) {
      console.error('[WalletService] Error getting balance:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener historial de transacciones con filtros
   */
  async getTransactions(filters: TransactionFilters = {}): Promise<TransactionList> {
    try {
      console.log('[WalletService] Getting transactions with filters:', filters);
      
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetchAPI(`${WALLET_ENDPOINTS.TRANSACTIONS}?${params.toString()}`, {
        method: 'GET',
        requiresAuth: true
      });

      console.log('[WalletService] Transactions retrieved successfully');
      return response;
    } catch (error: any) {
      console.error('[WalletService] Error getting transactions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Transferir fondos por email
   */
  async transferFunds(data: TransferData): Promise<TransferResult> {
    try {
      console.log('[WalletService] Transferring funds:', { 
        toUserEmail: data.toUserEmail, 
        amount: data.amount 
      });

      // Validar datos antes de enviar
      this.validateTransferData(data);

      const response = await fetchAPI(WALLET_ENDPOINTS.TRANSFER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        requiresAuth: true
      });

      console.log('[WalletService] Transfer completed successfully');
      return response;
    } catch (error: any) {
      console.error('[WalletService] Error transferring funds:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Validar operación de transferencia
   */
  async validateTransfer(email: string, amount: number): Promise<ValidationResult> {
    try {
      console.log('[WalletService] Validating transfer:', { email, amount });

      // Validar formato de email
      if (!this.isValidEmail(email)) {
        return {
          valid: false,
          message: 'Formato de email inválido'
        };
      }

      // Validar monto
      if (!this.isValidAmount(amount)) {
        return {
          valid: false,
          message: 'Monto inválido'
        };
      }

      const response = await fetchAPI(WALLET_ENDPOINTS.VALIDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: 'transfer',
          amount,
          toUserEmail: email
        }),
        requiresAuth: true
      });

      console.log('[WalletService] Transfer validation completed');
      return response;
    } catch (error: any) {
      console.error('[WalletService] Error validating transfer:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener límites de transacción
   */
  async getLimits(): Promise<WalletLimits> {
    try {
      console.log('[WalletService] Getting limits');
      
      const response = await fetchAPI(WALLET_ENDPOINTS.LIMITS, {
        method: 'GET',
        requiresAuth: true
      });

      console.log('[WalletService] Limits retrieved successfully');
      return response;
    } catch (error: any) {
      console.error('[WalletService] Error getting limits:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener estadísticas de wallet
   */
  async getStats(): Promise<WalletStats> {
    try {
      console.log('[WalletService] Getting stats');
      
      const response = await fetchAPI(WALLET_ENDPOINTS.STATS, {
        method: 'GET',
        requiresAuth: true
      });

      console.log('[WalletService] Stats retrieved successfully');
      return response;
    } catch (error: any) {
      console.error('[WalletService] Error getting stats:', error);
      throw this.handleError(error);
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Validar datos de transferencia
   */
  private validateTransferData(data: TransferData): void {
    if (!data.toUserEmail || !this.isValidEmail(data.toUserEmail)) {
      throw new Error('Email de destinatario inválido');
    }

    if (!data.amount || !this.isValidAmount(data.amount)) {
      throw new Error('Monto inválido');
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Descripción es requerida');
    }
  }

  /**
   * Validar formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar monto
   */
  private isValidAmount(amount: number): boolean {
    return amount > 0 && amount <= 500 && Number.isFinite(amount);
  }

  /**
   * Manejar errores de API
   */
  private handleError(error: any): Error {
    console.error('[WalletService] Handling error:', error);

    // Error de red
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
    }

    // Error de autenticación
    if (error.statusCode === 401) {
      return new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    // Error de validación
    if (error.statusCode === 400) {
      return new Error(error.message || 'Datos inválidos');
    }

    // Error de límites
    if (error.statusCode === 429) {
      return new Error('Has excedido el límite de solicitudes. Intenta más tarde.');
    }

    // Error del servidor
    if (error.statusCode >= 500) {
      return new Error('Error del servidor. Intenta más tarde.');
    }

    // Error genérico
    return new Error(error.message || 'Error desconocido');
  }
}

// Exportar instancia singleton
export const walletService = WalletService.getInstance();




