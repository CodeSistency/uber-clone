import { log, LogLevel } from "./logger";

/**
 * WebSocket Event Manager
 *
 * Sistema centralizado para manejar eventos WebSocket de manera organizada y desacoplada.
 * Permite suscribirse, emitir y desuscribirse de eventos de manera type-safe.
 */
export class WebSocketEventManager {
  private static instance: WebSocketEventManager;
  private listeners: Map<string, Function[]> = new Map();
  private eventHistory: Array<{ event: string; data: any; timestamp: Date }> =
    [];
  private maxHistorySize = 100;

  /**
   * Singleton pattern para asegurar una única instancia
   */
  static getInstance(): WebSocketEventManager {
    if (!WebSocketEventManager.instance) {
      WebSocketEventManager.instance = new WebSocketEventManager();
    }
    return WebSocketEventManager.instance;
  }

  /**
   * Constructor privado para singleton
   */
  private constructor() {
    log.info("WebSocketEventManager", "Initialized WebSocket Event Manager");
  }

  /**
   * Registrar un listener para un evento específico
   * @param event Nombre del evento
   * @param callback Función a ejecutar cuando llegue el evento
   */
  on(event: string, callback: Function): void {
    try {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
        log.debug(
          "WebSocketEventManager",
          `Created listener array for event: ${event}`,
        );
      }

      const callbacks = this.listeners.get(event)!;
      if (!callbacks.includes(callback)) {
        callbacks.push(callback);
        log.debug(
          "WebSocketEventManager",
          `Added listener for event: ${event} (total: ${callbacks.length})`,
        );
      } else {
        log.warn(
          "WebSocketEventManager",
          `Listener already registered for event: ${event}`,
        );
      }
    } catch (error) {
      log.error(
        "WebSocketEventManager",
        `Error registering listener for event ${event}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Remover un listener específico para un evento
   * @param event Nombre del evento
   * @param callback Función a remover
   */
  off(event: string, callback: Function): void {
    try {
      const callbacks = this.listeners.get(event);
      if (!callbacks) {
        log.warn(
          "WebSocketEventManager",
          `No listeners found for event: ${event}`,
        );
        return;
      }

      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        log.debug(
          "WebSocketEventManager",
          `Removed listener for event: ${event} (remaining: ${callbacks.length})`,
        );

        // Limpiar el array si no quedan listeners
        if (callbacks.length === 0) {
          this.listeners.delete(event);
          log.debug(
            "WebSocketEventManager",
            `Cleaned up empty listener array for event: ${event}`,
          );
        }
      } else {
        log.warn(
          "WebSocketEventManager",
          `Listener not found for event: ${event}`,
        );
      }
    } catch (error) {
      log.error(
        "WebSocketEventManager",
        `Error removing listener for event ${event}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Emitir un evento a todos los listeners registrados
   * @param event Nombre del evento
   * @param data Datos a enviar con el evento
   */
  emit(event: string, data: any): void {
    const startTime = Date.now();

    try {
      // Registrar en historial
      this.addToHistory(event, data);

      const callbacks = this.listeners.get(event);
      if (!callbacks || callbacks.length === 0) {
        log.debug("WebSocketEventManager", `No listeners for event: ${event}`);
        return;
      }

      log.debug(
        "WebSocketEventManager",
        `Emitting event: ${event} to ${callbacks.length} listeners`,
      );

      // Ejecutar todos los callbacks
      const promises = callbacks.map(async (callback, index) => {
        try {
          const result = callback(data);
          // Si el callback retorna una Promise, esperarla
          if (result && typeof result.then === "function") {
            await result;
          }
        } catch (error) {
          log.error(
            "WebSocketEventManager",
            `Error in listener ${index} for event ${event}:`,
            error,
          );
          // No throw aquí para no detener otros listeners
        }
      });

      // Esperar que todos los callbacks terminen (si son async)
      Promise.all(promises)
        .then(() => {
          const duration = Date.now() - startTime;
          log.debug(
            "WebSocketEventManager",
            `Event ${event} emitted successfully in ${duration}ms`,
          );
        })
        .catch((error) => {
          log.error(
            "WebSocketEventManager",
            `Error in async listeners for event ${event}:`,
            error,
          );
        });
    } catch (error) {
      log.error(
        "WebSocketEventManager",
        `Error emitting event ${event}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Obtener lista de eventos disponibles
   */
  getAvailableEvents(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Obtener cantidad de listeners por evento
   */
  getListenerCount(event?: string): number | Record<string, number> {
    if (event) {
      return this.listeners.get(event)?.length || 0;
    }

    const counts: Record<string, number> = {};
    for (const [eventName, callbacks] of this.listeners) {
      counts[eventName] = callbacks.length;
    }
    return counts;
  }

  /**
   * Limpiar todos los listeners (útil para testing)
   */
  clearAllListeners(): void {
    this.listeners.clear();
    log.info("WebSocketEventManager", "Cleared all listeners");
  }

  /**
   * Obtener historial de eventos recientes
   */
  getEventHistory(
    limit = 10,
  ): Array<{ event: string; data: any; timestamp: Date }> {
    return this.eventHistory.slice(-limit);
  }

  /**
   * Agregar evento al historial
   */
  private addToHistory(event: string, data: any): void {
    this.eventHistory.push({
      event,
      data,
      timestamp: new Date(),
    });

    // Mantener tamaño máximo del historial
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }
}

/**
 * Instancia singleton del WebSocket Event Manager
 */
export const websocketEventManager = WebSocketEventManager.getInstance();

/**
 * Helper functions para facilitar el uso
 */
export const wsEvents = {
  // Registro rápido de listeners
  on: (event: string, callback: Function) =>
    websocketEventManager.on(event, callback),

  // Emisión rápida de eventos
  emit: (event: string, data: any) => websocketEventManager.emit(event, data),

  // Remoción rápida de listeners
  off: (event: string, callback: Function) =>
    websocketEventManager.off(event, callback),

  // Información del sistema
  getStats: () => ({
    listeners: websocketEventManager.getListenerCount(),
    history: websocketEventManager.getEventHistory(5),
  }),
};
