import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { transportClient } from "@/app/services/flowClientService";
import { calculateRouteDistance } from "@/app/services/googleMapsService";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { RideType } from "@/lib/unified-flow/constants";
import { useVehicleTiersStore } from "@/store";

import FlowHeader from "../../../FlowHeader";
import SelectorHorizontalServicios from "@/components/unified-flow/transport/SelectorHorizontalServicios";

const TransportVehicleSelection: React.FC = () => {
  const mapFlow = useMapFlow() as any;
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
    setEstimatedPrice,
    setRouteInfo,
    setPriceBreakdown,
  } = mapFlow;
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

      console.log("[TransportVehicleSelection] Selected tier:", selectedTier);
      console.log("[TransportVehicleSelection] Store functions available:", {
        setEstimatedPrice: !!setEstimatedPrice,
        setRouteInfo: !!setRouteInfo,
        setPriceBreakdown: !!setPriceBreakdown,
      });

      // 🆕 PASO 1: Calcular distancia y tiempo real con Google Maps
      console.log("[TransportVehicleSelection] Calculating route with Google Maps...");
      const routeCalculation = await calculateRouteDistance(
        {
          lat: confirmedOrigin.latitude,
          lng: confirmedOrigin.longitude,
        },
        {
          lat: confirmedDestination.latitude,
          lng: confirmedDestination.longitude,
        },
      );

      console.log("[TransportVehicleSelection] Route calculated:", routeCalculation);

      // 🆕 PASO 2: Preparar datos para crear el ride
      // El backend calculará el precio automáticamente
      console.log("[TransportVehicleSelection] Preparing ride data for backend calculation...");

      // Prepare data for API call
      const rideData = {
        originAddress: confirmedOrigin.address,
        originLat: confirmedOrigin.latitude,
        originLng: confirmedOrigin.longitude,
        destinationAddress: confirmedDestination.address,
        destinationLat: confirmedDestination.latitude,
        destinationLng: confirmedDestination.longitude,
        minutes: routeCalculation.durationMinutes, // ✅ Ahora usa tiempo real
        tierId: selectedTierId,
        vehicleTypeId: selectedTier.vehicleTypeId,
      };

      console.log(
        "[TransportVehicleSelection] Creating ride with real data:",
        rideData,
      );

      // Call API to create ride (backend will calculate price)
      const result = await transportClient.defineRideFlow(rideData);
      console.log("[TransportVehicleSelection] API response:", result);

      // Handle backend response structure: { data: { data: {...} }, message, statusCode, ... }
      if (result && result.data && result.data.data) {
        const rideInfo = result.data.data;
        console.log(
          "[TransportVehicleSelection] Ride created successfully:",
          rideInfo,
        );

        // Extract rideId and farePrice from response
        const rideId = rideInfo.id || rideInfo.rideId || rideInfo._id;
        const farePrice = parseFloat(rideInfo.farePrice) || 0;

        if (rideId) {
          setRideId(rideId);
          console.log("[TransportVehicleSelection] Ride ID set:", rideId);
          console.log("[TransportVehicleSelection] Backend calculated farePrice:", farePrice);

          // 🆕 PASO 3: Guardar el precio calculado por el backend
          setSelectedTierId(selectedTierId);
          setSelectedVehicleTypeId(selectedTier.vehicleTypeId);
          setEstimatedPrice(farePrice);

          // Guardar información de ruta
          setRouteInfo({
            distanceMiles: routeCalculation.distanceMiles,
            durationMinutes: routeCalculation.durationMinutes,
            originAddress: confirmedOrigin.address,
            destinationAddress: confirmedDestination.address,
          });

          console.log("[TransportVehicleSelection] Store updated with backend data:", {
            estimatedPrice: farePrice,
            rideId: rideId,
            selectedTierId: selectedTierId,
          });

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

          next(); // Navegar a METODOLOGIA_PAGO
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
      {currentTiers.length > 0 ? (
        <SelectorHorizontalServicios
          data={currentTiers}
          selectedId={selectedVehicle ? Number(selectedVehicle) : null}
          onSelect={(id) => setSelectedVehicle(id.toString())}
          renderName={(tier) => tier.name}
          renderVehicleTypeName={(tier) => tier.vehicleTypeName}
          renderIcon={(tier) =>
            tier.vehicleTypeIcon || (selectedTab === "car" ? "🚗" : "🏍️")
          }
          renderBaseFare={(tier) => Number(tier.baseFare)}
          renderPerMinuteRate={(tier) => Number(tier.perMinuteRate)}
          renderPerMileRate={(tier) => Number(tier.perMileRate)}
          renderRating={(tier) => {
            const rating = (tier as any)?.rating;
            return typeof rating === "number" ? rating : undefined;
          }}
        />
      ) : (
        <View className="items-center justify-center py-10">
          <Text className="text-gray-500 font-Jakarta text-center">
            No hay opciones disponibles para este tipo de vehículo
          </Text>
        </View>
      )}

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
