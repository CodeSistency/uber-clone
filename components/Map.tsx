import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import { ActivityIndicator, Text, View, Platform } from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
  LatLng,
} from "react-native-maps";

import { icons } from "@/constants";
import { Restaurant } from "@/constants/dummyData";
import {
  getMapStyle,
  validateMapConfig,
  DARK_MODERN_STYLE,
  MAP_COLORS,
  type MapConfiguration,
} from "@/constants/mapStyles";
import { endpoints } from "@/lib/endpoints";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
  debugMapStyles,
} from "@/lib/map";
import { useDriverStore, useLocationStore, useRealtimeStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

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
    // Debug estilos del mapa al inicio
    React.useEffect(() => {
      debugMapStyles();
    }, []);

    const mapRef = useRef<MapView | null>(null);
    const {
      userLongitude,
      userLatitude,
      destinationLatitude,
      destinationLongitude,
    } = useLocationStore();
    const { selectedDriver, setDrivers } = useDriverStore();

    const { data: drivers, loading, error } = useFetch<any>("driver");
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [routeCoordinates, setRouteCoordinates] = useState<
      { latitude: number; longitude: number }[]
    >([]);
    const [manualRoute, setManualRoute] = useState<boolean>(false);
    const [navPickup, setNavPickup] = useState<LatLng | null>(null);
    const [navDestination, setNavDestination] = useState<LatLng | null>(null);
    const { driverLocation } = useRealtimeStore();

    // Function to get route coordinates from Google Directions API
    const getRouteCoordinates = async (
      originLat: number,
      originLng: number,
      destLat: number,
      destLng: number,
    ) => {
      try {

        const response = await fetch(
          endpoints.googleMaps.directions("json", {
            origin: `${originLat},${originLng}`,
            destination: `${destLat},${destLng}`,
          }),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (data.status === "OK" && data.routes && data.routes[0]) {
          const points = data.routes[0].overview_polyline.points;
          const decodedPoints = decodePolyline(points);

          setRouteCoordinates(decodedPoints);
        } else {
          setRouteCoordinates([]);
        }
      } catch (error) {
        setRouteCoordinates([]);
      }
    };

    // Function to decode Google Maps polyline
    const decodePolyline = (encoded: string) => {
      const points: { latitude: number; longitude: number }[] = [];
      let index = 0,
        lat = 0,
        lng = 0;

      while (index < encoded.length) {
        let shift = 0,
          result = 0;
        let byte;

        // Decode latitude
        do {
          byte = encoded.charCodeAt(index++) - 63;
          result |= (byte & 0x1f) << shift;
          shift += 5;
        } while (byte >= 0x20);

        const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
        lat += deltaLat;

        shift = 0;
        result = 0;

        // Decode longitude
        do {
          byte = encoded.charCodeAt(index++) - 63;
          result |= (byte & 0x1f) << shift;
          shift += 5;
        } while (byte >= 0x20);

        const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
        lng += deltaLng;

        points.push({
          latitude: lat / 100000,
          longitude: lng / 100000,
        });
      }

      return points;
    };

    // Get route when origin or destination changes
    useEffect(() => {
      if (
        userLatitude &&
        userLongitude &&
        destinationLatitude &&
        destinationLongitude
      ) {
        if (manualRoute) {
          // When manual route is set via controller, skip auto calculation
          return;
        }
        getRouteCoordinates(
          userLatitude,
          userLongitude,
          destinationLatitude,
          destinationLongitude,
        );
      } else {
        setRouteCoordinates([]);
      }
    }, [
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude,
      manualRoute,
    ]);

    useEffect(() => {
      // Handle both array format and object format from backend
      const driversArray = Array.isArray(drivers)
        ? drivers
        : drivers?.data || [];

      if (Array.isArray(driversArray) && driversArray.length > 0) {
        if (!userLatitude || !userLongitude) return;

        const newMarkers = generateMarkersFromData({
          data: driversArray,
          userLatitude,
          userLongitude,
        });

        setMarkers(newMarkers);

        // Set basic drivers to store immediately for UI display
        setDrivers(newMarkers as MarkerData[]);
      }
    }, [drivers, userLatitude, userLongitude]);

    useEffect(() => {
      if (
        markers.length > 0 &&
        destinationLatitude !== undefined &&
        destinationLongitude !== undefined
      ) {
        calculateDriverTimes({
          markers,
          userLatitude,
          userLongitude,
          destinationLatitude,
          destinationLongitude,
        }).then((driversWithTimes) => {
          if (driversWithTimes && driversWithTimes.length > 0) {
            // Update existing drivers with time and price information
            setDrivers(driversWithTimes as MarkerData[]);
          }
        });
      }
    }, [markers, destinationLatitude, destinationLongitude]);

    const region = calculateRegion({
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude,
    });

    // 🎨 Configuración validada del mapa
    const validatedMapConfig = validateMapConfig(mapConfig || {});

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
          setManualRoute(true);
          setRouteCoordinates(poly);
        },
        clearRoutePolyline: () => {
          setManualRoute(false);
          setRouteCoordinates([]);
        },
        setNavMarkers: ({ pickup, destination }) => {
          if (typeof pickup !== "undefined") setNavPickup(pickup ?? null);
          if (typeof destination !== "undefined")
            setNavDestination(destination ?? null);
        },
      }),
      [],
    );

    if (loading || (!userLatitude && !userLongitude))
      return (
        <View className="flex justify-between items-center w-full">
          <ActivityIndicator size="small" color="#000" />
        </View>
      );

    if (error)
      return (
        <View className="flex justify-between items-center w-full">
          <Text>Error: {error}</Text>
        </View>
      );

    return (
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
        {/* Transport mode markers */}
        {serviceType === "transport" &&
          markers.map((marker, index) => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
              image={
                selectedDriver === +marker.id
                  ? icons.selectedMarker
                  : icons.marker
              }
            />
          ))}

        {/* Delivery mode markers */}
        {serviceType === "delivery" &&
          restaurants.map((restaurant, index) => (
            <Marker
              key={restaurant.id}
              coordinate={{
                latitude: restaurant.location.latitude,
                longitude: restaurant.location.longitude,
              }}
              title={restaurant.name}
              description={`${restaurant.category} • ${restaurant.rating}★ • ${restaurant.deliveryTime}`}
            >
              <View className="bg-brand-primary dark:bg-brand-primaryDark rounded-full p-2 shadow-lg border-2 border-primary-500">
                <Text className="text-lg">{restaurant.image}</Text>
              </View>
            </Marker>
          ))}

        {userLatitude && userLongitude && (
          <Marker
            key="origin"
            coordinate={{
              latitude: userLatitude,
              longitude: userLongitude,
            }}
            title="Origin"
            image={icons.point}
          />
        )}

        {destinationLatitude && destinationLongitude && (
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            image={icons.pin}
          />
        )}

        {navPickup && (
          <Marker
            key="nav_pickup"
            coordinate={navPickup}
            title="Pickup"
            image={icons.point}
          />
        )}

        {navDestination && (
          <Marker
            key="nav_destination"
            coordinate={navDestination}
            title="Destination"
            image={icons.pin}
          />
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={validatedMapConfig.routeColor}
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}

        {/* Live driver marker (real-time) */}
        {driverLocation && (
          <Marker
            key="live_driver"
            coordinate={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
            title="Driver"
            image={icons.selectedMarker}
          />
        )}
      </MapView>
    );
  },
);

// Memoize the component to prevent unnecessary re-renders
const MemoizedMap = memo(Map);

// For backward compatibility
export default MemoizedMap;
