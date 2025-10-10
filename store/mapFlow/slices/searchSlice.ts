import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  AsyncSearchState, 
  DriverSnapshot, 
  AsyncSearchUpdatePayload 
} from '../types';
import { mapFlowLogger } from '../logger';

/**
 * Slice para manejar búsqueda asíncrona de conductores del MapFlow
 * Responsabilidades:
 * - Estado de búsqueda async (asyncSearch)
 * - Timers y timeouts
 * - Manejo de errores de búsqueda
 * - Confirmación de conductores
 */
export interface SearchSlice {
  // Estado
  asyncSearch: AsyncSearchState;
  asyncSearchTimer: ReturnType<typeof setInterval> | null;
  
  // Actions de búsqueda
  startAsyncSearch: (searchId: string, timeRemaining: number) => void;
  updateAsyncSearchStatus: (status: AsyncSearchState['status'], data?: AsyncSearchUpdatePayload) => void;
  cancelAsyncSearch: () => void;
  confirmAsyncDriver: (driverId: number) => void;
  
  // Actions de timer
  startAsyncSearchTimer: () => void;
  stopAsyncSearchTimer: () => void;
  calculateTimeRemaining: () => number;
  
  // Selectors
  getAsyncSearchState: () => AsyncSearchState;
  isSearching: () => boolean;
  getTimeRemaining: () => number;
  hasSearchError: () => boolean;
  getSearchError: () => string | null;
  getMatchedDriver: () => DriverSnapshot | null;
}

export const useSearchSlice = create<SearchSlice>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    asyncSearch: {
      searchId: null,
      status: 'idle',
      matchedDriver: null,
      timeRemaining: 0,
      error: null,
      startTime: undefined,
    },
    asyncSearchTimer: null,
    
    // Actions de búsqueda
    startAsyncSearch: (searchId: string, timeRemaining: number) => {
      mapFlowLogger('debug', 'startAsyncSearch', { searchId, timeRemaining });
      
      set({
        asyncSearch: {
          searchId,
          status: 'searching',
          timeRemaining,
          error: null,
          startTime: new Date(),
        },
      });
    },
    
    updateAsyncSearchStatus: (status: AsyncSearchState['status'], data?: AsyncSearchUpdatePayload) => {
      mapFlowLogger('debug', 'updateAsyncSearchStatus', { status, data });
      
      set((state) => ({
        asyncSearch: {
          ...state.asyncSearch,
          status,
          matchedDriver: data?.matchedDriver ?? state.asyncSearch.matchedDriver,
          timeRemaining: data?.timeRemaining ?? state.asyncSearch.timeRemaining,
          error: data?.error ?? state.asyncSearch.error,
        },
      }));
    },
    
    cancelAsyncSearch: () => {
      mapFlowLogger('debug', 'cancelAsyncSearch');
      
      set((state) => ({
        asyncSearch: {
          ...state.asyncSearch,
          status: 'cancelled',
          timeRemaining: 0,
          error: null,
        },
      }));
    },
    
    confirmAsyncDriver: (driverId: number) => {
      mapFlowLogger('debug', 'confirmAsyncDriver', { driverId });
      
      set((state) => ({
        asyncSearch: {
          ...state.asyncSearch,
          status: 'idle',
          timeRemaining: 0,
          error: null,
        },
      }));
    },
    
    // Actions de timer
    startAsyncSearchTimer: () => {
      mapFlowLogger('debug', 'startAsyncSearchTimer');
      
      const state = get();
      if (state.asyncSearch.status !== 'searching' || !state.asyncSearch.startTime) {
        mapFlowLogger('warn', 'Cannot start timer - not searching or no start time');
        return;
      }
      
      const maxWaitTime = 300; // 5 minutos por defecto
      
      // Limpiar timer existente
      if (state.asyncSearchTimer) {
        clearInterval(state.asyncSearchTimer);
      }
      
      // Iniciar nuevo timer
      const timer = setInterval(() => {
        const currentState = get();
        if (currentState.asyncSearch.status !== 'searching') {
          clearInterval(timer);
          return;
        }
        
        const remaining = currentState.calculateTimeRemaining();
        
        // Actualizar tiempo restante
        set((state) => ({
          asyncSearch: {
            ...state.asyncSearch,
            timeRemaining: remaining,
          },
        }));
        
        // Verificar si se agotó el tiempo
        if (remaining === 0) {
          clearInterval(timer);
          
          // Actualizar estado a timeout
          set((state) => ({
            asyncSearch: {
              ...state.asyncSearch,
              status: 'timeout',
              error: 'Tiempo de búsqueda agotado',
            },
          }));
        }
      }, 1000); // Actualizar cada segundo
      
      // Guardar referencia del timer
      set({ asyncSearchTimer: timer });
    },
    
    stopAsyncSearchTimer: () => {
      mapFlowLogger('debug', 'stopAsyncSearchTimer');
      
      const state = get();
      if (state.asyncSearchTimer) {
        clearInterval(state.asyncSearchTimer);
        set({ asyncSearchTimer: null });
      }
    },
    
    calculateTimeRemaining: () => {
      const state = get();
      if (!state.asyncSearch.startTime || state.asyncSearch.status !== 'searching') {
        return 0;
      }
      
      const elapsed = Math.floor((Date.now() - state.asyncSearch.startTime.getTime()) / 1000);
      const maxWaitTime = 300; // Tiempo máximo de espera en segundos
      const remaining = Math.max(0, maxWaitTime - elapsed);
      
      return remaining;
    },
    
    // Selectors
    getAsyncSearchState: () => get().asyncSearch,
    
    isSearching: () => get().asyncSearch.status === 'searching',
    
    getTimeRemaining: () => get().asyncSearch.timeRemaining,
    
    hasSearchError: () => !!get().asyncSearch.error,
    
    getSearchError: () => get().asyncSearch.error,
    
    getMatchedDriver: () => get().asyncSearch.matchedDriver || null,
  }))
);

// Selectors optimizados para componentes
export const useAsyncSearchState = () => 
  useSearchSlice((state) => state.asyncSearch);

export const useIsSearching = () => 
  useSearchSlice((state) => state.asyncSearch.status === 'searching');

export const useSearchTimeRemaining = () => 
  useSearchSlice((state) => state.asyncSearch.timeRemaining);

export const useSearchError = () => 
  useSearchSlice((state) => state.asyncSearch.error);

export const useAsyncMatchedDriver = () => 
  useSearchSlice((state) => state.asyncSearch.matchedDriver);
