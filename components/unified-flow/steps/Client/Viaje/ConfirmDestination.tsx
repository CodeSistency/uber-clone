import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

import { useMapFlow } from "@/hooks/useMapFlow";
import TripSummaryHeader from "./TripSummaryHeader";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface ConfirmDestinationProps {
  onConfirm: (confirmedLocation: LocationData) => void;
  onBack: (confirmedLocation?: LocationData) => void;
}

const ConfirmDestination: React.FC<ConfirmDestinationProps> = ({
  onConfirm,
  onBack
}) => {
  const { setConfirmedDestination, next, back, confirmedDestination, confirmedOrigin } = useMapFlow() as any;

  // Usar la ubicación guardada en el store, o una por defecto si no existe
  const initialLocation = confirmedDestination || {
    latitude: 6.2518,
    longitude: -75.5636,
    address: "Medellín, Colombia"
  };
  const [mapCenter, setMapCenter] = useState({
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
  });
  const [currentAddress, setCurrentAddress] = useState(initialLocation.address);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Reverse geocoding function
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      // For now, return a mock address. In production, use Google Maps reverse geocoding
      return `Ubicación aproximada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return `Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }, []);

  // Handle map region change (when user drags the map)
  const handleRegionChangeComplete = useCallback(async (region: Region) => {
    const newCenter = {
      latitude: region.latitude,
      longitude: region.longitude,
    };

    setMapCenter(newCenter);
    setIsLoadingAddress(true);

    try {
      const address = await reverseGeocode(newCenter.latitude, newCenter.longitude);
      setCurrentAddress(address);
    } catch (error) {
      console.warn('Failed to get address for new location');
    } finally {
      setIsLoadingAddress(false);
    }
  }, [reverseGeocode]);

  const handleConfirm = () => {
    const confirmedLocation: LocationData = {
      latitude: mapCenter.latitude,
      longitude: mapCenter.longitude,
      address: currentAddress,
    };

    // Save confirmed destination to store
    setConfirmedDestination(confirmedLocation);

    console.log('[ConfirmDestination] Destination confirmed:', confirmedLocation);
    onConfirm(confirmedLocation);

    // Navigate to next step (vehicle selection)
    next();
  };

  const handleBack = () => {
    // Call the callback with current location if needed
    onBack({
      latitude: mapCenter.latitude,
      longitude: mapCenter.longitude,
      address: currentAddress,
    });

    // Navigate back
    back();
  };

  const initialRegion = {
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View className="flex-1 relative">
      {/* Map Container - Full Screen */}
      <View className="flex-1">
        <MapView
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={true}
          showsMyLocationButton={true}
          zoomEnabled={true}
          scrollEnabled={true}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {/* Marker fixed at center representing confirmed location */}
          <Marker
            coordinate={mapCenter}
            title="Destino Confirmado"
            description={currentAddress}
            pinColor="green"
          />
        </MapView>

        {/* Center pin indicator */}
        <View className="absolute top-1/2 left-1/2 transform -translate-x-3 -translate-y-6 z-10 pointer-events-none">
          <View className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg">
            <View className="absolute top-1/2 left-1/2 transform -translate-x-1 -translate-y-1 w-1 h-1 bg-white rounded-full" />
          </View>
          <View className="absolute top-6 left-1/2 transform -translate-x-0.5 w-0.5 h-4 bg-green-500" />
        </View>
      </View>

      {/* Trip Summary Header */}
      <TripSummaryHeader
        origin={confirmedOrigin}
        destination={{
          latitude: mapCenter.latitude,
          longitude: mapCenter.longitude,
          address: currentAddress
        }}
        onBack={handleBack}
      />

      {/* Bottom Fixed Button */}
      <View className="absolute bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <View className="p-4">
          {/* Address Info */}
          <View className="mb-3">
            <Text className="font-JakartaBold text-base text-gray-800 dark:text-white mb-1">
              Ubicación seleccionada
            </Text>
            <Text className="font-Jakarta text-sm text-gray-600 dark:text-gray-300">
              {isLoadingAddress ? "Actualizando dirección..." : currentAddress}
            </Text>
          </View>

          {/* Instruction */}
          <Text className="font-Jakarta text-xs text-gray-500 dark:text-gray-400 mb-4">
            Mueve el mapa para ajustar la ubicación exacta del destino
          </Text>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            className="bg-primary-500 rounded-lg p-4 shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-JakartaBold text-center">
              Confirmar Destino
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Safe area padding for bottom button */}
      <View className="h-32" />
    </View>
  );
};

export default ConfirmDestination;
