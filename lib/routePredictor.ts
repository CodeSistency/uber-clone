import AsyncStorage from "@react-native-async-storage/async-storage";
import { LatLng } from "react-native-maps";

export interface PredictionPoint {
  latitude: number;
  longitude: number;
  confidence: number; // 0.0 to 1.0
  timestamp: number;
  speed?: number;
  bearing?: number;
}

export interface RoutePrediction {
  points: PredictionPoint[];
  confidence: number; // Overall confidence
  distance: number; // Total distance in meters
  duration: number; // Estimated duration in seconds
  validUntil: number; // Timestamp when prediction expires
}

export interface PredictionConfig {
  maxPredictionDistance: number; // Max 500 meters
  predictionInterval: number; // Update every 2 seconds
  confidenceThreshold: number; // Min 0.7 confidence
  maxPredictionPoints: number; // Max 20 points
  speedDecayFactor: number; // How much speed decreases over time
  bearingDriftMax: number; // Max bearing drift in degrees
}

export interface CacheConfig {
  routeCacheTTL: number; // Route cache time-to-live (10 minutes)
  predictionCacheTTL: number; // Prediction cache TTL (30 seconds)
  maxCacheEntries: number; // Maximum cache entries
  enableCache: boolean; // Enable/disable caching
}

export interface CachedRoute {
  route: LatLng[];
  distance: number;
  duration: number;
  origin: LatLng;
  destination: LatLng;
  timestamp: number;
  expiresAt: number;
}

export interface CachedPrediction {
  prediction: RoutePrediction;
  inputPosition: LatLng;
  inputSpeed: number;
  inputBearing: number;
  timestamp: number;
  expiresAt: number;
}

const DEFAULT_CONFIG: PredictionConfig = {
  maxPredictionDistance: 500,
  predictionInterval: 2000,
  confidenceThreshold: 0.7,
  maxPredictionPoints: 20,
  speedDecayFactor: 0.95, // 5% speed decay per interval
  bearingDriftMax: 15, // Max 15 degrees drift
};

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  routeCacheTTL: 10 * 60 * 1000, // 10 minutes
  predictionCacheTTL: 30 * 1000, // 30 seconds
  maxCacheEntries: 50, // Max 50 entries per cache type
  enableCache: true,
};

class RoutePredictor {
  private config: PredictionConfig;
  private cacheConfig: CacheConfig;
  private routeCache: Map<string, CachedRoute> = new Map();
  private predictionCache: Map<string, CachedPrediction> = new Map();
  private lastKnownPosition: LatLng | null = null;
  private lastKnownSpeed = 0;
  private lastKnownBearing = 0;
  private lastUpdateTime = 0;
  private cacheInitialized = false;

