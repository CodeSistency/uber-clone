// Hook personalizado para caché inteligente de búsquedas de conductores
import { useCallback, useRef } from 'react';

// Tipos para el caché
interface CachedSearch {
  searchId: string;
  searchParams: {
    lat: number;
    lng: number;
    tierId: number;
    vehicleTypeId: number;
    radiusKm: number;
  };
  timestamp: number;
  ttl: number; // Time to live en milisegundos
}

interface SearchCacheConfig {
  maxEntries: number;
  defaultTTL: number; // 5 minutos por defecto
  cleanupInterval: number; // Limpiar cada 10 minutos
}

// Configuración del caché
const CACHE_CONFIG: SearchCacheConfig = {
  maxEntries: 10,
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  cleanupInterval: 10 * 60 * 1000, // 10 minutos
};

export const useSearchCache = () => {
  // Referencia al caché (persiste entre renders)
  const cacheRef = useRef<Map<string, CachedSearch>>(new Map());
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Función para generar clave de caché
  const generateCacheKey = useCallback((params: CachedSearch['searchParams']): string => {
    return `${params.lat.toFixed(4)},${params.lng.toFixed(4)},${params.tierId},${params.vehicleTypeId},${params.radiusKm}`;
  }, []);

  // Función para limpiar entradas expiradas
  const cleanupExpiredEntries = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(cacheRef.current.entries());

    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > entry.ttl) {
        cacheRef.current.delete(key);
        console.debug('[SearchCache] Cleaned up expired entry:', key);
      }
    });
  }, []);

  // Iniciar limpieza automática
  const startAutoCleanup = useCallback(() => {
    if (cleanupTimerRef.current) return;

    cleanupTimerRef.current = setInterval(() => {
      cleanupExpiredEntries();
    }, CACHE_CONFIG.cleanupInterval);
  }, [cleanupExpiredEntries]);

  // Detener limpieza automática
  const stopAutoCleanup = useCallback(() => {
    if (cleanupTimerRef.current) {
      clearInterval(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }
  }, []);

  // Verificar si hay una búsqueda reciente en caché
  const getCachedSearch = useCallback((params: CachedSearch['searchParams']): CachedSearch | null => {
    const key = generateCacheKey(params);
    const cached = cacheRef.current.get(key);

    if (!cached) return null;

    // Verificar si no ha expirado
    if (Date.now() - cached.timestamp > cached.ttl) {
      cacheRef.current.delete(key);
      return null;
    }

    console.debug('[SearchCache] Found cached search:', cached.searchId);
    return cached;
  }, [generateCacheKey]);

  // Almacenar búsqueda en caché
  const cacheSearch = useCallback((searchId: string, params: CachedSearch['searchParams'], ttl?: number): void => {
    const key = generateCacheKey(params);
    const entry: CachedSearch = {
      searchId,
      searchParams: { ...params },
      timestamp: Date.now(),
      ttl: ttl || CACHE_CONFIG.defaultTTL,
    };

    // Si ya tenemos el máximo de entradas, eliminar la más antigua
    if (cacheRef.current.size >= CACHE_CONFIG.maxEntries) {
      const firstKey = cacheRef.current.keys().next().value;
      if (firstKey) {
        cacheRef.current.delete(firstKey);
        console.debug('[SearchCache] Removed oldest entry due to size limit');
      }
    }

    cacheRef.current.set(key, entry);
    console.debug('[SearchCache] Cached search:', searchId, 'Key:', key);

    // Iniciar limpieza automática si no está activa
    startAutoCleanup();
  }, [generateCacheKey, startAutoCleanup]);

  // Invalidar búsqueda en caché (cuando se completa o falla)
  const invalidateSearch = useCallback((searchId: string): void => {
    const entries = Array.from(cacheRef.current.entries());

    entries.forEach(([key, entry]) => {
      if (entry.searchId === searchId) {
        cacheRef.current.delete(key);
        console.debug('[SearchCache] Invalidated search:', searchId);
        return;
      }
    });
  }, []);

  // Obtener estadísticas del caché
  const getCacheStats = useCallback(() => {
    const entries = Array.from(cacheRef.current.values());
    const now = Date.now();

    return {
      totalEntries: cacheRef.current.size,
      maxEntries: CACHE_CONFIG.maxEntries,
      activeEntries: entries.filter(entry => now - entry.timestamp <= entry.ttl).length,
      expiredEntries: entries.filter(entry => now - entry.timestamp > entry.ttl).length,
      averageAge: entries.length > 0
        ? entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / entries.length / 1000
        : 0,
    };
  }, []);

  // Limpiar todo el caché
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    stopAutoCleanup();
    console.debug('[SearchCache] Cache cleared');
  }, [stopAutoCleanup]);

  // Optimizar polling basado en caché
  const getOptimalPollingInterval = useCallback((params: CachedSearch['searchParams']): number => {
    const cached = getCachedSearch(params);

    if (cached) {
      // Si hay caché reciente, hacer polling más frecuente inicialmente
      const age = Date.now() - cached.timestamp;
      const ageMinutes = age / (60 * 1000);

      if (ageMinutes < 1) return 2000; // 2 segundos
      if (ageMinutes < 2) return 3000; // 3 segundos
      if (ageMinutes < 5) return 5000; // 5 segundos
    }

    // Intervalo normal para búsquedas nuevas
    return 10000; // 10 segundos
  }, [getCachedSearch]);

  return {
    getCachedSearch,
    cacheSearch,
    invalidateSearch,
    getCacheStats,
    clearCache,
    getOptimalPollingInterval,
    cleanupExpiredEntries,
  };
};
