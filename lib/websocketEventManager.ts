import { log } from "./logger";

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
    log.info("Initialized WebSocket Event Manager", {
      component: "WebSocketEventManager",
      action: "initialized"
    });
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
          `Created listener array for event: ${event}`,
          {
            component: "WebSocketEventManager",
            action: "create_listener_array",
            data: { event }
          }
        );
      }

      const callbacks = this.listeners.get(event)!;
      if (!callbacks.includes(callback)) {
        callbacks.push(callback);
        log.debug(
          `Added listener for event: ${event} (total: ${callbacks.length})`,
          {
            component: "WebSocketEventManager",
            action: "add_listener",
            data: { event, total: callbacks.length }
          }
        );
      } else {
        log.warn(
          `Listener already registered for event: ${event}`,
          {
            component: "WebSocketEventManager",
            action: "listener_already_registered",
            data: { event }
          }
        );
      }
    } catch (error) {
      log.error(
        `Error registering listener for event ${event}:`,
        {
          component: "WebSocketEventManager",
          action: "register_listener_error",
          data: { 
            event, 
            error: error instanceof Error ? error.message : String(error) 
          }
        }
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
          `No listeners found for event: ${event}`,
          {
            component: "WebSocketEventManager",
            action: "no_listeners_found",
            data: { event }
          }
        );
        return;
      }

      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        log.debug(
          `Removed listener for event: ${event} (remaining: ${callbacks.length})`,
          {
            component: "WebSocketEventManager",
            action: "remove_listener",
            data: { event, remaining: callbacks.length }
          }
        );

        // Limpiar el array si no quedan listeners
        if (callbacks.length === 0) {
          this.listeners.delete(event);
          log.debug(
            `Cleaned up empty listener array for event: ${event}`,
            {
              component: "WebSocketEventManager",
              action: "cleanup_empty_array",
              data: { event }
            }
          );
        }
      } else {
        log.warn(
          `Listener not found for event: ${event}`,
          {
            component: "WebSocketEventManager",
            action: "listener_not_found",
            data: { event }
          }
        );
      }
    } catch (error) {
      log.error(
        `Error removing listener for event ${event}:`,
        {
          component: "WebSocketEventManager",
          action: "remove_listener_error",
          data: { 
            event, 
            error: error instanceof Error ? error.message : String(error) 
          }
        }
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
        log.debug(`No listeners for event: ${event}`, {
          component: "WebSocketEventManager",
          action: "no_listeners",
          data: { event }
        });
        return;
      }

      log.debug(
        `Emitting event: ${event} to ${callbacks.length} listeners`,
        {
          component: "WebSocketEventManager",
          action: "emit_event",
          data: { event, listenerCount: callbacks.length }
        }
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
            `Error in listener ${index} for event ${event}:`,
            {
              component: "WebSocketEventManager",
              action: "listener_error",
              data: { 
                event, 
                listenerIndex: index,
                error: error instanceof Error ? error.message : String(error) 
              }
            }
          );
          // No throw aquí para no detener otros listeners
        }
      });

      // Esperar que todos los callbacks terminen (si son async)
      Promise.all(promises)
        .then(() => {
          const duration = Date.now() - startTime;
          log.debug(
            `Event ${event} emitted successfully in ${duration}ms`,
            {
              component: "WebSocketEventManager",
              action: "event_emitted_success",
              data: { event, duration }
            }
          );
        })
        .catch((error) => {
          log.error(
            `Error in async listeners for event ${event}:`,
            {
              component: "WebSocketEventManager",
              action: "async_listeners_error",
              data: { 
                event,
                error: error instanceof Error ? error.message : String(error) 
              }
            }
          );
        });
    } catch (error) {
      log.error(
        `Error emitting event ${event}:`,
        {
          component: "WebSocketEventManager",
          action: "emit_event_error",
          data: { 
            event,
            error: error instanceof Error ? error.message : String(error) 
          }
        }
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
    log.info("Cleared all listeners", {
      component: "WebSocketEventManager",
      action: "clear_all_listeners"
    });
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
