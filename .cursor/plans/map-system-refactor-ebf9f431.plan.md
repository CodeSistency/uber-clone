<!-- ebf9f431-725a-4b31-972d-20cb75f8c02a 43193661-1bd9-4de0-95d3-559349631831 -->
# Plan de Implementación: Funcionalidades Avanzadas de Mapas

## Contexto

La refactorización del sistema de mapas está completa con una arquitectura modular, type-safe y optimizada. Ahora se implementarán 4 funcionalidades avanzadas:

1. **Clustering de marcadores** - Para manejar eficientemente muchos conductores
2. **Rutas alternativas** - Múltiples opciones de ruta con selección
3. **Offline maps** - Caché de tiles para funcionamiento sin conexión
4. **Animaciones suaves** - Transiciones fluidas y profesionales

## Análisis de la Arquitectura Actual

### Estado Actual

- **Marcadores**: Renderizado directo sin clustering (MapMarkers.tsx)
- **Rutas**: Una sola ruta por viaje (RouteCalculator)
- **Caché**: Solo para rutas calculadas, no tiles del mapa
- **Animaciones**: Básicas con animateToRegion

### Dependencias

- `react-native-maps: 1.20.1` - Soporta clustering básico
- Sistema modular en `lib/map/` listo para extensión
- Hooks especializados (`useMapRoutes`, `useMapMarkers`)

---

## Feature 1: Clustering de Marcadores

### Objetivo

Agrupar marcadores cercanos cuando hay muchos conductores, mejorando performance y UX.

### Implementación

#### 1.1 Instalar react-native-map-clustering

```bash
npm install react-native-map-clustering
```

#### 1.2 Crear tipos para clusters

**Archivo:** `types/map.ts` (agregar)

```typescript
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
```

#### 1.3 Crear ClusterManager

**Archivo:** `lib/map/clusterManager.ts`

```typescript
import Supercluster from 'supercluster';
import type { DriverMarker, MarkerCluster, Coordinates, ClusteringOptions } from '@/types/map';

class ClusterManager {
  private supercluster: Supercluster;
  private options: ClusteringOptions;

  constructor(options?: Partial<ClusteringOptions>) {
    this.options = {
      enabled: true,
      radius: 60,
      maxZoom: 20,
      minZoom: 0,
      extent: 512,
      nodeSize: 64,
      ...options,
    };

    this.supercluster = new Supercluster({
      radius: this.options.radius,
      maxZoom: this.options.maxZoom,
      minZoom: this.options.minZoom,
      extent: this.options.extent,
      nodeSize: this.options.nodeSize,
    });
  }

  /**
   * Carga marcadores en el cluster manager
   */
  load(markers: DriverMarker[]): void {
    const points = markers.map(marker => ({
      type: 'Feature' as const,
      properties: { marker },
      geometry: {
        type: 'Point' as const,
        coordinates: [marker.longitude, marker.latitude],
      },
    }));

    this.supercluster.load(points);
  }

  /**
   * Obtiene clusters visibles en la región actual
   */
  getClusters(bounds: {
    northEast: Coordinates;
    southWest: Coordinates;
  }, zoom: number): (DriverMarker | MarkerCluster)[] {
    if (!this.options.enabled) {
      return this.getAllMarkers();
    }

    const clusters = this.supercluster.getClusters(
      [bounds.southWest.longitude, bounds.southWest.latitude,
       bounds.northEast.longitude, bounds.northEast.latitude],
      Math.floor(zoom)
    );

    return clusters.map(cluster => {
      if (cluster.properties.cluster) {
        return {
          id: `cluster-${cluster.id}`,
          coordinate: {
            latitude: cluster.geometry.coordinates[1],
            longitude: cluster.geometry.coordinates[0],
          },
          pointCount: cluster.properties.point_count,
          markers: this.getClusterChildren(cluster.id as number),
        } as MarkerCluster;
      } else {
        return cluster.properties.marker as DriverMarker;
      }
    });
  }

  /**
   * Obtiene todos los marcadores de un cluster
   */
  private getClusterChildren(clusterId: number): DriverMarker[] {
    const leaves = this.supercluster.getLeaves(clusterId, Infinity);
    return leaves.map(leaf => leaf.properties.marker);
  }

  /**
   * Obtiene todos los marcadores sin clustering
   */
  private getAllMarkers(): DriverMarker[] {
    const points = this.supercluster.getLeaves(0, Infinity);
    return points.map(point => point.properties.marker);
  }

  /**
   * Calcula el zoom óptimo para expandir un cluster
   */
  getClusterExpansionZoom(clusterId: number): number {
    return this.supercluster.getClusterExpansionZoom(clusterId);
  }
}

export const clusterManager = new ClusterManager();
export { ClusterManager };
```

#### 1.4 Crear hook useMapClustering

