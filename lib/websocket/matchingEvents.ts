// Integración WebSocket para eventos de matching asíncrono
// Maneja la conexión WebSocket y los eventos específicos de búsqueda de conductores

import io, { Socket } from 'socket.io-client';
import { websocketEventManager } from '../websocketEventManager';
import { MatchingWebSocketEvent, MATCHING_EVENTS } from '../../app/services/asyncDriverMatchingService';

// Estados de conexión WebSocket
export type WebSocketConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

// Configuración de WebSocket para matching
interface WebSocketMatchingConfig {
  url: string;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  timeout: number;
  maxReconnectionDelay: number;
  exponentialBackoff: boolean;
  heartbeatInterval: number;
  heartbeatTimeout: number;
}

// Configuración por defecto optimizada
const DEFAULT_CONFIG: WebSocketMatchingConfig = {
  url: 'http://72.60.119.19:3001/uber-realtime',
  reconnectionAttempts: 10,          // Más intentos
  reconnectionDelay: 500,            // Inicio más rápido
  maxReconnectionDelay: 30000,       // Máximo 30 segundos
  timeout: 15000,                    // Timeout más corto
  exponentialBackoff: true,          // Backoff exponencial
  heartbeatInterval: 30000,          // Heartbeat cada 30s
  heartbeatTimeout: 5000,            // Timeout de heartbeat
};

// Estado de la conexión WebSocket
interface WebSocketMatchingState {
  socket: Socket | null;
  connectionState: WebSocketConnectionState;
  userId: number | null;
  searchId: string | null;
  config: WebSocketMatchingConfig;
  reconnectionCount: number;
  lastHeartbeat: Date | null;
  heartbeatTimer: NodeJS.Timeout | null;
}

// Estado singleton
let matchingState: WebSocketMatchingState = {
  socket: null,
  connectionState: 'disconnected',
  userId: null,
  searchId: null,
  config: DEFAULT_CONFIG,
  reconnectionCount: 0,
  lastHeartbeat: null,
  heartbeatTimer: null,
};

// Funciones de utilidad para obtener tokens de autenticación
const getAuthToken = (): string | null => {
  // TODO: Implementar según tu sistema de autenticación
  // Podría ser desde AsyncStorage, SecureStore, etc.
  return null; // Temporalmente
};

const getCurrentUserId = (): number | null => {
  // TODO: Implementar según tu sistema de estado de usuario
  return null; // Temporalmente
};

// Función para calcular delay de reconexión con backoff exponencial
const calculateReconnectionDelay = (attempt: number, baseDelay: number, maxDelay: number): number => {
  if (!matchingState.config.exponentialBackoff) {
    return Math.min(baseDelay * (attempt + 1), maxDelay);
  }

  // Backoff exponencial: baseDelay * 2^attempt, con jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay; // ±10% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
};

// Función para iniciar heartbeat
const startHeartbeat = () => {
  if (matchingState.heartbeatTimer) {
    clearInterval(matchingState.heartbeatTimer);
  }

  matchingState.heartbeatTimer = setInterval(() => {
    if (matchingState.socket?.connected) {
      const now = Date.now();
      matchingState.lastHeartbeat = new Date(now);

      // Enviar ping al servidor
      matchingState.socket.emit('ping', { timestamp: now });

      // Configurar timeout para respuesta pong
      const pongTimeout = setTimeout(() => {
        
        // Podríamos intentar reconectar si hay múltiples timeouts
      }, matchingState.config.heartbeatTimeout);

      // Escuchar respuesta pong (una sola vez)
      matchingState.socket.once('pong', (data) => {
        clearTimeout(pongTimeout);
        const latency = Date.now() - data.timestamp;
        console.debug(`[WebSocketMatching] Heartbeat OK - latency: ${latency}ms`);
      });
    }
  }, matchingState.config.heartbeatInterval);
};

// Función para detener heartbeat
const stopHeartbeat = () => {
  if (matchingState.heartbeatTimer) {
    clearInterval(matchingState.heartbeatTimer);
    matchingState.heartbeatTimer = null;
  }
  matchingState.lastHeartbeat = null;
};

/**
 * Conectar al servidor WebSocket para matching con optimizaciones
 */
