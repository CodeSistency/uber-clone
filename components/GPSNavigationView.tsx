import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import { websocketService } from "@/app/services/websocketService";
import { useLocationStore, useRealtimeStore } from "@/store";

interface GPSNavigationViewProps {
  destinationLatitude: number;
  destinationLongitude: number;
  destinationAddress: string;
  rideId?: number;
  onArrived?: () => void;
  onClose?: () => void;
}

interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
}

const GPSNavigationView: React.FC<GPSNavigationViewProps> = ({
  destinationLatitude,
  destinationLongitude,
  destinationAddress,
  rideId,
  onArrived,
  onClose,
}) => {
  const { userLatitude, userLongitude } = useLocationStore();
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<NavigationStep | null>(null);
  const [distanceRemaining, setDistanceRemaining] =
    useState<string>("2.1 miles");
  const [timeRemaining, setTimeRemaining] = useState<string>("8 min");
  const [isNavigating, setIsNavigating] = useState(true);
  const { isTracking } = useRealtimeStore();
  const locationIntervalRef = React.useRef<number | null>(null);

  // Fetch real route data from Directions API when possible
  useEffect(() => {
    const fetchDirections = async () => {
      try {
        const originLat = userLatitude || 37.78825;
        const originLng = userLongitude || -122.4324;
        const apiKey = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;
        if (!apiKey) {
          // Fallback to straight line if no key available
          setRouteCoordinates([
            { latitude: originLat, longitude: originLng },
            { latitude: destinationLatitude, longitude: destinationLongitude },
          ]);
          return;
        }
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destinationLatitude},${destinationLongitude}&key=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.status === "OK" && json.routes?.[0]) {
          const points = json.routes[0].overview_polyline.points;
          const steps = json.routes[0].legs?.[0];
          // Decode polyline
          const decode = (t: string, e?: number) => {
            let points: any[] = [],
              index = 0,
              len = t.length,
              lat = 0,
              lng = 0;
            while (index < len) {
              let b,
                shift = 0,
                result = 0;
              do {
                b = t.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
              } while (b >= 0x20);
              const dlat = result & 1 ? ~(result >> 1) : result >> 1;
              lat += dlat;
              shift = 0;
              result = 0;
              do {
                b = t.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
              } while (b >= 0x20);
              const dlng = result & 1 ? ~(result >> 1) : result >> 1;
              lng += dlng;
              points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
            }
            return points;
          };
          setRouteCoordinates(decode(points));
          if (steps) {
            setDistanceRemaining(steps.distance?.text || "");
            setTimeRemaining(steps.duration?.text || "");
            setCurrentStep({
              instruction:
                steps?.steps?.[0]?.html_instructions?.replace(
                  /<[^>]*>?/gm,
                  "",
                ) || "Navigate",
              distance: steps.distance?.text || "",
              duration: steps.duration?.text || "",
            } as any);
          }
        } else {
          setRouteCoordinates([
            { latitude: originLat, longitude: originLng },
            { latitude: destinationLatitude, longitude: destinationLongitude },
          ]);
        }
      } catch (e) {
        // Fallback to straight line
        const originLat = userLatitude || 37.78825;
        const originLng = userLongitude || -122.4324;
        setRouteCoordinates([
          { latitude: originLat, longitude: originLng },
          { latitude: destinationLatitude, longitude: destinationLongitude },
        ]);
      }
    };
    fetchDirections();
  }, [destinationLatitude, destinationLongitude, userLatitude, userLongitude]);

  // Periodic driver location updates to WS during navigation
  useEffect(() => {
    // Use provided rideId or fallback to active service id (transport: ride_id, delivery: orderId, errand/parcel: id)
    const ar: any = useRealtimeStore.getState().activeRide as any;
    const effectiveRideId =
      rideId ?? (ar?.ride_id || ar?.orderId || ar?.id || 0);

    if (isNavigating && effectiveRideId) {
      // send immediately and then on interval
      try {
        websocketService.updateDriverLocation(effectiveRideId, {
          latitude: userLatitude || 0,
          longitude: userLongitude || 0,
          timestamp: new Date(),
        } as any);
      } catch {}

      locationIntervalRef.current = setInterval(() => {
        const { driverLocation } = useRealtimeStore.getState();
        const lat = driverLocation?.latitude ?? userLatitude ?? 0;
        const lng = driverLocation?.longitude ?? userLongitude ?? 0;

        websocketService.updateDriverLocation(effectiveRideId, {
          latitude: lat,
          longitude: lng,
          timestamp: new Date(),
        } as any);
      }, 5000) as unknown as number; // 5s interval
    }

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, [isNavigating, rideId, userLatitude, userLongitude]);

  const handleArrived = () => {
    Alert.alert(
      "Arrived at Destination",
      "You have arrived at the pickup location.",
      [
        {
          text: "Confirm Arrival",
          onPress: () => {
            if (onArrived) {
              onArrived();
            }
          },
        },
      ],
    );
  };

  const handleMessagePassenger = () => {
    // Navigate to chat with passenger
    // router.push('/chat/passenger');
    Alert.alert("Message Passenger", "Chat functionality would open here");
  };

  if (!userLatitude || !userLongitude) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-JakartaBold">Loading location...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Map View */}
      <View className="flex-1">
        <MapView
          className="flex-1"
          initialRegion={{
            latitude: userLatitude,
            longitude: userLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {/* Destination Marker */}
          <Marker
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Pickup Location"
            description={destinationAddress}
            pinColor="red"
          />

          {/* Route Polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#0286FF"
              strokeWidth={4}
            />
          )}
        </MapView>

        {/* Navigation Overlay */}
        <View className="absolute top-12 left-4 right-4 bg-white rounded-lg p-4 shadow-lg">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-JakartaBold text-lg">
              🎯 Heading to Pickup
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
            >
              <Text className="text-xl">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-3">
            <Text className="text-sm text-secondary-600 mb-1">Destination</Text>
            <Text className="font-JakartaMedium">{destinationAddress}</Text>
          </View>

          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-sm text-secondary-600">Distance</Text>
              <Text className="font-JakartaBold">{distanceRemaining}</Text>
            </View>
            <View className="items-center">
              <Text className="text-sm text-secondary-600">ETA</Text>
              <Text className="font-JakartaBold">{timeRemaining}</Text>
            </View>
          </View>
        </View>

        {/* Current Step */}
        {currentStep && (
          <View className="absolute bottom-32 left-4 right-4 bg-white rounded-lg p-4 shadow-lg">
            <Text className="font-JakartaBold text-lg mb-2">
              {currentStep.instruction}
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-secondary-600">{currentStep.distance}</Text>
              <Text className="text-secondary-600">{currentStep.duration}</Text>
            </View>
          </View>
        )}

        {/* Bottom Action Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <View className="flex-row p-4">
            <TouchableOpacity
              onPress={handleMessagePassenger}
              className="flex-1 bg-primary-500 rounded-lg py-3 items-center mr-2"
            >
              <Text className="text-white font-JakartaBold">
                💬 Message Passenger
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleArrived}
              className="flex-1 bg-success-500 rounded-lg py-3 items-center ml-2"
            >
              <Text className="text-white font-JakartaBold">✅ Arrived</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default GPSNavigationView;
