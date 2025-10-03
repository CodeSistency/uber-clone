// Hook personalizado para gestionar búsquedas asíncronas de conductores
// Proporciona una interfaz unificada para iniciar, cancelar y confirmar búsquedas

import { useState, useEffect, useCallback, useRef } from 'react';
import { asyncDriverMatchingService, AsyncSearchParams, AsyncSearchState } from '@/app/services/asyncDriverMatchingService';
import { useMapFlowStore } from '@/store/mapFlow/mapFlow';
import {
  connectWebSocket,
  disconnectWebSocket,
  setupDefaultMatchingHandlers,
  setCurrentSearchId,
  isWebSocketConnected,
  getWebSocketConnectionState,
} from '@/lib/websocket/matchingEvents';
import { useUI } from '@/components/UIWrapper';
import { useSearchCache } from './useSearchCache';

export const useAsyncDriverSearch = () => {
  // Estado local del hook
  const [searchState, setSearchState] = useState<AsyncSearchState>({
    searchId: null,
    status: 'idle',
    matchedDriver: null,
    timeRemaining: 0,
    error: null,
    startTime: null,
  });

  // Estado de conexión WebSocket
  const [wsConnected, setWsConnected] = useState(false);
  const [wsConnectionState, setWsConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'>('disconnected');

  // Referencias para manejar timers y cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sistema de caché inteligente
  const searchCache = useSearchCache();

  // UI hooks
  const { showError, showSuccess } = useUI();

  // Store hooks
  const {
    rideId,
    confirmedOrigin,
    selectedTierId,
    selectedVehicleTypeId,
  } = useMapFlowStore();

  // =====================================================================================
  // FUNCIONES INTERNAS
  // =====================================================================================

  /**
   * Actualizar estado de búsqueda
   */
  const updateSearchState = useCallback((updates: Partial<AsyncSearchState>) => {
    setSearchState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Iniciar timer para countdown
   */
  const startTimer = useCallback((durationSeconds: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    startTimeRef.current = new Date();
    updateSearchState({
      startTime: startTimeRef.current,
      timeRemaining: durationSeconds,
    });

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current!.getTime()) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);

      updateSearchState({ timeRemaining: remaining });

      // Timeout alcanzado
      if (remaining === 0) {
        handleSearchTimeout();
      }
    }, 1000);
  }, [updateSearchState]);

  /**
   * Detener timer
   */
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  /**
   * Limpiar timers y polling
   */
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  /**
   * Handler para cuando se encuentra conductor
   */
  const handleDriverFound = useCallback((driver: any) => {
    console.log('[useAsyncDriverSearch] Driver found:', driver);

    // Invalidar caché cuando se encuentra conductor
    if (searchState.searchId) {
      searchCache.invalidateSearch(searchState.searchId);
    }

    updateSearchState({
      status: 'found',
      matchedDriver: driver,
    });

    stopTimer();
    clearTimers(); // Limpiar polling también
    showSuccess(
      "¡Conductor encontrado!",
      `${driver.firstName} está disponible para recogerte`
    );
  }, [updateSearchState, stopTimer, clearTimers, showSuccess, searchState.searchId, searchCache]);

  /**
   * Iniciar polling inteligente basado en caché
   */
  const startIntelligentPolling = useCallback((searchId: string, searchParams: AsyncSearchParams) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const pollStatus = async () => {
      try {
        if (searchState.status !== 'searching') return;

        const response = await asyncDriverMatchingService.getSearchStatus(searchId);

        // Actualizar tiempo restante si viene del backend
        if (response.timeRemaining !== undefined) {
          updateSearchState({ timeRemaining: response.timeRemaining });
        }

        // Si hay conductor encontrado, manejar
        if (response.matchedDriver) {
          handleDriverFound(response.matchedDriver);
        }

      } catch (error) {
        console.error('[useAsyncDriverSearch] Polling error:', error);
      }
    };

    // Intervalo inicial basado en caché
    let currentInterval = searchCache.getOptimalPollingInterval({
      lat: searchParams.lat,
      lng: searchParams.lng,
      tierId: searchParams.tierId,
      vehicleTypeId: searchParams.vehicleTypeId || 1,
      radiusKm: searchParams.radiusKm || 5,
    });

    console.log('[useAsyncDriverSearch] Starting intelligent polling with interval:', currentInterval);

    // Primer poll inmediato
    pollStatus();

    // Configurar polling con intervalo dinámico
    pollingIntervalRef.current = setInterval(() => {
      pollStatus();

      // Ajustar intervalo dinámicamente basado en tiempo transcurrido
      const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current.getTime() : 0;
      const elapsedMinutes = elapsed / (60 * 1000);

      // Aumentar intervalo gradualmente para reducir carga
      if (elapsedMinutes > 2 && currentInterval < 15000) {
        currentInterval = Math.min(currentInterval + 2000, 15000); // Máximo 15s
        console.debug('[useAsyncDriverSearch] Adjusted polling interval to:', currentInterval);
      }
    }, currentInterval);

  }, [searchState.status, searchCache, updateSearchState, handleDriverFound]);

  /**
   * Limpiar estado de búsqueda
   */
  const clearSearchState = useCallback(() => {
    stopTimer();
    setCurrentSearchId(null);
    updateSearchState({
      searchId: null,
      status: 'idle',
      matchedDriver: null,
      timeRemaining: 0,
      error: null,
      startTime: null,
    });
  }, [stopTimer, updateSearchState]);

  /**
   * Handler para timeout de búsqueda
   */
  const handleSearchTimeout = useCallback(() => {
    console.log('[useAsyncDriverSearch] Search timeout');

    // Invalidar caché cuando expira la búsqueda
    if (searchState.searchId) {
      searchCache.invalidateSearch(searchState.searchId);
    }

    updateSearchState({
      status: 'timeout',
      timeRemaining: 0,
    });

    stopTimer();
    clearTimers(); // Limpiar polling también
    showError(
      "Sin conductores disponibles",
      "No se encontraron conductores en tu área. ¿Quieres intentar nuevamente?"
    );
  }, [updateSearchState, stopTimer, clearTimers, showError, searchState.searchId, searchCache]);

  /**
   * Handler para búsqueda cancelada
   */
  const handleSearchCancelled = useCallback(() => {
    console.log('[useAsyncDriverSearch] Search cancelled');

    clearSearchState();
    showSuccess(
      "Búsqueda cancelada",
      "Puedes modificar tu pedido e intentar nuevamente"
    );
  }, [clearSearchState, showSuccess]);

  // =====================================================================================
  // FUNCIONES PÚBLICAS DEL HOOK
  // =====================================================================================

  /**
   * Iniciar búsqueda asíncrona
   */
  const startSearch = useCallback(async (
    params?: Partial<AsyncSearchParams>
  ): Promise<boolean> => {
    try {
      // Validar que tenemos los datos necesarios
      if (!confirmedOrigin?.latitude || !confirmedOrigin?.longitude) {
        throw new Error("Ubicación de origen no disponible");
      }

      if (!selectedTierId) {
        throw new Error("Tier de vehículo no seleccionado");
      }

      // Preparar parámetros de búsqueda
      const searchParams: AsyncSearchParams = {
        lat: confirmedOrigin.latitude,
        lng: confirmedOrigin.longitude,
        tierId: selectedTierId,
        vehicleTypeId: selectedVehicleTypeId || 1,
        radiusKm: params?.radiusKm || 5,
        maxWaitTime: params?.maxWaitTime || 300,
        priority: params?.priority || 'normal',
      };

      console.log('[useAsyncDriverSearch] Starting search with params:', searchParams);

      // Verificar caché antes de iniciar búsqueda
      const cachedSearch = searchCache.getCachedSearch({
        lat: searchParams.lat,
        lng: searchParams.lng,
        tierId: searchParams.tierId,
        vehicleTypeId: searchParams.vehicleTypeId || 1,
        radiusKm: searchParams.radiusKm || 5,
      });

      if (cachedSearch) {
        console.log('[useAsyncDriverSearch] Using cached search:', cachedSearch.searchId);

        // Actualizar estado con búsqueda cacheada
        updateSearchState({
          searchId: cachedSearch.searchId,
          status: 'searching',
          error: null,
        });

        // Configurar polling inteligente
        startIntelligentPolling(cachedSearch.searchId, searchParams);

        return true;
      }

      // Actualizar estado local
      updateSearchState({
        status: 'searching',
        error: null,
      });

      // Conectar WebSocket si no está conectado
      if (!isWebSocketConnected()) {
        console.log('[useAsyncDriverSearch] Connecting to WebSocket...');
        await connectWebSocket();

        // Configurar handlers de eventos
        setupDefaultMatchingHandlers({
          onDriverFound: handleDriverFound,
          onSearchTimeout: handleSearchTimeout,
          onSearchCancelled: handleSearchCancelled,
        });
      }

      // Iniciar búsqueda en el backend
      const response = await asyncDriverMatchingService.startAsyncSearch(searchParams);

      console.log('[useAsyncDriverSearch] Search started:', response.searchId);

      // Cachear la búsqueda para futuras optimizaciones
      searchCache.cacheSearch(response.searchId, {
        lat: searchParams.lat,
        lng: searchParams.lng,
        tierId: searchParams.tierId,
        vehicleTypeId: searchParams.vehicleTypeId || 1,
        radiusKm: searchParams.radiusKm || 5,
      });

      // Actualizar estado con searchId
      updateSearchState({
        searchId: response.searchId,
      });

      // Configurar searchId para WebSocket
      setCurrentSearchId(response.searchId);

      // Iniciar timer
      startTimer(response.timeRemaining);

      // Iniciar polling inteligente
      startIntelligentPolling(response.searchId, searchParams);

      return true;

    } catch (error: any) {
      console.error('[useAsyncDriverSearch] Error starting search:', error);

      updateSearchState({
        status: 'idle',
        error: error.message,
      });

      showError("Error al iniciar búsqueda", error.message);
      return false;
    }
  }, [
    confirmedOrigin,
    selectedTierId,
    selectedVehicleTypeId,
    updateSearchState,
    handleDriverFound,
    handleSearchTimeout,
    handleSearchCancelled,
    startTimer,
    showError,
  ]);

  /**
   * Cancelar búsqueda activa
   */
  const cancelSearch = useCallback(async (): Promise<boolean> => {
    try {
      if (!searchState.searchId) {
        console.log('[useAsyncDriverSearch] No active search to cancel');
        return true;
      }

      console.log('[useAsyncDriverSearch] Cancelling search:', searchState.searchId);

      // Cancelar en backend
      await asyncDriverMatchingService.cancelSearch(searchState.searchId);

      // Limpiar estado local
      clearSearchState();

      return true;

    } catch (error: any) {
      console.error('[useAsyncDriverSearch] Error cancelling search:', error);

      // Aun así limpiar estado local
      clearSearchState();

      showError("Error al cancelar búsqueda", error.message);
      return false;
    }
  }, [searchState.searchId, clearSearchState, showError]);

  /**
   * Confirmar conductor encontrado
   */
  const confirmDriver = useCallback(async (driverId: number): Promise<boolean> => {
    try {
      if (!searchState.searchId || !searchState.matchedDriver) {
        throw new Error("No hay búsqueda activa o conductor para confirmar");
      }

      console.log('[useAsyncDriverSearch] Confirming driver:', driverId);

      // Confirmar en backend
      await asyncDriverMatchingService.confirmDriver(searchState.searchId, {
        driverId,
        notes: "Conductor confirmado automáticamente",
      });

      // Actualizar estado
      updateSearchState({
        status: 'idle', // Reset para próxima búsqueda
      });

      stopTimer();
      showSuccess(
        "¡Conductor confirmado!",
        "Tu conductor está en camino"
      );

      return true;

    } catch (error: any) {
      console.error('[useAsyncDriverSearch] Error confirming driver:', error);

      showError("Error al confirmar conductor", error.message);
      return false;
    }
  }, [searchState.searchId, searchState.matchedDriver, updateSearchState, stopTimer, showSuccess, showError]);

  /**
   * Reintentar búsqueda con mismos parámetros
   */
  const retrySearch = useCallback(async (): Promise<boolean> => {
    console.log('[useAsyncDriverSearch] Retrying search...');

    // Limpiar estado anterior
    clearSearchState();

    // Iniciar nueva búsqueda
    return await startSearch();
  }, [clearSearchState, startSearch]);

  /**
   * Obtener estado de búsqueda actual
   */
  const getSearchStatus = useCallback(async () => {
    try {
      if (!searchState.searchId) {
        return null;
      }

      const status = await asyncDriverMatchingService.getSearchStatus(searchState.searchId);

      // Actualizar estado local si es necesario
      updateSearchState({
        status: status.status,
        matchedDriver: status.matchedDriver || null,
        timeRemaining: status.timeRemaining,
      });

      return status;

    } catch (error: any) {
      console.error('[useAsyncDriverSearch] Error getting search status:', error);
      return null;
    }
  }, [searchState.searchId, updateSearchState]);

  // =====================================================================================
  // EFECTOS DEL HOOK
  // =====================================================================================

  /**
   * Efecto para monitorear estado de WebSocket
   */
  useEffect(() => {
    const checkWebSocketState = () => {
      const connected = isWebSocketConnected();
      const state = getWebSocketConnectionState();

      setWsConnected(connected);
      setWsConnectionState(state);
    };

    // Verificar estado inicial
    checkWebSocketState();

    // Verificar periódicamente (cada 2 segundos)
    const interval = setInterval(checkWebSocketState, 2000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Efecto de cleanup al desmontar
   */
  useEffect(() => {
    return () => {
      // Limpiar timer
      stopTimer();

      // Desconectar WebSocket si es necesario
      // Nota: Podríamos dejarlo conectado para otras partes de la app
    };
  }, [stopTimer]);

  // =====================================================================================
  // RETORNO DEL HOOK
  // =====================================================================================

  return {
    // Estado de búsqueda
    searchState,

    // Estado de WebSocket
    wsConnected,
    wsConnectionState,

    // Métodos de búsqueda
    startSearch,
    cancelSearch,
    confirmDriver,
    retrySearch,
    getSearchStatus,

    // Utilidades
    clearSearchState,
  };
};