export const connectWebSocket = async (
  userId?: number,
  config?: Partial<WebSocketMatchingConfig>
): Promise<boolean> => {
  try {
    // Si ya está conectado, retornar true
    if (matchingState.socket?.connected) {
      
      return true;
    }

    // Actualizar configuración si se proporciona
    if (config) {
      matchingState.config = { ...DEFAULT_CONFIG, ...config };
    }

    // Actualizar userId
    if (userId) {
      matchingState.userId = userId;
    } else {
      matchingState.userId = getCurrentUserId();
    }

    matchingState.connectionState = 'connecting';
    

    // Crear nueva conexión con configuración optimizada
    const socket = io(matchingState.config.url, {
      auth: {
        token: getAuthToken(),
      },
      reconnection: false, // Manejamos reconexión manualmente para mejor control
      timeout: matchingState.config.timeout,
    });

    matchingState.socket = socket;

    return new Promise((resolve, reject) => {
      // Evento de conexión exitosa
      socket.on('connect', () => {
        
        matchingState.connectionState = 'connected';
        matchingState.reconnectionCount = 0; // Reset counter

        // Unirse a sala de usuario para notificaciones
        if (matchingState.userId) {
          socket.emit('join-user-room', { userId: matchingState.userId });
          
        }

        // Iniciar heartbeat para mantener conexión viva
        startHeartbeat();

        resolve(true);
      });

      // Evento de reconexión automática (por si acaso)
      socket.on('reconnect', (attemptNumber) => {
        
        matchingState.connectionState = 'connected';
        matchingState.reconnectionCount = 0;
        startHeartbeat();
      });

      // Evento de desconexión
      socket.on('disconnect', (reason) => {
        
        matchingState.connectionState = 'disconnected';
        stopHeartbeat(); // Detener heartbeat

        if (reason === 'io server disconnect') {
          // El servidor desconectó intencionalmente
          
        } else if (reason !== 'io client disconnect') {
          // Intentar reconectar automáticamente si no fue desconexión intencional
          attemptReconnection();
        }
      });

      // Evento de error de conexión
      socket.on('connect_error', (error) => {
        
        matchingState.connectionState = 'error';
        stopHeartbeat();

        // Intentar reconectar con backoff exponencial
        attemptReconnection();
        reject(error);
      });

      // Configurar timeout de conexión
      setTimeout(() => {
        if (matchingState.connectionState === 'connecting') {
          
          matchingState.connectionState = 'error';
          stopHeartbeat();
          socket.disconnect();
          attemptReconnection();
          reject(new Error('Connection timeout'));
        }
      }, matchingState.config.timeout);
    });

  } catch (error) {
    
    matchingState.connectionState = 'error';
    stopHeartbeat();
    return false;
  }
};

// Función para intentar reconexión con backoff exponencial
const attemptReconnection = () => {
  if (matchingState.reconnectionCount >= matchingState.config.reconnectionAttempts) {
    
    return;
  }

  matchingState.reconnectionCount++;
  matchingState.connectionState = 'reconnecting';

  const delay = calculateReconnectionDelay(
    matchingState.reconnectionCount - 1,
    matchingState.config.reconnectionDelay,
    matchingState.config.maxReconnectionDelay
  );

  

  setTimeout(() => {
    if (matchingState.connectionState === 'reconnecting') {
      connectWebSocket().catch((error) => {
        
      });
    }
  }, delay);
};

/**
 * Desconectar del servidor WebSocket
 */
export const disconnectWebSocket = (): void => {
  if (matchingState.socket) {
    
    stopHeartbeat(); // Detener heartbeat primero
    matchingState.socket.disconnect();
    matchingState.socket = null;
    matchingState.connectionState = 'disconnected';
    matchingState.userId = null;
    matchingState.searchId = null;
    matchingState.reconnectionCount = 0;
  }
};

/**
 * Configurar listeners para eventos de matching
 */
