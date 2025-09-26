import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

import { transportClient } from "@/app/services/flowClientService";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { RideType } from "@/lib/unified-flow/constants";
import { useVehicleTiersStore } from "@/store";

import FlowHeader from "../../../FlowHeader";

const VEHICLE_TYPES = [
  {
    id: "car",
    name: "Carro",
    icon: "🚗",
    options: [
      { id: "basic", name: "Básico", price: "$5.000", time: "5 min" },
      { id: "premium", name: "Premium", price: "$8.000", time: "3 min" },
      { id: "xl", name: "XL", price: "$12.000", time: "4 min" },
    ],
  },
  {
    id: "motorcycle",
    name: "Moto",
    icon: "🏍️",
    options: [
      { id: "standard", name: "Estándar", price: "$3.000", time: "8 min" },
      { id: "express", name: "Express", price: "$4.500", time: "5 min" },
    ],
  },
];

const TransportVehicleSelection: React.FC = () => {
  const {
    next,
    back,
    setRideId,
    confirmedOrigin,
    confirmedDestination,
    rideType,
    phoneNumber,
    setSelectedTierId,
    setSelectedVehicleTypeId,
  } = useMapFlow() as any;
  const { withUI, showError } = useUI();
  const {
    tiers,
    loading: tiersLoading,
    error: tiersError,
    fetchTiers,
  } = useVehicleTiersStore();
  const [selectedTab, setSelectedTab] = useState<"car" | "motorcycle">("car");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  // Tiers should be pre-loaded when transport service starts
  // But if we don't have valid tiers, try to fetch them now
  React.useEffect(() => {
    const ensureTiersLoaded = async () => {
      const hasValidTiers =
        tiers &&
        ((tiers.car && tiers.car.length > 0) ||
          (tiers.motorcycle && tiers.motorcycle.length > 0));

      if (!hasValidTiers && !tiersLoading) {
        console.log(
          "[TransportVehicleSelection] No valid tiers found, forcing refresh from API",
        );
        await fetchTiers();
      }
    };

    ensureTiersLoaded();
  }, [tiers, tiersLoading, fetchTiers]);

  // Get current tiers for the selected tab
  const currentTiers = tiers ? tiers[selectedTab] || [] : [];
  console.log("[TransportVehicleSelection] Selected tab:", selectedTab);
  console.log("[TransportVehicleSelection] Available tiers:", tiers);
  console.log(
    "[TransportVehicleSelection] Current tiers for selected tab:",
    currentTiers,
  );
  console.log(
    "[TransportVehicleSelection] Current tiers length:",
    currentTiers.length,
  );

  const handleContinue = async () => {
    if (!selectedVehicle) return;

    if (!confirmedOrigin || !confirmedDestination) {
      showError("Error", "Faltan ubicaciones confirmadas");
      return;
    }

    setIsProcessing(true);

    try {
      const selectedTierId = parseInt(selectedVehicle);
      const selectedTier = currentTiers.find(
        (tier) => tier.id === selectedTierId,
      );

      if (!selectedTier) {
        showError("Error", "Tier seleccionado no encontrado");
        return;
      }

      // Prepare data for API call (following the exact specification)
      const rideData = {
        originAddress: confirmedOrigin.address,
        originLat: confirmedOrigin.latitude,
        originLng: confirmedOrigin.longitude,
        destinationAddress: confirmedDestination.address,
        destinationLat: confirmedDestination.latitude,
        destinationLng: confirmedDestination.longitude,
        minutes: 25, // TODO: Calculate based on actual distance/time
        tierId: selectedTierId,
      };

      console.log(
        "[TransportVehicleSelection] Creating ride with data:",
        rideData,
      );

      // Call API directly without withUI wrapper to handle response properly
      const result = await transportClient.defineRideFlow(rideData);
      console.log("[TransportVehicleSelection] API response:", result);

      // Handle backend response structure: { data: { data: {...} }, message, statusCode, ... }
      if (result && result.data && result.data.data) {
        const rideInfo = result.data.data;
        console.log(
          "[TransportVehicleSelection] Ride created successfully:",
          rideInfo,
        );

        // Extract rideId from response (adjust based on actual structure)
        const rideId = rideInfo.id || rideInfo.rideId || rideInfo._id;
        if (rideId) {
          setRideId(rideId);
          console.log("[TransportVehicleSelection] Ride ID set:", rideId);

          // Guardar configuración del viaje en el store para el matching
          setSelectedTierId(selectedTierId);
          setSelectedVehicleTypeId(selectedTab === "car" ? 1 : 2); // 1=car, 2=motorcycle

          console.log(
            "[TransportVehicleSelection] Saved tier and vehicle type for matching:",
            {
              tierId: selectedTierId,
              vehicleTypeId: selectedTab === "car" ? 1 : 2,
            },
          );

          console.log(
            "[TransportVehicleSelection] Navigating to payment methodology",
          );
          next(); // Ahora irá a METODOLOGIA_PAGO según el SERVICE_FLOWS
        } else {
          console.warn(
            "[TransportVehicleSelection] No rideId found in response",
          );
          showError("Error", "Viaje creado pero no se pudo obtener el ID");
        }
      } else {
        console.error(
          "[TransportVehicleSelection] Unexpected response structure:",
          result,
        );
        showError("Error", "Respuesta del servidor inesperada");
      }
    } catch (error: any) {
      console.error("[TransportVehicleSelection] Error creating ride:", error);
      showError("Error", error.message || "Error al crear el viaje");
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading if tiers are still loading
  if (tiersLoading) {
    return (
      <View className="flex-1">
        <FlowHeader title="Seleccionar Vehículo" onBack={back} />
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg font-JakartaMedium text-gray-600 mb-4">
            Cargando opciones de vehículo...
          </Text>
          <View className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </View>
      </View>
    );
  }

  // Show error if tiers failed to load
  if (tiersError) {
    return (
      <View className="flex-1">
        <FlowHeader title="Seleccionar Vehículo" onBack={back} />
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-lg font-JakartaMedium text-red-600 mb-4 text-center">
            Error al cargar opciones de vehículo
          </Text>
          <Text className="text-sm font-Jakarta text-gray-500 mb-4 text-center">
            {tiersError}
          </Text>
        </View>
      </View>
    );
  }

  console.log("[TransportVehicleSelection] RENDER - Component state:", {
    tiers,
    tiersLoading,
    tiersError,
    selectedTab,
    currentTiers,
    currentTiersLength: currentTiers.length,
  });

  return (
    <View className="flex-1">
      <FlowHeader title="Seleccionar Vehículo" onBack={back} />

      {/* Tabs - Use available vehicle types from tiers */}
      <View className="flex-row mb-4 bg-gray-100 rounded-lg p-1">
        {tiers &&
          Object.keys(tiers).map((vehicleType) => {
            const isActive = selectedTab === vehicleType;
            const tierCount =
              tiers[vehicleType as keyof typeof tiers]?.length || 0;
            const vehicleTypeName =
              vehicleType === "car" ? "🚗 Carro" : "🏍️ Moto";

            console.log(`[TransportVehicleSelection] Tab ${vehicleType}:`, {
              vehicleType,
              isActive,
              tierCount,
              tiersForType: tiers[vehicleType as keyof typeof tiers],
              vehicleTypeName,
            });

            return (
              <TouchableOpacity
                key={vehicleType}
                onPress={() => {
                  console.log(
                    `[TransportVehicleSelection] Switching to tab: ${vehicleType}`,
                  );
                  setSelectedTab(vehicleType as "car" | "motorcycle");
                }}
                className={`flex-1 py-2 px-4 rounded-md ${
                  isActive ? "bg-white shadow-sm" : ""
                }`}
                activeOpacity={0.7}
              >
                <Text className="text-center font-JakartaMedium">
                  {vehicleTypeName} ({tierCount})
                </Text>
              </TouchableOpacity>
            );
          })}
      </View>

      {/* Vehicle Options - Display tiers from API */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pb-4">
          {currentTiers.length > 0 ? (
            currentTiers.map((tier) => (
              <TouchableOpacity
                key={tier.id}
                onPress={() => setSelectedVehicle(tier.id.toString())}
                className={`bg-white rounded-xl p-4 shadow-sm border-2 mb-3 ${
                  selectedVehicle === tier.id.toString()
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-100"
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-2xl mr-3">
                      {tier.vehicleTypeIcon}
                    </Text>
                    <View className="flex-1">
                      <Text className="font-JakartaBold text-lg text-gray-800">
                        {tier.name}
                      </Text>
                      <Text className="font-Jakarta text-sm text-gray-600">
                        Base: ${Number(tier.baseFare).toFixed(2)} • Minuto: $
                        {Number(tier.perMinuteRate).toFixed(2)} • Km: $
                        {Number(tier.perMileRate).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-JakartaBold text-xl text-primary-600">
                      ${Number(tier.baseFare).toFixed(2)}
                    </Text>
                    <Text className="font-Jakarta text-xs text-gray-500">
                      Base
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500 font-Jakarta text-center">
                No hay opciones disponibles para este tipo de vehículo
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handleContinue}
        disabled={!selectedVehicle || isProcessing}
        className={`rounded-lg p-4 mt-4 ${
          selectedVehicle && !isProcessing ? "bg-primary-500" : "bg-gray-300"
        }`}
      >
        <Text className="text-white font-JakartaBold text-center">
          {isProcessing ? "Creando viaje..." : "Continuar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TransportVehicleSelection;
