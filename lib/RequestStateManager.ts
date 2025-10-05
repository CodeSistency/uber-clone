/**
 * Gestor de Estados para el Flujo de Solicitudes de Conductor
 * Maneja transiciones de estado inteligentes y feedback visual
 */
export enum RequestState {
  IDLE = "idle", // Sin solicitudes activas
  NOTIFIED = "notified", // WebSocket llegó, esperando interacción
  LOADING = "loading", // Cargando datos de API
  LOADED = "loaded", // Datos completos disponibles
  EXPIRED = "expired", // Solicitud expiró
  OFFLINE = "offline", // Sin conexión
  ERROR = "error", // Error en el proceso
}

export interface RequestStateConfig {
  autoExpireMs: number; // Tiempo para expirar notificación
  retryAttempts: number; // Número máximo de reintentos
  showNotifications: boolean; // Mostrar notificaciones del sistema
  hapticFeedback: boolean; // Retroalimentación háptica
}

export class SmartRequestManager {
  private static instance: SmartRequestManager;
  private currentState: RequestState = RequestState.IDLE;
  private stateHistory: Array<{
    state: RequestState;
    timestamp: Date;
    metadata?: any;
  }> = [];
  private config: RequestStateConfig;
  private listeners: Map<string, Function[]> = new Map();
  private expirationTimer: NodeJS.Timeout | null = null;
  private retryCount = 0;

  private constructor(config: Partial<RequestStateConfig> = {}) {
    this.config = {
      autoExpireMs: 30000, // 30 segundos por defecto
      retryAttempts: 3,
      showNotifications: true,
      hapticFeedback: true,
      ...config,
    };
  }

  static getInstance(
    config?: Partial<RequestStateConfig>,
  ): SmartRequestManager {
    if (!SmartRequestManager.instance) {
      SmartRequestManager.instance = new SmartRequestManager(config);
    }
    return SmartRequestManager.instance;
  }

  /**
   * Transición a un nuevo estado
   */
  transitionTo(newState: RequestState, metadata?: any): void {
    const oldState = this.currentState;
    const transition = `${oldState} → ${newState}`;

    // Validar transición permitida
    if (!this.isValidTransition(oldState, newState)) {
      
      return;
    }

    // Limpiar timers si es necesario
    if (oldState === RequestState.NOTIFIED && this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }

    // Actualizar estado
    this.currentState = newState;
    this.addToHistory(newState, metadata);

    // Ejecutar acciones específicas del estado
    this.executeStateActions(newState, oldState, metadata);

    // Notificar listeners
    this.notifyListeners(newState, oldState, metadata);

    
  }

  /**
   * Obtener estado actual
   */
  getCurrentState(): RequestState {
    return this.currentState;
  }

