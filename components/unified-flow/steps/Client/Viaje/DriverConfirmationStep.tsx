import React, { useState } from "react";
import { View, Text } from "react-native";

import {
  driverMatchingService,
  MatchingRequest,
} from "@/app/services/driverMatchingService";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useLocationStore } from "@/store";

import FlowHeader from "../../../FlowHeader";

import DriverConfirmationModal from "./DriverConfirmationModal";

const DriverConfirmationStep: React.FC = () => {
  const {
    matchedDriver,
    next,
    startMatching,
    clearMatchedDriver,
    selectedTierId,
    selectedVehicleTypeId,
    rideId,
  } = useMapFlow() as any;

  const { showError, showSuccess } = useUI();
  const locationStore = useLocationStore();
  const [modalVisible, setModalVisible] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      console.log(
        "[DriverConfirmationStep] Driver confirmed, waiting for acceptance",
      );
      showSuccess("Conductor confirmado", "Esperando aceptación del conductor");

      // Cerrar modal y continuar
      setModalVisible(false);
      setTimeout(() => {
        next(); // Ir a ESPERANDO_ACEPTACION
      }, 500);
    } catch (error) {
      console.error("[DriverConfirmationStep] Error confirming driver:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleFindAnother = async () => {
    console.log("[DriverConfirmationStep] Finding another driver");

    if (
      !selectedTierId ||
      !locationStore.userLatitude ||
      !locationStore.userLongitude
    ) {
      showError("Error", "No se pueden buscar conductores en este momento");
      return;
    }

    try {
      // Limpiar conductor actual
      clearMatchedDriver();

      // Cerrar modal
      setModalVisible(false);

      // Crear request para buscar otro conductor
      const matchingRequest: MatchingRequest = {
        lat: locationStore.userLatitude,
        lng: locationStore.userLongitude,
        tierId: selectedTierId,
        vehicleTypeId: selectedVehicleTypeId || 1,
        radiusKm: 5,
      };

      showSuccess("Buscando otro conductor", "Un momento por favor...");

      // Buscar otro conductor
      const response =
        await driverMatchingService.findAnotherDriver(matchingRequest);

      if (response.success && response.driver) {
        console.log(
          "[DriverConfirmationStep] Another driver found:",
          response.driver,
        );

        // Reiniciar búsqueda con el nuevo conductor
        startMatching();
        setTimeout(() => {
          next(); // Volver a BUSCANDO_CONDUCTOR que encontrará al nuevo conductor
        }, 500);
      } else {
        showError(
          "Sin conductores disponibles",
          "No se encontraron más conductores disponibles",
        );
        // Volver atrás para que el usuario cambie opciones
        setTimeout(() => {
          clearMatchedDriver();
          // Aquí podríamos ir a una pantalla de "cambiar opciones" en lugar de back()
        }, 2000);
      }
    } catch (error: any) {
      console.error(
        "[DriverConfirmationStep] Error finding another driver:",
        error,
      );
      showError("Error", error.message || "Error al buscar otro conductor");
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    // Quizás volver atrás o algo similar
  };

  return (
    <View className="flex-1">
      <FlowHeader
        title="Conductor encontrado"
        subtitle="Revisa los detalles y confirma tu conductor"
      />

      {/* Modal de confirmación */}
      <DriverConfirmationModal
        visible={modalVisible}
        driver={matchedDriver}
        onConfirm={handleConfirm}
        onFindAnother={handleFindAnother}
        onClose={handleClose}
        isConfirming={isConfirming}
      />

      {/* Fallback si no hay conductor */}
      {!matchedDriver && (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-6xl mb-6">⚠️</Text>
          <Text className="font-JakartaBold text-xl text-gray-800 mb-3 text-center">
            No hay conductor disponible
          </Text>
          <Text className="font-Jakarta text-base text-gray-600 text-center">
            No se pudo encontrar un conductor. Por favor intenta nuevamente.
          </Text>
        </View>
      )}
    </View>
  );
};

export default DriverConfirmationStep;