**Archivo:** `hooks/useMapClustering.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Region } from 'react-native-maps';
import { clusterManager } from '@/lib/map/clusterManager';
import type { DriverMarker, MarkerCluster, Coordinates } from '@/types/map';

export const useMapClustering = (
  markers: DriverMarker[],
  enabled: boolean = true
) => {
  const [clusters, setClusters] = useState<(DriverMarker | MarkerCluster)[]>([]);

  // Cargar marcadores en el cluster manager
  useEffect(() => {
    if (markers.length > 0) {
      clusterManager.load(markers);
    }
  }, [markers]);

  /**
   * Actualiza clusters basado en la región visible
   */
  const updateClusters = useCallback((region: Region, zoom: number) => {
    const bounds = {
      northEast: {
        latitude: region.latitude + region.latitudeDelta / 2,
        longitude: region.longitude + region.longitudeDelta / 2,
      },
      southWest: {
        latitude: region.latitude - region.latitudeDelta / 2,
        longitude: region.longitude - region.longitudeDelta / 2,
      },
    };

    const newClusters = clusterManager.getClusters(bounds, zoom);
    setClusters(newClusters);
  }, []);

  /**
   * Expande un cluster
   */
  const expandCluster = useCallback((clusterId: number): number => {
    return clusterManager.getClusterExpansionZoom(clusterId);
  }, []);

  return {
    clusters,
    updateClusters,
    expandCluster,
  };
};
```

#### 1.5 Actualizar MapMarkers para soportar clustering

**Archivo:** `components/Map/ClusteredMarkers.tsx`

```typescript
import React, { memo } from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, TouchableOpacity } from 'react-native';
import { icons } from '@/constants';
import type { DriverMarker, MarkerCluster, Coordinates } from '@/types/map';

interface ClusteredMarkersProps {
  clusters: (DriverMarker | MarkerCluster)[];
  selectedDriver: number | null;
  onMarkerPress: (marker: DriverMarker) => void;
  onClusterPress: (cluster: MarkerCluster) => void;
}

const isCluster = (item: any): item is MarkerCluster => {
  return 'pointCount' in item;
};

const ClusteredMarkers: React.FC<ClusteredMarkersProps> = memo(({
  clusters,
  selectedDriver,
  onMarkerPress,
  onClusterPress,
}) => {
  return (
    <>
      {clusters.map(item => {
        if (isCluster(item)) {
          // Render cluster
          return (
            <Marker
              key={item.id}
              coordinate={item.coordinate}
              onPress={() => onClusterPress(item)}
            >
              <View className="bg-primary rounded-full items-center justify-center"
                    style={{ width: 50, height: 50 }}>
                <Text className="text-white font-JakartaBold text-lg">
                  {item.pointCount}
                </Text>
              </View>
              <Callout>
                <Text className="font-JakartaBold">
                  {item.pointCount} conductores
                </Text>
              </Callout>
            </Marker>
          );
        } else {
          // Render individual marker
          const marker = item as DriverMarker;
          return (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={marker.title}
              description={marker.description}
              image={selectedDriver === marker.driverId ? icons.selectedMarker : icons.marker}
              onPress={() => onMarkerPress(marker)}
            />
          );
        }
      })}
    </>
  );
});

ClusteredMarkers.displayName = 'ClusteredMarkers';

export default ClusteredMarkers;
```

---

## Feature 2: Rutas Alternativas

### Objetivo

Mostrar múltiples opciones de ruta y permitir al usuario seleccionar su preferida.

### Implementación

#### 2.1 Actualizar tipos para rutas alternativas

**Archivo:** `types/map.ts` (agregar)

```typescript
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
```

#### 2.2 Extender RouteCalculator

**Archivo:** `lib/map/routeCalculator.ts` (agregar método)

```typescript
/**
 * Calcula rutas alternativas entre dos puntos
 */
async calculateAlternativeRoutes(
  options: RouteOptions & { maxAlternatives?: number }
): Promise<AlternativeRoutesResult> {
  try {
    const { origin, destination, mode = 'driving', maxAlternatives = 3 } = options;

    const response = await fetch(
      endpoints.googleMaps.directions('json', {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode,
        alternatives: true,
      })
    );

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error: ${response.status}`,
        code: RouteErrorCode.API_ERROR,
      };
    }

    const data: GoogleDirectionsResponse = await response.json();

    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      return {
        success: false,
        error: `No routes found: ${data.status}`,
        code: RouteErrorCode.NO_ROUTES_FOUND,
      };
    }

    // Procesar múltiples rutas
    const routes: AlternativeRoute[] = data.routes
      .slice(0, maxAlternatives)
      .map((route, index) => {
        const leg = route.legs[0];
        const baseRoute = {
          polyline: this.decodePolyline(route.overview_polyline.points),
          distance: leg.distance.value,
          duration: leg.duration.value,
          distanceText: leg.distance.text,
          durationText: leg.duration.text,
          bounds: {
            northeast: {
              latitude: route.bounds.northeast.lat,
              longitude: route.bounds.northeast.lng,
            },
            southwest: {
              latitude: route.bounds.southwest.lat,
              longitude: route.bounds.southwest.lng,
            },
          },
        };

        // Determinar características de la ruta
        const durations = data.routes.map(r => r.legs[0].duration.value);
        const distances = data.routes.map(r => r.legs[0].distance.value);

        return {
          ...baseRoute,
          routeIndex: index,
          isFastest: leg.duration.value === Math.min(...durations),
          isShortest: leg.distance.value === Math.min(...distances),
          trafficLevel: this.estimateTraffic(leg.duration.value, leg.distance.value),
          tollsCount: 0, // Se puede calcular desde la respuesta detallada
        };
      });

    return { success: true, data: routes };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: RouteErrorCode.NETWORK_ERROR,
    };
  }
}

