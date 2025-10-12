import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  useCallback,
  useEffect,
  memo,
} from "react";
import { ActivityIndicator, Text, View, Platform } from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Region,
  LatLng,
} from "react-native-maps";

import { Restaurant } from "@/constants/dummyData";
import {
  getMapStyle,
  validateMapConfig,
  DARK_MODERN_STYLE,
  type MapConfiguration,
} from "@/constants/mapStyles";
import { useLocationStore, useDriverStore, useRealtimeStore, useMapFlowStore } from "@/store";
import { useMapRoutes } from "@/hooks/useMapRoutes";
import { useMapMarkers } from "@/hooks/useMapMarkers";
import { useMapClustering } from "@/hooks/useMapClustering";
import { useAlternativeRoutes } from "@/hooks/useAlternativeRoutes";
import { useOfflineMaps } from "@/hooks/useOfflineMaps";
import { useMapAnimations } from "@/hooks/useMapAnimations";
import { RegionCalculator } from "@/lib/map/regionCalculator";

import MapMarkers from "./Map/MapMarkers";
import MapRoute from "./Map/MapRoute";
import ClusteredMarkers from "./Map/ClusteredMarkers";
import AlternativeRoutes from "./Map/AlternativeRoutes";
import RouteSelector from "./Map/RouteSelector";
import type { Coordinates, MarkerCluster } from "@/types/map";

// 🎨 Importar sistema de estilos de mapas

export interface MapHandle {
  animateToRegion: (region: Region, duration?: number) => void;
  animateToCoordinate: (coord: LatLng, duration?: number) => void;
  fitToCoordinates: (
    coords: LatLng[],
    options?: {
      edgePadding?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
      animated?: boolean;
    },
  ) => void;
  setCamera: (config: any) => void;
  setRoutePolyline: (polyline: LatLng[]) => void;
  clearRoutePolyline: () => void;
  setNavMarkers: (markers: {
    pickup?: LatLng | null;
    destination?: LatLng | null;
  }) => void;
}

interface MapProps {
  serviceType?: "transport" | "delivery";
  restaurants?: Restaurant[];
  isLoadingRestaurants?: boolean;

  // 🎨 Configuración de estilos del mapa
  mapConfig?: Partial<MapConfiguration>;
}

