import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";

import { Button, TextField, Card } from "@/components/ui";
import GoogleTextInput from "@/components/GoogleTextInput";
import { useUI } from "@/components/UIWrapper";
import { icons } from "@/constants";
import { useMapFlow } from "@/hooks/useMapFlow";
import { RideType, FLOW_STEPS } from "@/lib/unified-flow/constants";
import { useLocationStore } from "@/store";

import FlowHeader from "../../../FlowHeader";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

const TransportDefinition: React.FC = () => {
  const {
    next,
    back,
    goTo,
    setRideType,
    setPhoneNumber,
    setConfirmedOrigin,
    setConfirmedDestination,
  } = useMapFlow() as any;
  const { showError } = useUI();
  const locationStore = useLocationStore();

  // Estado para el tipo de viaje y teléfono
  const [rideType, setRideTypeLocal] = useState<RideType>(RideType.NORMAL);
  const [phoneNumber, setPhoneNumberLocal] = useState("");

  // Función de back personalizada que va a selección de servicio cuando no hay historial
  const handleBack = () => {
    // Intentar back normal primero
    try {
      back();
    } catch (error) {
      // Si falla (no hay historial), ir a selección de servicio
      console.log("[TransportDefinition] No history available, going to service selection");
      goTo(FLOW_STEPS.SELECCION_SERVICIO);
    }
  };

  // Estado para las ubicaciones seleccionadas
  const [originLocation, setOriginLocation] = useState<LocationData | null>(
    null,
  );
  const [destinationLocation, setDestinationLocation] =
    useState<LocationData | null>(null);

  // Usar ubicación actual como origen por defecto
  useEffect(() => {
    if (locationStore.userLatitude && locationStore.userLongitude) {
      setOriginLocation({
        latitude: locationStore.userLatitude,
        longitude: locationStore.userLongitude,
        address: locationStore.userAddress || "Tu ubicación actual",
      });
    }
  }, [
    locationStore.userLatitude,
    locationStore.userLongitude,
    locationStore.userAddress,
  ]);

  const handleOriginSelect = (locationData: LocationData) => {
    console.log("[TransportDefinition] Origin selected:", locationData);
    setOriginLocation(locationData);
  };

  const handleDestinationSelect = (locationData: LocationData) => {
    console.log("[TransportDefinition] Destination selected:", locationData);
    setDestinationLocation(locationData);
  };

  const handleContinue = () => {
    // Validar que tenemos origen y destino
    if (!originLocation) {
      showError("Error", "Por favor selecciona el origen del viaje");
      return;
    }

    if (!destinationLocation) {
      showError("Error", "Por favor selecciona el destino del viaje");
      return;
    }

    // Validar teléfono si es "viajar otro"
    if (rideType === RideType.FOR_OTHER) {
      if (!phoneNumber.trim()) {
        showError(
          "Error",
          "Por favor ingresa el número telefónico del pasajero",
        );
        return;
      }
    }

    // Guardar estado en el store
    setRideType(rideType);

    if (rideType === RideType.FOR_OTHER) {
      setPhoneNumber(phoneNumber.trim());
    }

    // Guardar ubicaciones iniciales para que estén disponibles en los pasos de confirmación
    console.log("[TransportDefinition] About to save locations:");
    console.log("[TransportDefinition] originLocation:", originLocation);
    console.log(
      "[TransportDefinition] destinationLocation:",
      destinationLocation,
    );

    if (originLocation) {
      setConfirmedOrigin(originLocation);
      console.log(
        "[TransportDefinition] Origin saved to store:",
        originLocation,
      );
    }
    if (destinationLocation) {
      setConfirmedDestination(destinationLocation);
      console.log(
        "[TransportDefinition] Destination saved to store:",
        destinationLocation,
      );
    }

    console.log("[TransportDefinition] Ride type selected:", rideType);
    console.log("[TransportDefinition] Navigating to next step");

    next(); // Navegará condicionalmente según rideType
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Definir Viaje" onBack={handleBack} />

      {/* Tabs para tipo de viaje */}
      <View className="flex-row mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mx-5">
        <Button
          variant={rideType === RideType.NORMAL ? "primary" : "ghost"}
          title="Viajar"
          onPress={() => setRideTypeLocal(RideType.NORMAL)}
          className={`flex-1 py-3 px-4 rounded-md ${
            rideType === RideType.NORMAL ? "" : "bg-transparent"
          }`}
        />
        <Button
          variant={rideType === RideType.FOR_OTHER ? "primary" : "ghost"}
          title="Viajar otro"
          onPress={() => setRideTypeLocal(RideType.FOR_OTHER)}
          className={`flex-1 py-3 px-4 rounded-md ${
            rideType === RideType.FOR_OTHER ? "" : "bg-transparent"
          }`}
        />
      </View>

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
            initialLocation={
              destinationLocation?.address || "Selecciona destino"
            }
            containerStyle="mb-3"
            handlePress={handleDestinationSelect}
          />
        </View>

        {/* Teléfono para "Viajar otro" */}
        {rideType === RideType.FOR_OTHER && (
          <View className="px-5 mb-4">
            <TextField
              label="Teléfono del pasajero"
              value={phoneNumber}
              onChangeText={setPhoneNumberLocal}
              placeholder="Ingresa el número telefónico"
              keyboardType="phone-pad"
              className="bg-white dark:bg-gray-800"
            />
          </View>
        )}

        {/* Viajes recientes */}
        <View className="px-5 mb-4">
          <Text className="font-JakartaBold text-sm text-gray-700 mb-2">
            Viajes recientes
          </Text>
          <Card className="bg-gray-50 dark:bg-gray-800">
            <View className="flex-row items-center">
              <Text className="text-lg mr-2">🏠</Text>
              <View className="flex-1">
                <Text className="font-JakartaMedium text-gray-800 dark:text-white">
                  Casa
                </Text>
                <Text className="font-Jakarta text-xs text-gray-500 dark:text-gray-400">
                  Calle Principal 123
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Espacio extra para evitar que el botón quede pegado al borde */}
        <View className="h-4" />

        {/* Botón Continuar */}
        <View className="px-5 pb-5">
          <Button
            variant={
              originLocation &&
              destinationLocation &&
              (rideType === RideType.NORMAL || phoneNumber.trim())
                ? "primary"
                : "secondary"
            }
            title={
              originLocation &&
              destinationLocation &&
              (rideType === RideType.NORMAL || phoneNumber.trim())
                ? "Continuar"
                : rideType === RideType.FOR_OTHER && !phoneNumber.trim()
                  ? "Ingresa el teléfono del pasajero"
                  : "Selecciona origen y destino"
            }
            onPress={handleContinue}
            disabled={
              !originLocation ||
              !destinationLocation ||
              (rideType === RideType.FOR_OTHER && !phoneNumber.trim())
            }
            className="rounded-lg p-4"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default TransportDefinition;