  /**
   * Verificar si una transición es válida
   */
  private isValidTransition(from: RequestState, to: RequestState): boolean {
    const validTransitions: Record<RequestState, RequestState[]> = {
      [RequestState.IDLE]: [RequestState.NOTIFIED, RequestState.OFFLINE],
      [RequestState.NOTIFIED]: [
        RequestState.LOADING,
        RequestState.EXPIRED,
        RequestState.IDLE,
      ],
      [RequestState.LOADING]: [
        RequestState.LOADED,
        RequestState.ERROR,
        RequestState.OFFLINE,
      ],
      [RequestState.LOADED]: [RequestState.IDLE, RequestState.ERROR],
      [RequestState.EXPIRED]: [RequestState.IDLE],
      [RequestState.OFFLINE]: [RequestState.IDLE, RequestState.NOTIFIED],
      [RequestState.ERROR]: [RequestState.IDLE, RequestState.LOADING],
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Ejecutar acciones específicas para cada estado
   */
  private executeStateActions(
    newState: RequestState,
    oldState: RequestState,
    metadata?: any,
  ): void {
    switch (newState) {
      case RequestState.NOTIFIED:
        this.handleNotifiedState(metadata);
        break;

      case RequestState.LOADING:
        this.handleLoadingState();
        break;

      case RequestState.LOADED:
        this.handleLoadedState(metadata);
        break;

      case RequestState.ERROR:
        this.handleErrorState(metadata);
        break;

      case RequestState.EXPIRED:
        this.handleExpiredState();
        break;

      case RequestState.OFFLINE:
        this.handleOfflineState();
        break;
    }
  }

  private handleNotifiedState(metadata?: any): void {
    // Configurar auto-expiración
    if (this.config.autoExpireMs > 0) {
      this.expirationTimer = setTimeout(() => {
        this.transitionTo(RequestState.EXPIRED, { reason: "auto_expired" });
      }, this.config.autoExpireMs);
    }

    // Haptic feedback si está habilitado
    if (this.config.hapticFeedback) {
      // TODO: Implementar feedback háptico
      
    }
  }

  private handleLoadingState(): void {
    this.retryCount = 0; // Reset retry count
  }

  private handleLoadedState(metadata?: any): void {
    // Reset retry count on success
    this.retryCount = 0;
  }

  private handleErrorState(metadata?: any): void {
    // Implementar lógica de reintento
    if (this.retryCount < this.config.retryAttempts) {
      this.retryCount++;
      

      // Programar reintento con backoff exponencial
      const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 10000);
      setTimeout(() => {
        this.transitionTo(RequestState.LOADING, { retry: true });
      }, delay);
    } else {
      
    }
  }

  private handleExpiredState(): void {
    
  }

  private handleOfflineState(): void {
    
  }

  /**
   * Sistema de eventos para listeners externos
   */
  onStateChange(
    callback: (
      newState: RequestState,
      oldState: RequestState,
      metadata?: any,
    ) => void,
  ): void {
    if (!this.listeners.has("stateChange")) {
      this.listeners.set("stateChange", []);
    }
    this.listeners.get("stateChange")!.push(callback);
  }

  offStateChange(callback: Function): void {
    const listeners = this.listeners.get("stateChange");
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(
    newState: RequestState,
    oldState: RequestState,
    metadata?: any,
  ): void {
    const listeners = this.listeners.get("stateChange");
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(newState, oldState, metadata);
        } catch (error) {
          
        }
      });
    }
  }

  /**
   * Agregar entrada al historial
   */
  private addToHistory(state: RequestState, metadata?: any): void {
    this.stateHistory.push({
      state,
      timestamp: new Date(),
      metadata,
    });

    // Mantener máximo de 50 entradas
    if (this.stateHistory.length > 50) {
      this.stateHistory = this.stateHistory.slice(-50);
    }
  }

  /**
   * Obtener historial de estados
   */
  getStateHistory(
    limit = 10,
  ): Array<{ state: RequestState; timestamp: Date; metadata?: any }> {
    return this.stateHistory.slice(-limit);
  }

  /**
   * Obtener estadísticas de estado
   */
  getStats(): {
    currentState: RequestState;
    totalTransitions: number;
    timeInCurrentState: number;
    retryCount: number;
  } {
    const lastTransition = this.stateHistory[this.stateHistory.length - 1];
    const timeInCurrentState = lastTransition
      ? Date.now() - lastTransition.timestamp.getTime()
      : 0;

    return {
      currentState: this.currentState,
      totalTransitions: this.stateHistory.length,
      timeInCurrentState,
      retryCount: this.retryCount,
    };
  }

  /**
   * Reset completo del manager
   */
  reset(): void {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }

    this.currentState = RequestState.IDLE;
    this.stateHistory = [];
    this.retryCount = 0;

    
  }

  /**
   * Cleanup para evitar memory leaks
   */
  cleanup(): void {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }

    this.listeners.clear();
    
  }
}

// Exportar instancia singleton con configuración por defecto
export const smartRequestManager = SmartRequestManager.getInstance();
