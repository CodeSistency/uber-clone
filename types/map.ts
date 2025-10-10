import { LatLng, Region } from 'react-native-maps';

// Coordenadas geográficas
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Región del mapa con deltas
export interface MapRegion extends Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Marcador en el mapa
export interface MapMarker extends Coordinates {
  id: string | number;
  title: string;
  description?: string;
  type: 'driver' | 'user' | 'destination' | 'restaurant' | 'custom';
}

// Marcador de conductor con información extendida
export interface DriverMarker extends MapMarker {
  type: 'driver';
  driverId: number;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  carImageUrl: string;
  carSeats: number;
  rating: number;
  estimatedTime?: number; // minutos
  estimatedPrice?: string;
}

// Ruta calculada
export interface CalculatedRoute {
  polyline: LatLng[];
  distance: number; // metros
  duration: number; // segundos
  distanceText: string; // "5.2 km"
  durationText: string; // "15 min"
  bounds: {
    northeast: Coordinates;
    southwest: Coordinates;
  };
}

// Opciones de cálculo de ruta
export interface RouteOptions {
  origin: Coordinates;
  destination: Coordinates;
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
  alternatives?: boolean;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
}

// Resultado de API de Google
export interface GoogleDirectionsResponse {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      start_location: { lat: number; lng: number };
      end_location: { lat: number; lng: number };
      steps: Array<{
        html_instructions: string;
        distance: { text: string; value: number };
        duration: { text: string; value: number };
      }>;
    }>;
    overview_polyline: { points: string };
    bounds: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  }>;
  status: string;
}

// Result types para manejo de errores
export type RouteCalculationResult = 
  | { success: true; data: CalculatedRoute }
  | { success: false; error: string; code: RouteErrorCode };

export enum RouteErrorCode {
  INVALID_COORDINATES = 'INVALID_COORDINATES',
  API_ERROR = 'API_ERROR',
  NO_ROUTES_FOUND = 'NO_ROUTES_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

// ===== CLUSTERING TYPES =====

// Cluster de marcadores
export interface MarkerCluster {
  id: string;
  coordinate: Coordinates;
  pointCount: number;
  markers: DriverMarker[];
}

// Opciones de clustering
export interface ClusteringOptions {
  enabled: boolean;
  radius: number; // pixels
  maxZoom: number;
  minZoom: number;
  extent: number;
  nodeSize: number;
}

// ===== ALTERNATIVE ROUTES TYPES =====

// Ruta con metadatos adicionales
export interface AlternativeRoute extends CalculatedRoute {
  routeIndex: number;
  isFastest: boolean;
  isShortest: boolean;
  trafficLevel: 'low' | 'medium' | 'high';
  tollsCount: number;
}

// Resultado con múltiples rutas
export type AlternativeRoutesResult = 
  | { success: true; data: AlternativeRoute[] }
  | { success: false; error: string; code: RouteErrorCode };

// ===== OFFLINE MAPS TYPES =====

// Tile del mapa
export interface MapTile {
  x: number;
  y: number;
  z: number; // zoom level
  url: string;
  localPath?: string;
  cachedAt?: Date;
  size?: number;
}

// Región para descargar
export interface DownloadableRegion {
  id: string;
  name: string;
  bounds: {
    northEast: Coordinates;
    southWest: Coordinates;
  };
  minZoom: number;
  maxZoom: number;
  tileCount: number;
  downloadedTiles: number;
  isComplete: boolean;
}

// Opciones de caché
export interface CacheOptions {
  maxCacheSize: number; // MB
  maxAge: number; // days
  compressionEnabled: boolean;
}

// ===== ANIMATION TYPES =====

export type AnimationType = 
  | 'zoom'
  | 'pan'
  | 'fit'
  | 'follow'
  | 'bounce'
  | 'pulse';

export interface AnimationOptions {
  duration: number;
  easing: keyof typeof import('react-native').Easing;
  delay?: number;
}

// ===== LOCATION DATA TYPES =====

// Datos de ubicación con timestamp
export interface LocationData extends Coordinates {
  accuracy?: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

// ===== ROUTE SEGMENT TYPES =====

// Segmento de ruta
export interface RouteSegment {
  start: Coordinates;
  end: Coordinates;
  distance: number;
  duration: number;
  instructions: string;
}

// Paso de navegación
export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver?: string;
}

// ===== ERROR TYPES =====

// Error del mapa
export interface MapError {
  code: string;
  message: string;
  details?: any;
}

// Resultado genérico
export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: MapError };