const Map = forwardRef<MapHandle, MapProps>(
  (
    {
      serviceType = "transport",
      restaurants = [],
      isLoadingRestaurants = false,
      mapConfig,
    }: MapProps,
    ref,
  ) => {
    const mapRef = useRef<MapView | null>(null);
    
    // Estado desde stores
    const userLocation = useLocationStore(state => 
      state.userLatitude && state.userLongitude
        ? { latitude: state.userLatitude, longitude: state.userLongitude }
        : null
    );
    
    const destination = useLocationStore(state =>
      state.destinationLatitude && state.destinationLongitude
        ? { latitude: state.destinationLatitude, longitude: state.destinationLongitude }
        : null
    );

    const { selectedDriver } = useDriverStore();
    const { driverLocation } = useRealtimeStore();

    // Hooks especializados
    const { route, isLoading: isRouteLoading } = useMapRoutes(userLocation, destination);
    const { markers, loading: isMarkersLoading } = useMapMarkers(userLocation);

    // Nuevas features
    const { clusters, updateClusters, expandCluster } = useMapClustering(markers, true);
    const { routes, selectedRoute, selectedRouteIndex, selectRoute, calculateRoutes } = useAlternativeRoutes();
    const { isInitialized: isOfflineInitialized } = useOfflineMaps();
    const mapAnimations = useMapAnimations(mapRef as React.RefObject<any>);

    // Región calculada
    const region = RegionCalculator.calculateRouteRegion(userLocation, destination);

    // 🎨 Configuración del mapa con tema dark moderno
    const defaultMapConfig: Partial<MapConfiguration> = useMemo(
      () => ({
        theme: "dark",
        customStyle: DARK_MODERN_STYLE,
        userInterfaceStyle: "dark",
        mapType: Platform.OS === "ios" ? "mutedStandard" : "standard",
        showsPointsOfInterest: false,
        showsTraffic: false,
        showsCompass: true,
        showsScale: false,
        showsMyLocationButton: false,
        tintColor: "#00FF88", // Verde neón para acentos
        routeColor: "#4285F4", // Azul Google para rutas
        trailColor: "#FFE014", // Amarillo neón para trails
        predictionColor: "#00FF88", // Verde neón para predicciones
      }),
      [],
    );

    // 🎨 Configuración validada del mapa
    const validatedMapConfig = validateMapConfig({ ...defaultMapConfig, ...mapConfig });

    const mapStyleJson = getMapStyle(validatedMapConfig);

    const handleMapReady = useCallback(() => {
      if (!mapRef.current) return;

      if (validatedMapConfig.mapId) {
        return; // mapId ya maneja el estilo en la nube
      }

      (mapRef.current as any)?.setNativeProps({
        customMapStyle: mapStyleJson,
      });
    }, [mapStyleJson, validatedMapConfig.mapId]);

    // Event handlers para nuevas features
    const handleRegionChange = useCallback((region: Region) => {
      // Actualizar clusters en cambio de región
      const zoom = Math.log2(360 / region.latitudeDelta);
      updateClusters(region, zoom);
    }, [updateClusters]);

    const handleClusterPress = useCallback((cluster: MarkerCluster) => {
      const zoom = expandCluster(parseInt(cluster.id.replace('cluster-', '')));
      mapAnimations.animateToLocation(cluster.coordinate, zoom);
    }, [expandCluster, mapAnimations]);

    const handleMarkerPress = useCallback((marker: any) => {
      // Handle individual marker press
      console.log('Marker pressed:', marker);
    }, []);

    // Calcular rutas alternativas cuando hay origen y destino
    useEffect(() => {
      if (userLocation && destination) {
        calculateRoutes(userLocation, destination, 3);
      }
    }, [userLocation, destination, calculateRoutes]);

    // Expose imperative map controls - must be declared unconditionally before any return
    useImperativeHandle(
      ref,
      () => ({
        animateToRegion: (region: Region, duration = 500) => {
          mapRef.current?.animateToRegion(region, duration);
        },
        animateToCoordinate: (coord: LatLng, duration = 500) => {
          mapRef.current?.animateCamera({ center: coord }, { duration });
        },
        fitToCoordinates: (coords: LatLng[], options) => {
          mapRef.current?.fitToCoordinates(coords, options);
        },
        setCamera: (config: any) => {
          mapRef.current?.setCamera(config);
        },
        setRoutePolyline: (poly: LatLng[]) => {
          // TODO: Implement manual route setting
          console.log('Manual route set:', poly);
        },
        clearRoutePolyline: () => {
          // TODO: Implement manual route clearing
          console.log('Manual route cleared');
        },
        setNavMarkers: ({ pickup, destination }) => {
          // TODO: Implement navigation markers
          console.log('Nav markers set:', { pickup, destination });
        },
      }),
      [],
    );

    if (isMarkersLoading || !userLocation) {
      return (
        <View className="flex justify-between items-center w-full">
          <ActivityIndicator size="small" color="#000" />
        </View>
      );
    }

    return (
      <>
      <MapView
        ref={(r) => {
          mapRef.current = r;
        }}
        provider={PROVIDER_GOOGLE}
        className="w-full h-full rounded-2xl"
        googleMapId={validatedMapConfig.mapId}
        customMapStyle={validatedMapConfig.mapId ? undefined : mapStyleJson}
        userInterfaceStyle={validatedMapConfig.userInterfaceStyle}
        onMapReady={handleMapReady}
        onRegionChangeComplete={handleRegionChange}
        // 🎛️ Configuración de controles y elementos
        showsUserLocation={validatedMapConfig.showsUserLocation}
        showsPointsOfInterest={validatedMapConfig.showsPointsOfInterest}
        showsBuildings={validatedMapConfig.showsBuildings}
        showsTraffic={validatedMapConfig.showsTraffic}
        showsCompass={validatedMapConfig.showsCompass}
        showsScale={validatedMapConfig.showsScale}
        showsMyLocationButton={validatedMapConfig.showsMyLocationButton}
        // 🎯 Controles de interacción
        zoomEnabled={validatedMapConfig.zoomEnabled}
        scrollEnabled={validatedMapConfig.scrollEnabled}
        rotateEnabled={validatedMapConfig.rotateEnabled}
        pitchEnabled={validatedMapConfig.pitchEnabled}
        // 📍 Configuración de zoom
        maxZoomLevel={validatedMapConfig.maxZoomLevel}
        minZoomLevel={validatedMapConfig.minZoomLevel}
        // 🎨 Color del tinte
        tintColor={validatedMapConfig.tintColor}
        // 📍 Región inicial
        initialRegion={region}
      >
        {/* Clustered Markers */}
        <ClusteredMarkers
          clusters={clusters}
          selectedDriver={selectedDriver}
          onMarkerPress={handleMarkerPress}
          onClusterPress={handleClusterPress}
        />

        {/* Fallback to regular markers if no clustering */}
        {clusters.length === 0 && (
          <MapMarkers
            serviceType={serviceType}
            markers={markers}
            selectedDriver={selectedDriver}
            userLocation={userLocation}
            destination={destination}
            driverLocation={driverLocation}
            restaurants={restaurants}
          />
        )}
        
        {/* Alternative Routes */}
        {routes.length > 0 && (
          <AlternativeRoutes
            routes={routes}
            selectedIndex={selectedRouteIndex}
            onRoutePress={selectRoute}
          />
        )}

        {/* Single Route (fallback) */}
        {routes.length === 0 && route && (
          <MapRoute
            polyline={route.polyline}
            color={validatedMapConfig.routeColor}
          />
        )}

        {/* Selected Route */}
        {selectedRoute && (
          <MapRoute
            polyline={selectedRoute.polyline}
            color={validatedMapConfig.routeColor}
          />
        )}
      </MapView>

      {/* Route Selector UI */}
      {routes.length > 0 && (
        <RouteSelector
          routes={routes}
          selectedIndex={selectedRouteIndex}
          onSelectRoute={selectRoute}
        />
      )}
    </>
  );
  },
);

// Memoize the component to prevent unnecessary re-renders
const MemoizedMap = memo(Map);

// For backward compatibility
export default MemoizedMap;