export const setupMatchingEventListeners = (
  onDriverFound?: (data: any) => void,
  onSearchTimeout?: (data: any) => void,
  onSearchCancelled?: (data: any) => void
): void => {
  if (!matchingState.socket) {
    
    return;
  }

  

  // Listener principal para eventos de matching
  const handleMatchingEvent = (event: MatchingWebSocketEvent) => {
    

    const { type, searchId, userId, data } = event;

    // Verificar que el evento sea para este usuario/búsqueda
    if (userId && matchingState.userId && userId !== matchingState.userId) {
      
      return;
    }

    if (searchId && matchingState.searchId && searchId !== matchingState.searchId) {
      
      return;
    }

    // Procesar evento según tipo
    switch (type) {
      case MATCHING_EVENTS.DRIVER_FOUND:
        
        if (onDriverFound) {
          onDriverFound(data);
        }
        // También emitir a través del event manager
        websocketEventManager.emit('matching-driver-found', data);
        break;

      case MATCHING_EVENTS.SEARCH_TIMEOUT:
        
        if (onSearchTimeout) {
          onSearchTimeout(data);
        }
        websocketEventManager.emit('matching-search-timeout', data);
        break;

      case MATCHING_EVENTS.SEARCH_CANCELLED:
        
        if (onSearchCancelled) {
          onSearchCancelled(data);
        }
        websocketEventManager.emit('matching-search-cancelled', data);
        break;

      default:
        
    }
  };

  // Registrar listener para eventos de matching
  matchingState.socket.on('matching-event', handleMatchingEvent);

  // También registrar en el event manager para consistencia
  websocketEventManager.on('matching-driver-found', (data: any) => {
    
  });

  websocketEventManager.on('matching-search-timeout', (data: any) => {
    
  });

  websocketEventManager.on('matching-search-cancelled', (data: any) => {
    
  });

  
};

/**
 * Actualizar el searchId actual para filtrar eventos
 */
export const setCurrentSearchId = (searchId: string | null): void => {
  matchingState.searchId = searchId;
  
};

/**
 * Obtener estado actual de la conexión WebSocket
 */
export const getWebSocketConnectionState = (): WebSocketConnectionState => {
  return matchingState.connectionState;
};

/**
 * Obtener información de estado completa
 */
export const getWebSocketMatchingState = (): WebSocketMatchingState => {
  return { ...matchingState };
};

/**
 * Obtener estadísticas de conexión optimizadas
 */
export const getWebSocketStats = () => {
  const now = Date.now();
  const lastHeartbeatMs = matchingState.lastHeartbeat ? now - matchingState.lastHeartbeat.getTime() : null;

  return {
    connected: isWebSocketConnected(),
    connectionState: matchingState.connectionState,
    userId: matchingState.userId,
    searchId: matchingState.searchId,
    reconnectionCount: matchingState.reconnectionCount,
    lastHeartbeat: matchingState.lastHeartbeat,
    timeSinceLastHeartbeat: lastHeartbeatMs,
    config: matchingState.config,
  };
};

/**
 * Verificar si está conectado
 */
export const isWebSocketConnected = (): boolean => {
  return matchingState.socket?.connected === true;
};

/**
 * Reintentar conexión (útil después de errores)
 */
export const retryWebSocketConnection = async (
  userId?: number
): Promise<boolean> => {
  

  // Desconectar primero si hay conexión existente
  disconnectWebSocket();

  // Intentar reconectar
  return await connectWebSocket(userId);
};

/**
 * Limpiar todos los listeners (útil para testing o reinicio)
 */
export const clearMatchingEventListeners = (): void => {
  if (matchingState.socket) {
    matchingState.socket.off('matching-event');
    
  }

  // También limpiar del event manager
  websocketEventManager.clearAllListeners();
};

// =====================================================================================
// HANDLERS ESPECÍFICOS PARA EVENTOS DE MATCHING
// =====================================================================================

/**
 * Handler para evento 'driver-found'
 * Se ejecuta cuando el backend encuentra un conductor disponible
 */
export const handleDriverFoundEvent = (data: any, callback?: (driver: any) => void): void => {
  try {
    

    // Validar datos del conductor
    if (!data || !data.driverId) {
      
      return;
    }

    // Transformar datos si es necesario (similar a lo que hace el servicio)
    const driverData = {
      id: data.driverId,
      firstName: data.firstName || 'Conductor',
      lastName: data.lastName || '',
      profileImageUrl: data.profileImageUrl || 'https://via.placeholder.com/100',
      carModel: data.vehicle?.carModel || 'Vehículo',
      licensePlate: data.vehicle?.licensePlate || 'ABC-123',
      carSeats: data.vehicle?.carSeats || 4,
      rating: data.rating || 0,
      time: data.location?.estimatedArrival || 0,
      price: `$${data.pricing?.estimatedFare?.toFixed(2) || '0.00'}`,
      distance: `${data.location?.distance?.toFixed(1) || '0'} km`,
      tierId: data.pricing?.tierId || 1,
      tierName: data.pricing?.tierName || 'Estándar',
      matchScore: data.matchScore || 0,
      totalRides: data.totalRides || 0,
    };

    

    // Ejecutar callback personalizado si existe
    if (callback) {
      callback(driverData);
    }

    // También mostrar notificación al usuario
    showDriverFoundNotification(driverData);

  } catch (error) {
    
  }
};