private estimateTraffic(duration: number, distance: number): 'low' | 'medium' | 'high' {
  const speed = (distance / 1000) / (duration / 3600); // km/h
  if (speed > 50) return 'low';
  if (speed > 30) return 'medium';
  return 'high';
}
```

#### 2.3 Crear hook useAlternativeRoutes

**Archivo:** `hooks/useAlternativeRoutes.ts`

```typescript
import { useState, useCallback } from 'react';
import { routeCalculator } from '@/lib/map/routeCalculator';
import type { AlternativeRoute, Coordinates } from '@/types/map';

export const useAlternativeRoutes = () => {
  const [routes, setRoutes] = useState<AlternativeRoute[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoutes = useCallback(async (
    origin: Coordinates,
    destination: Coordinates,
    maxAlternatives: number = 3
  ) => {
    setIsLoading(true);
    setError(null);

    const result = await routeCalculator.calculateAlternativeRoutes({
      origin,
      destination,
      maxAlternatives,
    });

    if (result.success) {
      setRoutes(result.data);
      // Seleccionar la ruta más rápida por defecto
      const fastestIndex = result.data.findIndex(r => r.isFastest);
      setSelectedRouteIndex(fastestIndex >= 0 ? fastestIndex : 0);
    } else {
      setError(result.error);
      setRoutes([]);
    }

    setIsLoading(false);
  }, []);

  const selectRoute = useCallback((index: number) => {
    if (index >= 0 && index < routes.length) {
      setSelectedRouteIndex(index);
    }
  }, [routes.length]);

  return {
    routes,
    selectedRoute: routes[selectedRouteIndex] || null,
    selectedRouteIndex,
    selectRoute,
    calculateRoutes,
    isLoading,
    error,
  };
};
```

#### 2.4 Componente para mostrar rutas alternativas

**Archivo:** `components/Map/AlternativeRoutes.tsx`

```typescript
import React, { memo } from 'react';
import { Polyline } from 'react-native-maps';
import type { AlternativeRoute } from '@/types/map';

interface AlternativeRoutesProps {
  routes: AlternativeRoute[];
  selectedIndex: number;
  onRoutePress: (index: number) => void;
}

const AlternativeRoutes: React.FC<AlternativeRoutesProps> = memo(({
  routes,
  selectedIndex,
  onRoutePress,
}) => {
  return (
    <>
      {routes.map((route, index) => {
        const isSelected = index === selectedIndex;
        
        return (
          <Polyline
            key={`route-${index}`}
            coordinates={route.polyline}
            strokeColor={isSelected ? '#4285F4' : '#B0BEC5'}
            strokeWidth={isSelected ? 5 : 3}
            lineDashPattern={isSelected ? [0] : [5, 5]}
            tappable
            onPress={() => onRoutePress(index)}
            zIndex={isSelected ? 2 : 1}
          />
        );
      })}
    </>
  );
});

AlternativeRoutes.displayName = 'AlternativeRoutes';

export default AlternativeRoutes;
```

#### 2.5 UI para selección de rutas

**Archivo:** `components/Map/RouteSelector.tsx`

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { AlternativeRoute } from '@/types/map';

interface RouteSelectorProps {
  routes: AlternativeRoute[];
  selectedIndex: number;
  onSelectRoute: (index: number) => void;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({
  routes,
  selectedIndex,
  onSelectRoute,
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="absolute bottom-24 left-0 right-0"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {routes.map((route, index) => {
        const isSelected = index === selectedIndex;
        
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onSelectRoute(index)}
            className={`mr-3 p-4 rounded-xl ${
              isSelected ? 'bg-primary' : 'bg-white'
            } shadow-lg`}
            style={{ minWidth: 120 }}
          >
            <Text className={`font-JakartaBold text-sm ${
              isSelected ? 'text-white' : 'text-gray-800'
            }`}>
              Ruta {index + 1}
            </Text>
            
            {route.isFastest && (
              <Text className="text-xs text-green-500 mt-1">⚡ Más rápida</Text>
            )}
            {route.isShortest && (
              <Text className="text-xs text-blue-500 mt-1">📏 Más corta</Text>
            )}
            
            <Text className={`text-xs mt-2 ${
              isSelected ? 'text-white' : 'text-gray-600'
            }`}>
              {route.durationText}
            </Text>
            <Text className={`text-xs ${
              isSelected ? 'text-white' : 'text-gray-500'
            }`}>
              {route.distanceText}
            </Text>
            
            <View className="flex-row items-center mt-2">
              <View className={`w-2 h-2 rounded-full ${
                route.trafficLevel === 'low' ? 'bg-green-500' :
                route.trafficLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <Text className={`text-xs ml-1 ${
                isSelected ? 'text-white' : 'text-gray-500'
              }`}>
                Tráfico {
                  route.trafficLevel === 'low' ? 'bajo' :
                  route.trafficLevel === 'medium' ? 'medio' : 'alto'
                }
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default RouteSelector;
```

---

## Feature 3: Offline Maps

### Objetivo

Permitir navegación básica sin conexión mediante caché de tiles del mapa.

### Implementación

#### 3.1 Instalar dependencias

```bash
npm install @react-native-async-storage/async-storage
npm install react-native-fs
```

#### 3.2 Crear tipos para tiles

**Archivo:** `types/map.ts` (agregar)

```typescript
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
```

#### 3.3 Crear TileCache Manager

**Archivo:** `lib/map/tileCache.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import type { MapTile, DownloadableRegion, CacheOptions, Coordinates } from '@/types/map';

class TileCache {
  private cacheDir: string;
  private options: CacheOptions;
  private readonly CACHE_KEY = '@map_tiles_metadata';

  constructor(options?: Partial<CacheOptions>) {
    this.cacheDir = `${RNFS.DocumentDirectoryPath}/map_tiles`;
    this.options = {
      maxCacheSize: 100, // 100 MB
      maxAge: 30, // 30 días
      compressionEnabled: true,
      ...options,
    };
  }

  /**
   * Inicializa el directorio de caché
   */
  async initialize(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.cacheDir);
      if (!exists) {
        await RNFS.mkdir(this.cacheDir);
      }
    } catch (error) {
      console.error('[TileCache] Failed to initialize:', error);
    }
  }

  /**
   * Calcula tiles necesarios para una región
   */
  calculateTiles(region: DownloadableRegion): MapTile[] {
    const tiles: MapTile[] = [];
    
    for (let z = region.minZoom; z <= region.maxZoom; z++) {
      const n = Math.pow(2, z);
      
      const minTileX = Math.floor((region.bounds.southWest.longitude + 180) / 360 * n);
      const maxTileX = Math.floor((region.bounds.northEast.longitude + 180) / 360 * n);
      
      const minTileY = Math.floor((1 - Math.log(Math.tan(region.bounds.northEast.latitude * Math.PI / 180) + 
        1 / Math.cos(region.bounds.northEast.latitude * Math.PI / 180)) / Math.PI) / 2 * n);
      const maxTileY = Math.floor((1 - Math.log(Math.tan(region.bounds.southWest.latitude * Math.PI / 180) + 
        1 / Math.cos(region.bounds.southWest.latitude * Math.PI / 180)) / Math.PI) / 2 * n);
      
      for (let x = minTileX; x <= maxTileX; x++) {
        for (let y = minTileY; y <= maxTileY; y++) {
          tiles.push({
            x,
            y,
            z,
            url: this.getTileUrl(x, y, z),
            localPath: `${this.cacheDir}/${z}_${x}_${y}.png`,
          });
        }
      }
    }
    
    return tiles;
  }

  /**
   * Descarga un tile individual
   */
  async downloadTile(tile: MapTile): Promise<boolean> {
    try {
      const exists = await RNFS.exists(tile.localPath!);
      if (exists) {
        return true; // Ya existe
      }

      await RNFS.downloadFile({
        fromUrl: tile.url,
        toFile: tile.localPath!,
      }).promise;

      // Guardar metadata
      await this.saveTileMetadata(tile);

      return true;
    } catch (error) {
      console.error(`[TileCache] Failed to download tile ${tile.x},${tile.y},${tile.z}:`, error);
      return false;
    }
  }

  /**
   * Descarga una región completa
   */
  async downloadRegion(
    region: DownloadableRegion,
    onProgress?: (downloaded: number, total: number) => void
  ): Promise<void> {
    const tiles = this.calculateTiles(region);
    let downloaded = 0;

    // Descargar en batches de 10
    const batchSize = 10;
    for (let i = 0; i < tiles.length; i += batchSize) {
      const batch = tiles.slice(i, i + batchSize);
      await Promise.all(batch.map(tile => this.downloadTile(tile)));
      
      downloaded += batch.length;
      onProgress?.(downloaded, tiles.length);
    }

    // Guardar región completa
    await this.saveRegion({
      ...region,
      downloadedTiles: tiles.length,
      isComplete: true,
    });
  }

  /**
   * Obtiene un tile del caché o lo descarga
   */
  async getTile(x: number, y: number, z: number): Promise<string | null> {
    const localPath = `${this.cacheDir}/${z}_${x}_${y}.png`;
    
    try {
      const exists = await RNFS.exists(localPath);
      if (exists) {
        // Verificar si el tile no está muy viejo
        const metadata = await this.getTileMetadata(x, y, z);
        if (metadata && !this.isTileExpired(metadata)) {
          return `file://${localPath}`;
        }
      }

      // Descargar si no existe o está expirado
      const tile: MapTile = {
        x,
        y,
        z,
        url: this.getTileUrl(x, y, z),
        localPath,
      };

      const success = await this.downloadTile(tile);
      return success ? `file://${localPath}` : null;
    } catch (error) {
      console.error('[TileCache] Error getting tile:', error);
      return null;
    }
  }

  /**
   * Limpia tiles expirados
   */
  async cleanExpiredTiles(): Promise<void> {
    try {
      const files = await RNFS.readDir(this.cacheDir);
      const now = new Date();

      for (const file of files) {
        const match = file.name.match(/(\d+)_(\d+)_(\d+)\.png/);
        if (match) {
          const [, z, x, y] = match;
          const metadata = await this.getTileMetadata(
            parseInt(x),
            parseInt(y),
            parseInt(z)
          );

          if (metadata && this.isTileExpired(metadata)) {
            await RNFS.unlink(file.path);
            await this.removeTileMetadata(parseInt(x), parseInt(y), parseInt(z));
          }
        }
      }
    } catch (error) {
      console.error('[TileCache] Error cleaning tiles:', error);
    }
  }

  /**
   * Obtiene el tamaño total del caché
   */
  async getCacheSize(): Promise<number> {
    try {
      const files = await RNFS.readDir(this.cacheDir);
      let totalSize = 0;

      for (const file of files) {
        totalSize += file.size;
      }

      return totalSize / (1024 * 1024); // MB
    } catch (error) {
      console.error('[TileCache] Error getting cache size:', error);
      return 0;
    }
  }

  /**
   * Limpia todo el caché
   */
  async clearCache(): Promise<void> {
    try {
      await RNFS.unlink(this.cacheDir);
      await this.initialize();
      await AsyncStorage.removeItem(this.CACHE_KEY);
    } catch (error) {
      console.error('[TileCache] Error clearing cache:', error);
    }
  }

  // Métodos privados

  private getTileUrl(x: number, y: number, z: number): string {
    // Usar OpenStreetMap tiles como fallback
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }

  private async saveTileMetadata(tile: MapTile): Promise<void> {
    try {
      const key = `tile_${tile.x}_${tile.y}_${tile.z}`;
      const metadata = {
        ...tile,
        cachedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(metadata));
    } catch (error) {
      console.error('[TileCache] Error saving tile metadata:', error);
    }
  }

  private async getTileMetadata(x: number, y: number, z: number): Promise<MapTile | null> {
    try {
      const key = `tile_${x}_${y}_${z}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  private async removeTileMetadata(x: number, y: number, z: number): Promise<void> {
    try {
      const key = `tile_${x}_${y}_${z}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('[TileCache] Error removing tile metadata:', error);
    }
  }

  private isTileExpired(tile: MapTile): boolean {
    if (!tile.cachedAt) return true;
    const cachedDate = new Date(tile.cachedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - cachedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > this.options.maxAge;
  }

  private async saveRegion(region: DownloadableRegion): Promise<void> {
    try {
      const regions = await this.getSavedRegions();
      const index = regions.findIndex(r => r.id === region.id);
      
      if (index >= 0) {
        regions[index] = region;
      } else {
        regions.push(region);
      }

      await AsyncStorage.setItem('offline_regions', JSON.stringify(regions));
    } catch (error) {
      console.error('[TileCache] Error saving region:', error);
    }
  }

  async getSavedRegions(): Promise<DownloadableRegion[]> {
    try {
      const data = await AsyncStorage.getItem('offline_regions');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }
}

export const tileCache = new TileCache();
export { TileCache };
```

#### 3.4 Hook para offline maps

**Archivo:** `hooks/useOfflineMaps.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { tileCache } from '@/lib/map/tileCache';
import type { DownloadableRegion, Coordinates } from '@/types/map';

export const useOfflineMaps = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [savedRegions, setSavedRegions] = useState<DownloadableRegion[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<{
    regionId: string | null;
    downloaded: number;
    total: number;
  }>({ regionId: null, downloaded: 0, total: 0 });

  useEffect(() => {
    tileCache.initialize().then(() => {
      setIsInitialized(true);
      loadSavedRegions();
    });
  }, []);

  const loadSavedRegions = useCallback(async () => {
    const regions = await tileCache.getSavedRegions();
    setSavedRegions(regions);
  }, []);

  const downloadRegion = useCallback(async (region: DownloadableRegion) => {
    setDownloadProgress({ regionId: region.id, downloaded: 0, total: region.tileCount });

    await tileCache.downloadRegion(region, (downloaded, total) => {
      setDownloadProgress({ regionId: region.id, downloaded, total });
    });

    setDownloadProgress({ regionId: null, downloaded: 0, total: 0 });
    await loadSavedRegions();
  }, [loadSavedRegions]);

  const clearCache = useCallback(async () => {
    await tileCache.clearCache();
    setSavedRegions([]);
  }, []);

  const getCacheSize = useCallback(async (): Promise<number> => {
    return await tileCache.getCacheSize();
  }, []);

  return {
    isInitialized,
    savedRegions,
    downloadProgress,
    downloadRegion,
    clearCache,
    getCacheSize,
  };
};
```

---

## Feature 4: Animaciones Suaves

### Objetivo

Implementar transiciones fluidas y profesionales en el mapa.

### Implementación

#### 4.1 Crear AnimationManager

**Archivo:** `lib/map/animationManager.ts`

```typescript
import { Animated, Easing } from 'react-native';
import type { Region, LatLng } from 'react-native-maps';

export type AnimationType = 
  | 'zoom'
  | 'pan'
  | 'fit'
  | 'follow'
  | 'bounce'
  | 'pulse';

export interface AnimationOptions {
  duration: number;
  easing: keyof typeof Easing;
  delay?: number;
}

class AnimationManager {
  private animationValues = new Map<string, Animated.Value>();

  /**
   * Crea un valor animado
   */
  createAnimatedValue(key: string, initialValue: number = 0): Animated.Value {
    const value = new Animated.Value(initialValue);
    this.animationValues.set(key, value);
    return value;
  }

  /**
   * Obtiene un valor animado existente
   */
  getAnimatedValue(key: string): Animated.Value | undefined {
    return this.animationValues.get(key);
  }

  /**
   * Anima un valor con opciones
   */
  animate(
    value: Animated.Value,
    toValue: number,
    options: Partial<AnimationOptions> = {}
  ): Promise<void> {
    const {
      duration = 300,
      easing = 'inOut',
      delay = 0,
    } = options;

    const easingFn = this.getEasingFunction(easing);

    return new Promise((resolve) => {
      Animated.timing(value, {
        toValue,
        duration,
        delay,
        easing: easingFn,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }

  /**
   * Anima múltiples valores en paralelo
   */
  animateParallel(
    animations: Array<{ value: Animated.Value; toValue: number }>,
    options: Partial<AnimationOptions> = {}
  ): Promise<void> {
    const {
      duration = 300,
      easing = 'inOut',
    } = options;

    const easingFn = this.getEasingFunction(easing);

    return new Promise((resolve) => {
      Animated.parallel(
        animations.map(({ value, toValue }) =>
          Animated.timing(value, {
            toValue,
            duration,
            easing: easingFn,
            useNativeDriver: true,
          })
        )
      ).start(() => resolve());
    });
  }

  /**
   * Anima múltiples valores en secuencia
   */
  animateSequence(
    animations: Array<{ value: Animated.Value; toValue: number; duration?: number }>,
    options: Partial<AnimationOptions> = {}
  ): Promise<void> {
    const { easing = 'inOut' } = options;
    const easingFn = this.getEasingFunction(easing);

    return new Promise((resolve) => {
      Animated.sequence(
        animations.map(({ value, toValue, duration = 300 }) =>
          Animated.timing(value, {
            toValue,
            duration,
            easing: easingFn,
            useNativeDriver: true,
          })
        )
      ).start(() => resolve());
    });
  }

  /**
   * Animación de rebote
   */
  bounce(value: Animated.Value, toValue: number): Promise<void> {
    return new Promise((resolve) => {
      Animated.spring(value, {
        toValue,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }

  /**
   * Animación de pulso continuo
   */
  pulse(value: Animated.Value, fromValue: number, toValue: number): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: fromValue,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  }

  /**
   * Interpola valores para transiciones suaves
   */
  interpolate(
    value: Animated.Value,
    inputRange: number[],
    outputRange: number[]
  ): Animated.AnimatedInterpolation<number> {
    return value.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  }

  /**
   * Limpia todos los valores animados
   */
  clear(): void {
    this.animationValues.clear();
  }

  // Métodos privados

  private getEasingFunction(easing: string): (value: number) => number {
    const easingMap: Record<string, (value: number) => number> = {
      linear: Easing.linear,
      ease: Easing.ease,
      quad: Easing.quad,
      cubic: Easing.cubic,
      poly: Easing.poly(4),
      sin: Easing.sin,
      circle: Easing.circle,
      exp: Easing.exp,
      elastic: Easing.elastic(1),
      back: Easing.back(1),
      bounce: Easing.bounce,
      bezier: Easing.bezier(0.42, 0, 0.58, 1),
      in: Easing.in(Easing.ease),
      out: Easing.out(Easing.ease),
      inOut: Easing.inOut(Easing.ease),
    };

    return easingMap[easing] || Easing.inOut(Easing.ease);
  }
}

export const animationManager = new AnimationManager();
export { AnimationManager };
```

#### 4.2 Hook para animaciones de mapa

**Archivo:** `hooks/useMapAnimations.ts`

```typescript
import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import type { Region, LatLng } from 'react-native-maps';
import { animationManager } from '@/lib/map/animationManager';
import type { MapHandle } from '@/components/Map';

export const useMapAnimations = (mapRef: React.RefObject<MapHandle>) => {
  const markerScale = useRef(new Animated.Value(1)).current;
  const markerOpacity = useRef(new Animated.Value(1)).current;
  const routeProgress = useRef(new Animated.Value(0)).current;

  /**
   * Anima el zoom a una ubicación con efecto suave
   */
  const animateToLocation = useCallback(async (
    coordinate: LatLng,
    zoom?: number,
    duration: number = 800
  ) => {
    if (!mapRef.current) return;

    // Primero hacer zoom out un poco
    const currentRegion = await getCurrentRegion();
    if (currentRegion) {
      const zoomOutRegion: Region = {
        ...currentRegion,
        latitudeDelta: currentRegion.latitudeDelta * 1.5,
        longitudeDelta: currentRegion.longitudeDelta * 1.5,
      };

      mapRef.current.animateToRegion(zoomOutRegion, duration / 3);
    }

    // Luego animar a la ubicación final
    setTimeout(() => {
      if (mapRef.current) {
        if (zoom) {
          const delta = Math.pow(2, 20 - zoom) / 1000;
          const region: Region = {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            latitudeDelta: delta,
            longitudeDelta: delta,
          };
          mapRef.current.animateToRegion(region, duration * 2 / 3);
        } else {
          mapRef.current.animateToCoordinate(coordinate, duration * 2 / 3);
        }
      }
    }, duration / 3);
  }, [mapRef]);

  /**
   * Anima el ajuste a coordenadas con padding dinámico
   */
  const animateToFitCoordinates = useCallback((
    coordinates: LatLng[],
    padding: number = 50,
    duration: number = 600
  ) => {
    if (!mapRef.current) return;

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: {
        top: padding,
        right: padding,
        bottom: padding,
        left: padding,
      },
      animated: true,
    });
  }, [mapRef]);

  /**
   * Anima un marcador con efecto de rebote
   */
  const bounceMarker = useCallback(() => {
    animationManager.bounce(markerScale, 1.3).then(() => {
      animationManager.animate(markerScale, 1, { duration: 200 });
    });
  }, [markerScale]);

  /**
   * Anima la aparición de un marcador
   */
  const fadeInMarker = useCallback(() => {
    markerOpacity.setValue(0);
    markerScale.setValue(0.5);

    animationManager.animateParallel([
      { value: markerOpacity, toValue: 1 },
      { value: markerScale, toValue: 1 },
    ], { duration: 400, easing: 'out' });
  }, [markerOpacity, markerScale]);

  /**
   * Anima la desaparición de un marcador
   */
  const fadeOutMarker = useCallback(async () => {
    await animationManager.animateParallel([
      { value: markerOpacity, toValue: 0 },
      { value: markerScale, toValue: 0.5 },
    ], { duration: 300, easing: 'in' });
  }, [markerOpacity, markerScale]);

  /**
   * Anima el progreso de dibujo de una ruta
   */
  const animateRouteProgress = useCallback((duration: number = 1000) => {
    routeProgress.setValue(0);
    return animationManager.animate(routeProgress, 1, {
      duration,
      easing: 'inOut',
    });
  }, [routeProgress]);

  /**
   * Anima el seguimiento de un conductor en movimiento
   */
  const followDriver = useCallback((
    driverLocation: LatLng,
    smooth: boolean = true,
    duration: number = 1000
  ) => {
    if (!mapRef.current) return;

    if (smooth) {
      // Usar animación suave
      mapRef.current.animateToCoordinate(driverLocation, duration);
    } else {
      // Movimiento instantáneo
      mapRef.current.animateToCoordinate(driverLocation, 0);
    }
  }, [mapRef]);

  /**
   * Obtiene la región actual del mapa
   */
  const getCurrentRegion = useCallback(async (): Promise<Region | null> => {
    // Esta función requeriría acceso a la región actual del mapa
    // En react-native-maps no hay una forma directa, pero se puede mantener en estado
    return null;
  }, []);

  return {
    // Animaciones de cámara
    animateToLocation,
    animateToFitCoordinates,
    followDriver,

    // Animaciones de marcadores
    bounceMarker,
    fadeInMarker,
    fadeOutMarker,
    markerAnimatedStyle: {
      opacity: markerOpacity,
      transform: [{ scale: markerScale }],
    },

    // Animaciones de ruta
    animateRouteProgress,
    routeProgress,

    // Utilidades
    getCurrentRegion,
  };
};
```

#### 4.3 Componente AnimatedMarker

**Archivo:** `components/Map/AnimatedMarker.tsx`

```typescript
import React, { useEffect } from 'react';
import { Animated } from 'react-native';
import { Marker } from 'react-native-maps';
import type { LatLng } from 'react-native-maps';

interface AnimatedMarkerProps {
  coordinate: LatLng;
  title?: string;
  description?: string;
  image?: any;
  onPress?: () => void;
  animateOnMount?: boolean;
  bounceOnPress?: boolean;
}

const AnimatedMarker: React.FC<AnimatedMarkerProps> = ({
  coordinate,
  title,
  description,
  image,
  onPress,
  animateOnMount = true,
  bounceOnPress = true,
}) => {
  const scale = React.useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const opacity = React.useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;

  useEffect(() => {
    if (animateOnMount) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateOnMount]);

  const handlePress = () => {
    if (bounceOnPress) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onPress?.();
  };

  return (
    <Marker
      coordinate={coordinate}
      title={title}
      description={description}
      image={image}
      onPress={handlePress}
      opacity={opacity}
    />
  );
};

export default AnimatedMarker;
```

---

## Integración Final

### Actualizar Map.tsx para usar todas las features

```typescript
import React, { useState } from 'react';
import { useMapClustering } from '@/hooks/useMapClustering';
import { useAlternativeRoutes } from '@/hooks/useAlternativeRoutes';
import { useOfflineMaps } from '@/hooks/useOfflineMaps';
import { useMapAnimations } from '@/hooks/useMapAnimations';

import ClusteredMarkers from './Map/ClusteredMarkers';
import AlternativeRoutes from './Map/AlternativeRoutes';
import RouteSelector from './Map/RouteSelector';

const Map = forwardRef<MapHandle, MapProps>((props, ref) => {
  // ... código existente ...

  // Nuevas features
  const { clusters, updateClusters, expandCluster } = useMapClustering(markers, true);
  const { routes, selectedRoute, selectedRouteIndex, selectRoute } = useAlternativeRoutes();
  const { isInitialized: isOfflineInitialized } = useOfflineMaps();
  const mapAnimations = useMapAnimations(mapRef);

  const handleRegionChange = (region: Region) => {
    // Actualizar clusters en cambio de región
    updateClusters(region, getZoomLevel(region));
  };

  const handleClusterPress = (cluster: MarkerCluster) => {
    const zoom = expandCluster(cluster.id);
    mapAnimations.animateToLocation(cluster.coordinate, zoom);
  };

  return (
    <MapView
      ref={mapRef}
      onRegionChangeComplete={handleRegionChange}
      // ... otras props ...
    >
      <ClusteredMarkers
        clusters={clusters}
        selectedDriver={selectedDriver}
        onMarkerPress={handleMarkerPress}
        onClusterPress={handleClusterPress}
      />
      
      {routes.length > 0 && (
        <>
          <AlternativeRoutes
            routes={routes}
            selectedIndex={selectedRouteIndex}
            onRoutePress={selectRoute}
          />
          <RouteSelector
            routes={routes}
            selectedIndex={selectedRouteIndex}
            onSelectRoute={selectRoute}
          />
        </>
      )}
    </MapView>
  );
});
```

## Testing

### Tests para nuevas features

1. **ClusterManager Tests**: `__tests__/lib/map/clusterManager.test.ts`
2. **TileCache Tests**: `__tests__/lib/map/tileCache.test.ts`
3. **AnimationManager Tests**: `__tests__/lib/map/animationManager.test.ts`
4. **Integration Tests**: Verificar que todas las features funcionen juntas

## Documentación

Actualizar `docs/map-system-api.md` con:

- API de clustering
- API de rutas alternativas
- API de offline maps
- API de animaciones
- Ejemplos de integración

## Resumen de Beneficios

### Feature 1: Clustering

- ✅ Maneja miles de conductores eficientemente
- ✅ Mejora performance de renderizado
- ✅ UX limpia y profesional

### Feature 2: Rutas Alternativas

- ✅ Más opciones para el usuario
- ✅ Información detallada de cada ruta
- ✅ Selección visual e intuitiva

### Feature 3: Offline Maps

- ✅ Funciona sin conexión
- ✅ Ahorra datos móviles
- ✅ Descarga inteligente por regiones

### Feature 4: Animaciones

- ✅ Transiciones suaves y profesionales
- ✅ Feedback visual mejorado
- ✅ Experiencia premium

## Próximos Pasos

1. Implementar predicción de rutas con ML
2. Añadir modo Street View
3. Integrar realidad aumentada para navegación
4. Optimizar aún más el consumo de batería

### To-dos

- [ ] Crear sistema de tipos centralizado en types/map.ts y types/driver.ts con exports normales
- [ ] Implementar RouteCalculator con caché, deduplicación y manejo de errores en lib/map/routeCalculator.ts
- [ ] Crear RegionCalculator para cálculo optimizado de regiones en lib/map/regionCalculator.ts
- [ ] Implementar MarkerGenerator para generación type-safe de marcadores en lib/map/markerGenerator.ts
- [ ] Crear hooks especializados useMapRoutes y useMapMarkers en hooks/
- [ ] Extraer componentes de presentación MapMarkers y MapRoute a components/Map/
- [ ] Refactorizar Map.tsx para usar nuevos hooks y componentes, reduciendo complejidad
- [ ] Añadir tests unitarios para RouteCalculator, RegionCalculator y MarkerGenerator
- [ ] Documentar APIs públicas en docs/map-system-api.md con ejemplos
- [ ] Migrar código legacy de lib/map.ts y deprecar archivo