import { PendingRequest } from "@/app/services/driverTransportService";

/**
 * Estructura de entrada del cache
 */
interface CachedEntry {
  data: PendingRequest[];
  timestamp: number;
  location: { lat: number; lng: number };
  expiresAt: number;
}

/**
 * Cache inteligente para solicitudes de viaje pendientes
 * Implementa TTL, invalidación por ubicación y optimizaciones de performance
 */
export class PendingRequestsCache {
  private static instance: PendingRequestsCache;
  private cache: Map<string, CachedEntry> = new Map();
  private readonly TTL_MS = 30000; // 30 segundos
  private readonly DISTANCE_THRESHOLD_METERS = 100; // 100 metros para invalidar
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanupInterval();
  }

  static getInstance(): PendingRequestsCache {
    if (!PendingRequestsCache.instance) {
      PendingRequestsCache.instance = new PendingRequestsCache();
    }
    return PendingRequestsCache.instance;
  }

  /**
   * Genera una clave única para la ubicación
   */
  private generateCacheKey(lat: number, lng: number): string {
    // Redondear a 4 decimales para agrupar ubicaciones cercanas
    return `${lat.toFixed(4)}_${lng.toFixed(4)}`;
  }

  /**
   * Obtiene datos del cache o null si no existe o expiró
   */
  get(lat: number, lng: number): PendingRequest[] | null {
    const key = this.generateCacheKey(lat, lng);
    const entry = this.cache.get(key);

    if (!entry) {
      
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      
      this.cache.delete(key);
      return null;
    }

    // Verificar si la ubicación actual está dentro del threshold
    const distance = this.calculateDistance(
      lat,
      lng,
      entry.location.lat,
      entry.location.lng,
    );
    if (distance > this.DISTANCE_THRESHOLD_METERS) {
      
      this.cache.delete(key);
      return null;
    }

    

    return entry.data;
  }

  /**
   * Almacena datos en el cache
   */
  set(lat: number, lng: number, data: PendingRequest[]): void {
    const key = this.generateCacheKey(lat, lng);
    const now = Date.now();

    const entry: CachedEntry = {
      data: [...data], // Crear copia para evitar mutaciones
      timestamp: now,
      location: { lat, lng },
      expiresAt: now + this.TTL_MS,
    };

    this.cache.set(key, entry);

    
  }

  /**
   * Invalida cache para una ubicación específica o todas las entradas
   */
  invalidate(lat?: number, lng?: number): void {
    if (lat !== undefined && lng !== undefined) {
      const key = this.generateCacheKey(lat, lng);
      const deleted = this.cache.delete(key);
      
    } else {
      const size = this.cache.size;
      this.cache.clear();
      
    }
  }

  /**
   * Invalida entradas expiradas
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      
    }
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats(): {
    size: number;
    totalEntries: number;
    hitRate?: number;
    avgAge: number;
  } {
    const now = Date.now();
    let totalAge = 0;
    let validEntries = 0;

    for (const entry of this.cache.values()) {
      if (now <= entry.expiresAt) {
        totalAge += now - entry.timestamp;
        validEntries++;
      }
    }

    return {
      size: this.cache.size,
      totalEntries: validEntries,
      avgAge: validEntries > 0 ? totalAge / validEntries : 0,
    };
  }

  /**
   * Calcula distancia entre dos puntos usando fórmula de Haversine
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  }

  /**
   * Inicia el intervalo de limpieza automática
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) return;

    // Limpiar cada 10 segundos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10000);
  }

  /**
   * Detiene el intervalo de limpieza
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Método para debugging - obtener todas las entradas del cache
   */
  debug_getAllEntries(): Array<{ key: string; entry: CachedEntry }> {
    const entries: Array<{ key: string; entry: CachedEntry }> = [];
    for (const [key, entry] of this.cache.entries()) {
      entries.push({ key, entry });
    }
    return entries;
  }
}

// Exportar instancia singleton
export const pendingRequestsCache = PendingRequestsCache.getInstance();