  constructor(
    config: Partial<PredictionConfig> = {},
    cacheConfig: Partial<CacheConfig> = {},
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...cacheConfig };
    this.initializeCache();
  }

  /**
   * Update the predictor with current GPS data
   */
  updateCurrentState(position: LatLng, speed: number, bearing: number): void {
    this.lastKnownPosition = position;
    this.lastKnownSpeed = speed;
    this.lastKnownBearing = bearing;
    this.lastUpdateTime = Date.now();

    console.log("[RoutePredictor] State updated:", {
      position: `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`,
      speed: `${speed.toFixed(1)} km/h`,
      bearing: `${bearing.toFixed(1)}°`,
    });
  }

  /**
   * Generate route prediction based on current movement
   */
  generatePrediction(): RoutePrediction | null {
    if (!this.lastKnownPosition || this.lastKnownSpeed < 1) {
      console.log("[RoutePredictor] Cannot predict: no position or speed data");
      return null;
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdateTime;

    // Don't predict if data is too old (> 10 seconds)
    if (timeSinceLastUpdate > 10000) {
      console.log("[RoutePredictor] Data too old, skipping prediction");
      return null;
    }

    // Check cache first
    const cachedPrediction = this.getCachedPrediction(
      this.lastKnownPosition,
      this.lastKnownSpeed,
      this.lastKnownBearing,
    );
    if (cachedPrediction) {
      return cachedPrediction;
    }

    const prediction: PredictionPoint[] = [];
    let currentPosition = { ...this.lastKnownPosition };
    let currentSpeed = this.lastKnownSpeed;
    let currentBearing = this.lastKnownBearing;
    let totalDistance = 0;
    let totalTime = 0;

    // Generate prediction points
    for (let i = 0; i < this.config.maxPredictionPoints; i++) {
      const timeStep = this.config.predictionInterval / 1000; // Convert to seconds
      const distanceStep = ((currentSpeed * 1000) / 3600) * timeStep; // Distance in meters

      // Don't exceed max prediction distance
      if (totalDistance + distanceStep > this.config.maxPredictionDistance) {
        break;
      }

      // Calculate bearing drift (slight random variation)
      const bearingDrift =
        (Math.random() - 0.5) * this.config.bearingDriftMax * 2;
      const actualBearing = currentBearing + bearingDrift;

      // Calculate new position using bearing and distance
      const bearingRad = (actualBearing * Math.PI) / 180;
      const R = 6371000; // Earth's radius in meters

      const lat1Rad = (currentPosition.latitude * Math.PI) / 180;
      const lng1Rad = (currentPosition.longitude * Math.PI) / 180;

      const lat2Rad = Math.asin(
        Math.sin(lat1Rad) * Math.cos(distanceStep / R) +
          Math.cos(lat1Rad) * Math.sin(distanceStep / R) * Math.cos(bearingRad),
      );

      const lng2Rad =
        lng1Rad +
        Math.atan2(
          Math.sin(bearingRad) * Math.sin(distanceStep / R) * Math.cos(lat1Rad),
          Math.cos(distanceStep / R) - Math.sin(lat1Rad) * Math.sin(lat2Rad),
        );

      const newPosition: LatLng = {
        latitude: (lat2Rad * 180) / Math.PI,
        longitude: (lng2Rad * 180) / Math.PI,
      };

      // Advanced confidence calculation system
      const confidence = this.calculatePointConfidence({
        pointIndex: i,
        speed: currentSpeed,
        bearingDrift: bearingDrift,
        timeSinceLastUpdate: timeSinceLastUpdate,
        distanceFromOrigin: totalDistance,
        gpsAccuracy: 5, // Assume 5m accuracy for now
      });

      const pointConfidence = confidence.overall;

      // Only add point if confidence is above threshold
      if (pointConfidence >= this.config.confidenceThreshold) {
        const predictionPoint: PredictionPoint = {
          latitude: newPosition.latitude,
          longitude: newPosition.longitude,
          confidence: pointConfidence,
          timestamp: now + (i + 1) * this.config.predictionInterval,
          speed: currentSpeed,
          bearing: actualBearing,
        };

        prediction.push(predictionPoint);
        totalDistance += distanceStep;
        totalTime += timeStep;
      }

      // Update for next iteration
      currentPosition = newPosition;
      currentSpeed *= this.config.speedDecayFactor; // Speed decay
      currentBearing = actualBearing; // Keep the drifted bearing
    }

    if (prediction.length === 0) {
      console.log("[RoutePredictor] No valid prediction points generated");
      return null;
    }

    const overallConfidence =
      prediction.reduce((sum, point) => sum + point.confidence, 0) /
      prediction.length;

    const routePrediction: RoutePrediction = {
      points: prediction,
      confidence: overallConfidence,
      distance: totalDistance,
      duration: totalTime,
      validUntil: now + this.config.predictionInterval * 2, // Valid for 2 intervals
    };

    console.log("[RoutePredictor] Prediction generated:", {
      points: prediction.length,
      confidence: overallConfidence.toFixed(2),
      distance: `${totalDistance.toFixed(0)}m`,
      duration: `${totalTime.toFixed(1)}s`,
    });

    // Cache the prediction for future use
    this.cachePrediction(
      routePrediction,
      this.lastKnownPosition,
      this.lastKnownSpeed,
      this.lastKnownBearing,
    );

    return routePrediction;
  }

  /**
   * Check if a prediction is still valid
   */
  isPredictionValid(prediction: RoutePrediction): boolean {
    const now = Date.now();
    return (
      now < prediction.validUntil &&
      prediction.confidence >= this.config.confidenceThreshold
    );
  }

  /**
   * Get current prediction configuration
   */
  getConfig(): PredictionConfig {
    return { ...this.config };
  }

  /**
   * Update prediction configuration
   */
  updateConfig(newConfig: Partial<PredictionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("[RoutePredictor] Configuration updated:", this.config);
  }

  /**
   * Advanced confidence calculation for prediction points
   */
  private calculatePointConfidence(params: {
    pointIndex: number;
    speed: number;
    bearingDrift: number;
    timeSinceLastUpdate: number;
    distanceFromOrigin: number;
    gpsAccuracy: number;
  }): {
    overall: number;
    factors: {
      temporal: number;
      speed: number;
      stability: number;
      accuracy: number;
      distance: number;
    };
  } {
    const {
      pointIndex,
      speed,
      bearingDrift,
      timeSinceLastUpdate,
      distanceFromOrigin,
      gpsAccuracy,
    } = params;

    // 1. Temporal confidence: decreases with prediction distance in time
    const temporal = Math.max(0, 1 - pointIndex * 0.08); // 8% decrease per point

    // 2. Speed confidence: higher speeds give more predictable movement
    const speedConfidence = Math.min(1, speed / 30); // Max confidence at 30 km/h

    // 3. Stability confidence: less bearing drift = more confidence
    const maxDrift = this.config.bearingDriftMax;
    const stability = Math.max(0.3, 1 - Math.abs(bearingDrift) / maxDrift);

    // 4. GPS accuracy confidence: better accuracy = higher confidence
    const accuracy = Math.max(0.5, 1 - gpsAccuracy / 20); // Max confidence at 20m accuracy

    // 5. Distance confidence: shorter predictions are more accurate
    const distance = Math.max(
      0.6,
      1 - distanceFromOrigin / this.config.maxPredictionDistance,
    );

    // 6. Data freshness confidence: newer data = higher confidence
    const freshness = Math.max(0.7, 1 - timeSinceLastUpdate / 5000); // Max confidence for data < 5s old

    // Weighted overall confidence calculation
    const weights = {
      temporal: 0.15,
      speed: 0.2,
      stability: 0.25,
      accuracy: 0.2,
      distance: 0.15,
      freshness: 0.05,
    };

    const overall = Math.min(
      1,
      Math.max(
        0,
        temporal * weights.temporal +
          speedConfidence * weights.speed +
          stability * weights.stability +
          accuracy * weights.accuracy +
          distance * weights.distance +
          freshness * weights.freshness,
      ),
    );

    return {
      overall,
      factors: {
        temporal,
        speed: speedConfidence,
        stability,
        accuracy,
        distance,
      },
    };
  }

  /**
   * Initialize cache from AsyncStorage
   */
  private async initializeCache(): Promise<void> {
    if (!this.cacheConfig.enableCache || this.cacheInitialized) return;

    try {
      console.log("[RoutePredictor] Initializing cache from storage");

      // Load route cache
      const routeCacheData = await AsyncStorage.getItem(
        "routePredictor_routeCache",
      );
      if (routeCacheData) {
        const parsedCache = JSON.parse(routeCacheData) as Record<
          string,
          CachedRoute
        >;
        this.routeCache = new Map(Object.entries(parsedCache));

        // Remove expired entries
        const now = Date.now();
        for (const [key, entry] of this.routeCache.entries()) {
          if (entry.expiresAt < now) {
            this.routeCache.delete(key);
          }
        }
        console.log(
          `[RoutePredictor] Loaded ${this.routeCache.size} route cache entries`,
        );
      }

      // Load prediction cache
      const predictionCacheData = await AsyncStorage.getItem(
        "routePredictor_predictionCache",
      );
      if (predictionCacheData) {
        const parsedCache = JSON.parse(predictionCacheData) as Record<
          string,
          CachedPrediction
        >;
        this.predictionCache = new Map(Object.entries(parsedCache));

        // Remove expired entries
        const now = Date.now();
        for (const [key, entry] of this.predictionCache.entries()) {
          if (entry.expiresAt < now) {
            this.predictionCache.delete(key);
          }
        }
        console.log(
          `[RoutePredictor] Loaded ${this.predictionCache.size} prediction cache entries`,
        );
      }

      this.cacheInitialized = true;
    } catch (error) {
      console.error("[RoutePredictor] Error initializing cache:", error);
    }
  }

  /**
   * Save cache to AsyncStorage
   */
  private async saveCacheToStorage(): Promise<void> {
    if (!this.cacheConfig.enableCache) return;

    try {
      // Save route cache
      const routeCacheObject = Object.fromEntries(this.routeCache);
      await AsyncStorage.setItem(
        "routePredictor_routeCache",
        JSON.stringify(routeCacheObject),
      );

      // Save prediction cache
      const predictionCacheObject = Object.fromEntries(this.predictionCache);
      await AsyncStorage.setItem(
        "routePredictor_predictionCache",
        JSON.stringify(predictionCacheObject),
      );

      console.log("[RoutePredictor] Cache saved to storage");
    } catch (error) {
      console.error("[RoutePredictor] Error saving cache:", error);
    }
  }

  /**
   * Get cached route if available and valid
   */
  getCachedRoute(origin: LatLng, destination: LatLng): CachedRoute | null {
    if (!this.cacheConfig.enableCache) return null;

    const cacheKey = this.generateRouteCacheKey(origin, destination);
    const cached = this.routeCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      console.log("[RoutePredictor] Route cache hit:", cacheKey);
      return cached;
    }

    // Remove expired entry
    if (cached) {
      this.routeCache.delete(cacheKey);
    }

    return null;
  }

  /**
   * Cache a route
   */
  cacheRoute(
    route: LatLng[],
    distance: number,
    duration: number,
    origin: LatLng,
    destination: LatLng,
  ): void {
    if (!this.cacheConfig.enableCache) return;

    const cacheKey = this.generateRouteCacheKey(origin, destination);
    const cachedRoute: CachedRoute = {
      route,
      distance,
      duration,
      origin,
      destination,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.cacheConfig.routeCacheTTL,
    };

    this.routeCache.set(cacheKey, cachedRoute);

    // Maintain cache size limit
    if (this.routeCache.size > this.cacheConfig.maxCacheEntries) {
      const oldestKey = this.routeCache.keys().next().value;
      if (oldestKey) {
        this.routeCache.delete(oldestKey);
      }
    }

    // Save to storage asynchronously
    this.saveCacheToStorage();

    console.log(`[RoutePredictor] Route cached: ${cacheKey}`);
  }

  /**
   * Get cached prediction if available and valid
   */
  getCachedPrediction(
    position: LatLng,
    speed: number,
    bearing: number,
  ): RoutePrediction | null {
    if (!this.cacheConfig.enableCache) return null;

    const cacheKey = this.generatePredictionCacheKey(position, speed, bearing);
    const cached = this.predictionCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      // Check if prediction is still valid
      if (this.isPredictionValid(cached.prediction)) {
        console.log("[RoutePredictor] Prediction cache hit:", cacheKey);
        return cached.prediction;
      }
    }

    // Remove expired or invalid entry
    if (cached) {
      this.predictionCache.delete(cacheKey);
    }

    return null;
  }

  /**
   * Cache a prediction
   */
  cachePrediction(
    prediction: RoutePrediction,
    position: LatLng,
    speed: number,
    bearing: number,
  ): void {
    if (!this.cacheConfig.enableCache) return;

    const cacheKey = this.generatePredictionCacheKey(position, speed, bearing);
    const cachedPrediction: CachedPrediction = {
      prediction,
      inputPosition: position,
      inputSpeed: speed,
      inputBearing: bearing,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.cacheConfig.predictionCacheTTL,
    };

    this.predictionCache.set(cacheKey, cachedPrediction);

    // Maintain cache size limit
    if (this.predictionCache.size > this.cacheConfig.maxCacheEntries) {
      const oldestKey = this.predictionCache.keys().next().value;
      if (oldestKey) {
        this.predictionCache.delete(oldestKey);
      }
    }

    // Save to storage asynchronously
    this.saveCacheToStorage();

    console.log(`[RoutePredictor] Prediction cached: ${cacheKey}`);
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    this.routeCache.clear();
    this.predictionCache.clear();

    try {
      await AsyncStorage.removeItem("routePredictor_routeCache");
      await AsyncStorage.removeItem("routePredictor_predictionCache");
      console.log("[RoutePredictor] Cache cleared");
    } catch (error) {
      console.error("[RoutePredictor] Error clearing cache:", error);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    routeCache: { size: number; maxSize: number };
    predictionCache: { size: number; maxSize: number };
    enabled: boolean;
  } {
    return {
      routeCache: {
        size: this.routeCache.size,
        maxSize: this.cacheConfig.maxCacheEntries,
      },
      predictionCache: {
        size: this.predictionCache.size,
        maxSize: this.cacheConfig.maxCacheEntries,
      },
      enabled: this.cacheConfig.enableCache,
    };
  }

  /**
   * Generate cache key for routes
   */
  private generateRouteCacheKey(origin: LatLng, destination: LatLng): string {
    const precision = 100000; // 5 decimal places precision
    const oLat = Math.round(origin.latitude * precision);
    const oLng = Math.round(origin.longitude * precision);
    const dLat = Math.round(destination.latitude * precision);
    const dLng = Math.round(destination.longitude * precision);
    return `route_${oLat}_${oLng}_${dLat}_${dLng}`;
  }

  /**
   * Generate cache key for predictions
   */
  private generatePredictionCacheKey(
    position: LatLng,
    speed: number,
    bearing: number,
  ): string {
    const precision = 100000; // 5 decimal places precision
    const lat = Math.round(position.latitude * precision);
    const lng = Math.round(position.longitude * precision);
    const spd = Math.round(speed);
    const brg = Math.round(bearing);
    return `pred_${lat}_${lng}_${spd}_${brg}`;
  }

  /**
   * Reset predictor state
   */
  reset(): void {
    this.lastKnownPosition = null;
    this.lastKnownSpeed = 0;
    this.lastKnownBearing = 0;
    this.lastUpdateTime = 0;
    console.log("[RoutePredictor] State reset");
  }
}

// Singleton instance
let predictorInstance: RoutePredictor | null = null;

export const getRoutePredictor = (
  config?: Partial<PredictionConfig>,
  cacheConfig?: Partial<CacheConfig>,
): RoutePredictor => {
  if (!predictorInstance) {
    predictorInstance = new RoutePredictor(config, cacheConfig);
  } else {
    if (config) {
      predictorInstance.updateConfig(config);
    }
    if (cacheConfig) {
      // Update cache config - would need to add updateCacheConfig method
      // For now, recreate instance if cache config changes
      predictorInstance = new RoutePredictor(config, cacheConfig);
    }
  }
  return predictorInstance;
};

export default RoutePredictor;
