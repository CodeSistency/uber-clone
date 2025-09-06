import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, Platform } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";

import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";
import { Restaurant } from "@/constants/dummyData";

const directionsAPI =
  process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY ||
  "AIzaSyC4o0Jqu8FvUxqn2Xw2UVU2oDn2e2uvdG8";

interface MapProps {
  serviceType?: "transport" | "delivery";
  restaurants?: Restaurant[];
  isLoadingRestaurants?: boolean;
}

const Map = ({ serviceType = "transport", restaurants = [], isLoadingRestaurants = false }: MapProps) => {
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

  // Function to get route coordinates from Google Directions API
  const getRouteCoordinates = async (
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
  ) => {
    try {
      console.log("[Map] Getting route coordinates:", {
        originLat,
        originLng,
        destLat,
        destLng,
      });

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${directionsAPI}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      console.log("[Map] Directions API response:", data.status);

      if (data.status === "OK" && data.routes && data.routes[0]) {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);

        console.log("[Map] Route decoded with", decodedPoints.length, "points");
        setRouteCoordinates(decodedPoints);
      } else {
        console.warn("[Map] No route found:", data.status);
        setRouteCoordinates([]);
      }
    } catch (error) {
      console.error("[Map] Error getting route:", error);
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
      console.log("[Map] Origin and destination available, getting route...");
      getRouteCoordinates(
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      );
    } else {
      console.log("[Map] Clearing route - missing coordinates");
      setRouteCoordinates([]);
    }
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  useEffect(() => {
    // Handle both array format and object format from backend
    const driversArray = Array.isArray(drivers) ? drivers : drivers?.data || [];

    if (Array.isArray(driversArray) && driversArray.length > 0) {
      if (!userLatitude || !userLongitude) return;

      console.log("[Map] drivers loaded", {
        count: driversArray.length,
        userLatitude,
        userLongitude,
        originalFormat: Array.isArray(drivers) ? "array" : "object",
        firstDriver: driversArray[0],
        firstDriverKeys: driversArray[0] ? Object.keys(driversArray[0]) : [],
      });
      const newMarkers = generateMarkersFromData({
        data: driversArray,
        userLatitude,
        userLongitude,
      });

      console.log("[Map] markers generated", { count: newMarkers.length });
      setMarkers(newMarkers);

      // Set basic drivers to store immediately for UI display
      console.log("[Map] Setting basic drivers to store for UI");
      setDrivers(newMarkers as MarkerData[]);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined
    ) {
      console.log("[Map] calculating driver times", {
        markers: markers.length,
        destinationLatitude,
        destinationLongitude,
      });
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((driversWithTimes) => {
        console.log("[Map] driver times calculated", {
          driversCount: driversWithTimes?.length,
        });
        if (driversWithTimes && driversWithTimes.length > 0) {
          // Update existing drivers with time and price information
          console.log("[Map] Updating drivers with calculated times");
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

  console.log("[Map] region", region);

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
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {/* Transport mode markers */}
      {serviceType === "transport" && markers.map((marker, index) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}

      {/* Delivery mode markers */}
      {serviceType === "delivery" && restaurants.map((restaurant, index) => (
        <Marker
          key={restaurant.id}
          coordinate={{
            latitude: restaurant.location.latitude,
            longitude: restaurant.location.longitude,
          }}
          title={restaurant.name}
          description={`${restaurant.category} • ${restaurant.rating}★ • ${restaurant.deliveryTime}`}
        >
          <View className="bg-white rounded-full p-2 shadow-lg border-2 border-primary-500">
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

      {routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#4285F4" // Google Maps blue
          strokeWidth={4}
          lineDashPattern={[0]}
        />
      )}
    </MapView>
  );
};

export default Map;
