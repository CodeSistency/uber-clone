import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";

import { transportClient } from "@/app/services/flowClientService";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useLocationStore } from "@/store";
import GoogleTextInput from "@/components/GoogleTextInput";
import { icons } from "@/constants";

import FlowHeader from "../../../FlowHeader";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

const TransportDefinition: React.FC = () => {
  const { next, back, setRideId } = useMapFlow() as any;
  const { showError, withUI } = useUI();
  const locationStore = useLocationStore();

  // Estado para las ubicaciones seleccionadas
  const [originLocation, setOriginLocation] = useState<LocationData | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LocationData | null>(null);

  // Usar ubicación actual como origen por defecto
  useEffect(() => {
    if (locationStore.userLatitude && locationStore.userLongitude) {
      setOriginLocation({
        latitude: locationStore.userLatitude,
        longitude: locationStore.userLongitude,
        address: locationStore.userAddress || "Tu ubicación actual",
      });
    }
  }, [locationStore.userLatitude, locationStore.userLongitude, locationStore.userAddress]);

  const handleOriginSelect = (locationData: LocationData) => {
    console.log("[TransportDefinition] Origin selected:", locationData);
    setOriginLocation(locationData);
  };

  const handleDestinationSelect = (locationData: LocationData) => {
    console.log("[TransportDefinition] Destination selected:", locationData);
    setDestinationLocation(locationData);
  };

  const handleContinue = async () => {
    // Validar que tenemos origen y destino
    if (!originLocation) {
      showError("Error", "Por favor selecciona el origen del viaje");
      return;
    }

    if (!destinationLocation) {
      showError("Error", "Por favor selecciona el destino del viaje");
      return;
    }

    const payload = {
      originAddress: originLocation.address,
      originLat: originLocation.latitude,
      originLng: originLocation.longitude,
      destinationAddress: destinationLocation.address,
      destinationLat: destinationLocation.latitude,
      destinationLng: destinationLocation.longitude,
      minutes: 25, // TODO: Calcular tiempo real basado en distancia
      tierId: 1,
      vehicleTypeId: 1,
    };

    console.log("[TransportDefinition] Creating ride with payload:", payload);

    const res = await withUI(() => transportClient.defineRide(payload), {
      loadingMessage: "Creando viaje...",
    });

    const rideId = res?.data?.rideId || res?.rideId;
    if (rideId) {
      setRideId(rideId);
      next();
    }
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Definir Viaje" onBack={back} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Origen */}
        <View className="px-5 mb-4">
          <Text className="font-JakartaMedium text-sm text-gray-600 mb-2">
            Origen
          </Text>
          <GoogleTextInput
            icon={icons.point}
            initialLocation={originLocation?.address || "Tu ubicación actual"}
            containerStyle="mb-3"
            handlePress={handleOriginSelect}
          />
        </View>

        {/* Destino */}
        <View className="px-5 mb-4">
          <Text className="font-JakartaMedium text-sm text-gray-600 mb-2">
            Destino
          </Text>
          <GoogleTextInput
            icon={icons.target}
            initialLocation={destinationLocation?.address || "Selecciona destino"}
            containerStyle="mb-3"
            handlePress={handleDestinationSelect}
          />
        </View>

        {/* Viajes recientes */}
        <View className="px-5 mb-4">
          <Text className="font-JakartaBold text-sm text-gray-700 mb-2">
            Viajes recientes
          </Text>
          <TouchableOpacity className="flex-row items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Text className="text-lg mr-2">🏠</Text>
            <View className="flex-1">
              <Text className="font-JakartaMedium text-gray-800 dark:text-white">
                Casa
              </Text>
              <Text className="font-Jakarta text-xs text-gray-500 dark:text-gray-400">
                Calle Principal 123
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Espacio extra para evitar que el botón quede pegado al borde */}
        <View className="h-4" />

        {/* Botón Continuar */}
        <View className="px-5 pb-5">
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!originLocation || !destinationLocation}
            className={`rounded-lg p-4 ${
              originLocation && destinationLocation
                ? "bg-primary-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <Text className="text-white font-JakartaBold text-center">
              {originLocation && destinationLocation ? "Continuar" : "Selecciona origen y destino"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default TransportDefinition;
