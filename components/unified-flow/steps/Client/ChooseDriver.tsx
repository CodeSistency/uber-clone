import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Image } from "react-native";

import { transportClient } from "@/app/services/flowClientService";
import { useLocationStore } from "@/store";
import DriverCard from "@/components/DriverCard";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useDriverStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";
import { MarkerData } from "@/types/type";

import FlowHeader from "../../FlowHeader";

const ChooseDriver: React.FC = () => {
  const { back, goTo, rideId } = useMapFlow() as any;
  const { withUI, showSuccess, showError } = useUI();
  const { drivers, selectedDriver, setSelectedDriver, setDrivers } = useDriverStore();
  const { userLatitude, userLongitude } = useLocationStore();

  // Estados para manejar la espera de aceptación del conductor
  const [isWaitingForAcceptance, setIsWaitingForAcceptance] = React.useState(false);
  const [waitingTime, setWaitingTime] = React.useState(0);

  // Estados para el modal de detalle del conductor
  const [showDriverModal, setShowDriverModal] = React.useState(false);
  const [selectedDriverForModal, setSelectedDriverForModal] = React.useState<MarkerData | null>(null);

  // Estado para loading de drivers
  const [isLoadingDrivers, setIsLoadingDrivers] = React.useState(false);

  // Configuración para simular conductores antes de buscar o buscar directamente
  const [simulateBeforeSearch, setSimulateBeforeSearch] = React.useState(false);

  // Función para cargar drivers cercanos
  const loadNearbyDrivers = React.useCallback(async () => {
    if (!userLatitude || !userLongitude) return;

    setIsLoadingDrivers(true);
    try {
      if (simulateBeforeSearch) {
        console.log("[ChooseDriver] Simulating drivers before search");

        // Primero simular conductores en el backend
        await (transportClient as any).simulateDriverLocations({
          centerLat: userLatitude,
          centerLng: userLongitude,
          radiusKm: 5,
          driverCount: 15,
          vehicleTypeIds: [1, 2], // Cars and motorcycles
        });
      }

      console.log("[ChooseDriver] Searching for nearby drivers");

      // Siempre usar el mismo endpoint de búsqueda
      const response = await (transportClient as any).getNearbyDrivers({
        lat: userLatitude,
        lng: userLongitude,
        radius: 5,
        ...(simulateBeforeSearch ? {} : { tierId: 1, vehicleTypeId: 1 }), // Solo filtros cuando no simulamos
      });

      if (response?.data && Array.isArray(response.data)) {
        console.log(`[ChooseDriver] ${simulateBeforeSearch ? 'Simulated' : 'Nearby'} drivers loaded:`, response.data.length);

        const driverMarkers: MarkerData[] = response.data.map((driver: any) => ({
          id: driver.driverId,
          title: `${driver.firstName} ${driver.lastName}`,
          first_name: driver.firstName,
          last_name: driver.lastName,
          profile_image_url: driver.profileImageUrl,
          car_image_url: "",
          car_seats: driver.carSeats,
          rating: driver.rating,
          latitude: userLatitude + (Math.random() - 0.5) * 0.01,
          longitude: userLongitude + (Math.random() - 0.5) * 0.01,
          time: driver.estimatedArrival,
          price: `$${(Math.random() * 5 + 10).toFixed(2)}`,
        }));

        setDrivers(driverMarkers);
      } else {
        console.log("[ChooseDriver] No drivers found");
        setDrivers([]);
      }
    } catch (error) {
      console.error("[ChooseDriver] Error loading drivers:", error);
      showError("Error", `No se pudieron cargar los conductores ${simulateBeforeSearch ? '(con simulación)' : '(búsqueda directa)'}`);
      setDrivers([]);
    } finally {
      setIsLoadingDrivers(false);
    }
  }, [userLatitude, userLongitude, setDrivers, showError, simulateBeforeSearch]);

  // Función para manejar la selección de conductor
  const handleDriverSelection = async () => {
    if (!selectedDriver) return;

    const id = rideId || 101;

    try {
      await withUI(() => transportClient.requestDriver(id), {
        loadingMessage: "Solicitando conductor...",
      });

      // Iniciar espera de aceptación del conductor
      setIsWaitingForAcceptance(true);
      setWaitingTime(0);

      showSuccess("¡Solicitud enviada!", "Esperando respuesta del conductor...");
    } catch (error: any) {
      console.error("[ChooseDriver] Driver selection error:", error);
      showError("Error", error?.message || "Error al solicitar conductor");
    }
  };

  // Polling para esperar aceptación del conductor
  React.useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    if (isWaitingForAcceptance && rideId) {
      pollInterval = setInterval(async () => {
        try {
          setWaitingTime(prev => prev + 1);

          const response = await transportClient.getStatus(rideId);
          const status = response?.data?.status || response?.status;

          console.log("[ChooseDriver] Polling ride status:", status);

          if (status === "accepted") {
            // Conductor aceptó - continuar al siguiente paso
            setIsWaitingForAcceptance(false);
            if (pollInterval) clearInterval(pollInterval);
            showSuccess("¡Conductor confirmado!", "Procediendo con la reserva...");
            goTo(FLOW_STEPS.CUSTOMER_TRANSPORT.GESTION_CONFIRMACION);
          } else if (status === "cancelled") {
            // Conductor rechazó - volver atrás
            setIsWaitingForAcceptance(false);
            if (pollInterval) clearInterval(pollInterval);
            showError("Conductor no disponible", "El conductor no pudo aceptar tu solicitud. Por favor selecciona otro conductor.");
            // Reset selection to allow choosing another driver
            setSelectedDriver(null);
          } else if (status === "requested") {
            // Aún esperando - continuar polling
            console.log("[ChooseDriver] Still waiting for driver acceptance...");
          }
        } catch (error) {
          console.error("[ChooseDriver] Error polling ride status:", error);
          // Continue polling despite errors
        }
      }, 2000); // Poll cada 2 segundos
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isWaitingForAcceptance, rideId, goTo, showSuccess, showError, setSelectedDriver]);

  // Cargar drivers cuando tengamos ubicación o cambie el modo de búsqueda
  React.useEffect(() => {
    if (userLatitude && userLongitude && !isLoadingDrivers) {
      console.log("[ChooseDriver] Location available, loading nearby drivers");
      loadNearbyDrivers();
    }
  }, [userLatitude, userLongitude, isLoadingDrivers, loadNearbyDrivers, simulateBeforeSearch]);

  // Función para cancelar la espera
  const handleCancelWaiting = () => {
    setIsWaitingForAcceptance(false);
    setWaitingTime(0);
    setSelectedDriver(null);
  };

  // Funciones para el modal de detalle del conductor
  const openDriverModal = (driver: MarkerData) => {
    setSelectedDriverForModal(driver);
    setShowDriverModal(true);
  };

  const closeDriverModal = () => {
    setShowDriverModal(false);
    setSelectedDriverForModal(null);
  };

  // Función para manejar la selección desde el modal
  const handleSelectFromModal = async (driverId: number) => {
    setSelectedDriver(driverId);
    closeDriverModal();
    // Esperar un momento para que se vea el cambio visual
    setTimeout(() => {
      handleDriverSelection();
    }, 300);
  };

  // Componente Modal de Detalle del Conductor
  const DriverDetailModal = () => {
    if (!selectedDriverForModal) return null;

    const driver = selectedDriverForModal;
    const isSelected = selectedDriver === driver.id;

    return (
      <Modal
        visible={showDriverModal}
        transparent
        animationType="slide"
        onRequestClose={closeDriverModal}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl max-h-[90%]">
            {/* Header con botón cerrar */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white">
                Detalle del Conductor
              </Text>
              <TouchableOpacity
                onPress={closeDriverModal}
                className="w-8 h-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
              >
                <Text className="text-xl text-gray-600 dark:text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header Section */}
              <View className="px-6 py-4">
                <View className="items-center">
                  {/* Avatar */}
                  <View className="w-24 h-24 bg-primary-500 rounded-full items-center justify-center mb-4">
                    <Text className="text-3xl text-white font-JakartaBold">
                      {driver.first_name.charAt(0)}{driver.last_name.charAt(0)}
                    </Text>
                  </View>

                  {/* Nombre y Rating */}
                  <Text className="text-xl font-JakartaBold text-gray-800 dark:text-white mb-1">
                    {driver.first_name} {driver.last_name}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Text className="text-yellow-500 text-lg mr-1">⭐</Text>
                    <Text className="font-JakartaMedium text-gray-700 dark:text-gray-300">
                      {driver.rating} (Conductor verificado)
                    </Text>
                  </View>

                  {/* Estado de selección */}
                  <View className={`px-3 py-1 rounded-full ${isSelected ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    <Text className={`text-sm font-JakartaMedium ${isSelected ? 'text-primary-600' : 'text-gray-600'}`}>
                      {isSelected ? '● Conductor seleccionado' : '○ Disponible'}
                    </Text>
                  </View>
                </View>

                {/* Quick Stats */}
                <View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mt-4">
                  <View className="flex-row justify-between items-center">
                    <View className="items-center flex-1">
                      <Text className="text-2xl mb-1">⏱️</Text>
                      <Text className="font-JakartaBold text-gray-800 dark:text-white">
                        {driver.time || 5}
                      </Text>
                      <Text className="text-xs text-gray-600 dark:text-gray-400">min</Text>
                    </View>
                    <View className="items-center flex-1">
                      <Text className="text-2xl mb-1">💰</Text>
                      <Text className="font-JakartaBold text-gray-800 dark:text-white">
                        {driver.price || '$15.50'}
                      </Text>
                      <Text className="text-xs text-gray-600 dark:text-gray-400">base</Text>
                    </View>
                    <View className="items-center flex-1">
                      <Text className="text-2xl mb-1">🚗</Text>
                      <Text className="font-JakartaBold text-gray-800 dark:text-white">
                        {driver.car_seats}
                      </Text>
                      <Text className="text-xs text-gray-600 dark:text-gray-400">asientos</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Vehicle Information */}
              <View className="px-6 pb-4">
                <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white mb-3">
                  🚗 Información del Vehículo
                </Text>
                <View className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <View className="flex-row items-center mb-3">
                    <Text className="text-2xl mr-3">🚗</Text>
                    <View className="flex-1">
                      <Text className="font-JakartaBold text-gray-800 dark:text-white">
                        Modelo del vehículo
                      </Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">
                        Próximamente disponible
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between mb-3">
                    <View className="flex-1 mr-2">
                      <Text className="text-sm font-JakartaMedium text-gray-600 dark:text-gray-400 mb-1">
                        Color
                      </Text>
                      <Text className="text-sm text-gray-800 dark:text-white">—</Text>
                    </View>
                    <View className="flex-1 ml-2">
                      <Text className="text-sm font-JakartaMedium text-gray-600 dark:text-gray-400 mb-1">
                        Placa
                      </Text>
                      <Text className="text-sm text-gray-800 dark:text-white">—</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="text-green-500 mr-2">✅</Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">
                        Seguro activo
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-green-500 mr-2">✅</Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">
                        Verificado
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Performance Metrics */}
              <View className="px-6 pb-4">
                <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white mb-3">
                  📊 Estadísticas de Rendimiento
                </Text>
                <View className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <Text className="text-sm font-JakartaMedium text-gray-600 dark:text-gray-400 mb-3">
                    Estadísticas del mes
                  </Text>

                  <View className="space-y-3">
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-600 dark:text-gray-400">Viajes completados</Text>
                      <Text className="text-sm font-JakartaMedium text-gray-800 dark:text-white">—</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-600 dark:text-gray-400">Rating promedio</Text>
                      <Text className="text-sm font-JakartaMedium text-gray-800 dark:text-white">{driver.rating}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-600 dark:text-gray-400">Tasa de aceptación</Text>
                      <Text className="text-sm font-JakartaMedium text-gray-800 dark:text-white">—</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-gray-600 dark:text-gray-400">Tiempo promedio</Text>
                      <Text className="text-sm font-JakartaMedium text-gray-800 dark:text-white">—</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Service Area */}
              <View className="px-6 pb-4">
                <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white mb-3">
                  📍 Zona de Servicio
                </Text>
                <View className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Zona principal
                  </Text>
                  <Text className="text-sm font-JakartaMedium text-gray-800 dark:text-white mb-3">
                    Próximamente disponible
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Opera en: Próximamente disponible
                  </Text>
                </View>
              </View>

              {/* Recent Reviews */}
              <View className="px-6 pb-4">
                <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white mb-3">
                  💬 Reseñas Recientes
                </Text>
                <View className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Próximamente disponible
                  </Text>
                  <TouchableOpacity className="bg-gray-100 dark:bg-gray-600 rounded-lg py-2 px-4">
                    <Text className="text-sm font-JakartaMedium text-center text-gray-600 dark:text-gray-300">
                      Ver todas las reseñas
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Verification & Safety */}
              <View className="px-6 pb-4">
                <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white mb-3">
                  ✅ Verificación y Seguridad
                </Text>
                <View className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Próximamente disponible
                  </Text>

                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 mr-3">⏳</Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">Identidad verificada</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 mr-3">⏳</Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">Antecedentes penales</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 mr-3">⏳</Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">Licencia de conducir</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 mr-3">⏳</Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">Seguro obligatorio</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Contact & Preferences */}
              <View className="px-6 pb-6">
                <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white mb-3">
                  📞 Contacto y Preferencias
                </Text>
                <View className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Próximamente disponible
                  </Text>

                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 mr-3">📞</Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">Número de teléfono</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 mr-3">💬</Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">Idioma y preferencias</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 mr-3">🎵</Text>
                      <Text className="text-sm text-gray-600 dark:text-gray-400">Preferencias musicales</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="px-6 pb-6">
                <View className="space-y-3">
                  {/* Primary Action */}
                  <TouchableOpacity
                    onPress={() => handleSelectFromModal(driver.id)}
                    disabled={isWaitingForAcceptance}
                    className={`rounded-xl p-4 ${isSelected ? 'bg-green-500' : 'bg-primary-500'}`}
                  >
                    <Text className="text-white font-JakartaBold text-center">
                      {isSelected ? '✓ Conductor seleccionado' : 'Solicitar conductor'}
                    </Text>
                  </TouchableOpacity>

                  {/* Secondary Actions */}
                  <View className="flex-row space-x-3">
                    <TouchableOpacity className="flex-1 bg-gray-100 dark:bg-gray-600 rounded-lg py-3">
                      <Text className="text-center font-JakartaMedium text-gray-600 dark:text-gray-300">
                        📞 Llamar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-gray-100 dark:bg-gray-600 rounded-lg py-3">
                      <Text className="text-center font-JakartaMedium text-gray-600 dark:text-gray-300">
                        💬 Mensaje
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-gray-100 dark:bg-gray-600 rounded-lg py-3">
                      <Text className="text-center font-JakartaMedium text-gray-600 dark:text-gray-300">
                        ⭐ Calificar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Pantalla de espera de aceptación del conductor
  if (isWaitingForAcceptance) {
    return (
      <View className="flex-1">
        <FlowHeader
          title="Esperando conductor"
          subtitle="Hemos enviado tu solicitud al conductor seleccionado"
          onBack={() => {
            // Permitir cancelar la espera
            handleCancelWaiting();
          }}
        />

        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 w-full max-w-sm">
            {/* Loading Animation */}
            <View className="items-center mb-6">
              <ActivityIndicator size="large" color="#0286FF" />
              <View className="mt-4 space-y-1">
                {[...Array(3)].map((_, i) => (
                  <View
                    key={i}
                    className="w-2 h-2 bg-primary-500 rounded-full mx-1 animate-pulse"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1.5s'
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Status Message */}
            <Text className="text-xl font-JakartaBold text-center text-gray-800 dark:text-white mb-2">
              Esperando respuesta
            </Text>
            <Text className="text-base font-Jakarta text-center text-gray-600 dark:text-gray-300 mb-4">
              El conductor está revisando tu solicitud...
            </Text>

            {/* Waiting Time */}
            <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <Text className="text-sm font-JakartaMedium text-center text-gray-600 dark:text-gray-300">
                Tiempo de espera: {waitingTime}s
              </Text>
            </View>

            {/* Driver Info */}
            {selectedDriver && (() => {
              const driver = drivers.find(d => d.id === selectedDriver);
              if (driver) {
                return (
                  <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <Text className="font-JakartaBold text-blue-800 dark:text-blue-300 mb-1">
                      Conductor seleccionado:
                    </Text>
                    <Text className="font-JakartaMedium text-blue-700 dark:text-blue-400">
                      {driver.first_name} {driver.last_name}
                    </Text>
                    <Text className="font-Jakarta text-sm text-blue-600 dark:text-blue-500">
                      ⭐ {driver.rating || 4.5} • {driver.time ? `${driver.time} min` : "—"}
                    </Text>
                  </View>
                );
              }
              return null;
            })()}

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={handleCancelWaiting}
              className="mt-6 bg-gray-200 dark:bg-gray-600 rounded-lg p-3"
              activeOpacity={0.7}
            >
              <Text className="text-gray-700 dark:text-gray-300 font-JakartaMedium text-center">
                Cancelar solicitud
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Pantalla normal de selección de conductor
  return (
    <View className="flex-1">
      <FlowHeader
        title="Elige conductor"
        subtitle="Selecciona un conductor disponible en tu zona"
        onBack={back}
      />

      {/* Toggle para modo de datos */}
      <View className="flex-row items-center justify-between px-5 mb-2">
        <Text className="font-JakartaBold text-base text-gray-700">
        Conductores disponibles
      </Text>
        <View className="flex-row items-center bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => setSimulateBeforeSearch(false)}
            className={`px-3 py-1 rounded-md ${!simulateBeforeSearch ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-JakartaMedium ${!simulateBeforeSearch ? 'text-gray-800' : 'text-gray-600'}`}>
              Buscar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSimulateBeforeSearch(true)}
            className={`px-3 py-1 rounded-md ${simulateBeforeSearch ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-JakartaMedium ${simulateBeforeSearch ? 'text-gray-800' : 'text-gray-600'}`}>
              Simular
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ maxHeight: 300 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingDrivers ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#0286FF" />
            <Text className="text-gray-600 font-Jakarta mt-4 text-center">
              {simulateBeforeSearch ? 'Simulando y buscando conductores' : 'Buscando conductores cercanos'}...
            </Text>
            <Text className="text-gray-500 font-Jakarta text-sm text-center mt-2">
              Esto puede tomar unos segundos
            </Text>
          </View>
        ) : drivers.length > 0 ? (
          drivers.map((item, index) => (
            <React.Fragment key={String(item.id)}>
              <DriverCard
                item={item}
                selected={selectedDriver as any}
                setSelected={() => setSelectedDriver(item.id)}
                onDetailPress={openDriverModal}
              />
              {index < drivers.length - 1 && <View style={{ height: 10 }} />}
            </React.Fragment>
          ))
        ) : (
          <View className="items-center justify-center py-10">
            <Text className="text-4xl mb-4">🚫</Text>
            <Text className="text-gray-600 font-JakartaBold text-center mb-2">
              No hay conductores disponibles
            </Text>
            <Text className="text-gray-500 font-Jakarta text-sm text-center mb-4">
              No encontramos conductores en tu zona en este momento.
            </Text>
            <TouchableOpacity
              onPress={loadNearbyDrivers}
              className="bg-primary-500 rounded-lg px-6 py-3"
              activeOpacity={0.8}
            >
              <Text className="text-white font-JakartaMedium">
                Buscar nuevamente
            </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View className="px-5 pb-4">
        <TouchableOpacity
          disabled={!selectedDriver || isWaitingForAcceptance}
          onPress={handleDriverSelection}
          className={`rounded-xl p-4 ${selectedDriver && !isWaitingForAcceptance ? "bg-primary-500" : "bg-gray-300"}`}
          activeOpacity={0.8}
        >
          <Text className="text-white font-JakartaBold text-center">
            {isWaitingForAcceptance ? "Esperando respuesta..." : "Seleccionar conductor"}
            </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de detalle del conductor */}
      <DriverDetailModal />
    </View>
  );
};

export default ChooseDriver;