/**
 * Handler para evento 'search-timeout'
 * Se ejecuta cuando la búsqueda expira sin encontrar conductor
 */
export const handleSearchTimeoutEvent = (data: any, callback?: () => void): void => {
  try {
    

    // Mostrar mensaje de timeout al usuario
    showSearchTimeoutNotification();

    // Ejecutar callback personalizado si existe
    if (callback) {
      callback();
    }

    // Limpiar estado de búsqueda
    setCurrentSearchId(null);

  } catch (error) {
    
  }
};

/**
 * Handler para evento 'search-cancelled'
 * Se ejecuta cuando la búsqueda es cancelada
 */
export const handleSearchCancelledEvent = (data: any, callback?: () => void): void => {
  try {
    

    // Mostrar mensaje de cancelación
    showSearchCancelledNotification();

    // Ejecutar callback personalizado si existe
    if (callback) {
      callback();
    }

    // Limpiar estado de búsqueda
    setCurrentSearchId(null);

  } catch (error) {
    
  }
};

// =====================================================================================
// FUNCIONES DE UI/NOTIFICACIONES
// =====================================================================================

/**
 * Mostrar notificación cuando se encuentra conductor
 */
const showDriverFoundNotification = (driver: any): void => {
  // Aquí podrías integrar con tu sistema de notificaciones
  // Por ejemplo: showSuccess, mostrar modal, etc.
  

  // Emitir evento para que otros componentes puedan reaccionar
  websocketEventManager.emit('driver-notification', {
    type: 'driver-found',
    driver: driver,
    message: `¡Conductor encontrado! ${driver.firstName} está disponible`,
  });
};

/**
 * Mostrar notificación cuando la búsqueda expira
 */
const showSearchTimeoutNotification = (): void => {
  

  websocketEventManager.emit('driver-notification', {
    type: 'search-timeout',
    message: 'No se encontraron conductores disponibles en tu área. ¿Quieres intentar nuevamente?',
  });
};

/**
 * Mostrar notificación cuando la búsqueda es cancelada
 */
const showSearchCancelledNotification = (): void => {
  

  websocketEventManager.emit('driver-notification', {
    type: 'search-cancelled',
    message: 'Búsqueda cancelada. Puedes modificar tu pedido e intentar nuevamente.',
  });
};

// =====================================================================================
// FUNCIONES DE GESTIÓN DE ESTADO WEBSOCKET
// =====================================================================================

/**
 * Configurar handlers automáticos para eventos de matching
 * Esta función configura todos los handlers por defecto
 */
export const setupDefaultMatchingHandlers = (
  customHandlers?: {
    onDriverFound?: (driver: any) => void;
    onSearchTimeout?: () => void;
    onSearchCancelled?: () => void;
  }
): void => {
  

  setupMatchingEventListeners(
    (data) => handleDriverFoundEvent(data, customHandlers?.onDriverFound),
    (data) => handleSearchTimeoutEvent(data, customHandlers?.onSearchTimeout),
    (data) => handleSearchCancelledEvent(data, customHandlers?.onSearchCancelled)
  );
};


/**
 * Verificar si hay errores de conexión recientes
 */
export const hasConnectionErrors = (): boolean => {
  return matchingState.connectionState === 'error';
};

/**
 * Resetear estado de conexión (útil para testing)
 */
export const resetWebSocketState = (): void => {
  
  stopHeartbeat(); // Limpiar heartbeat
  matchingState = {
    socket: null,
    connectionState: 'disconnected',
    userId: null,
    searchId: null,
    config: DEFAULT_CONFIG,
    reconnectionCount: 0,
    lastHeartbeat: null,
    heartbeatTimer: null,
  };
};
