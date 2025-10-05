import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import { View, Text, Animated, ActivityIndicator } from "react-native";

import { Button, Card, Badge } from "@/components/ui";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useAsyncDriverSearch } from "@/hooks/useAsyncDriverSearch";
import { useLocationStore } from "@/store";

import FlowHeader from "../../../FlowHeader";

const DriverMatching: React.FC = () => {
  const { next, back } = useMapFlow();
  const { showError, showSuccess } = useUI();
  const locationStore = useLocationStore();

  // Hook del sistema asíncrono de búsqueda
  const {
    searchState,
    startSearch,
    cancelSearch,
    confirmDriver,
    retrySearch,
    wsConnected,
  } = useAsyncDriverSearch();

  // Estados locales para expansión de radio
  const [currentRadius, setCurrentRadius] = useState(5);
  const [retryCount, setRetryCount] = useState(0);
  const [showFinalOptions, setShowFinalOptions] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Estados para animaciones y UI
  const [dots, setDots] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Configuración del sistema de expansión
  const MAX_RADIUS = 20; // 20km máximo
  const RADIUS_INCREMENT = 2; // 2km por expansión
  const MAX_RETRIES = 5; // Máximo 5 intentos

  // Cache de cálculos para optimización de rendimiento
  const uiState = useMemo(() => ({
    getStatusText: () => {
      if (showFinalOptions) return "Sin conductores disponibles";
      if (searchState.status === 'searching') return `Buscando conductor${dots}`;
      if (searchState.status === 'found') return "¡Conductor encontrado!";
      return "Buscando conductor";
    },
    getSubtitle: () => {
      if (showFinalOptions) return "¿Qué deseas hacer?";
      if (searchState.status === 'searching') {
        return currentRadius > 5
          ? `Buscando en un radio de ${currentRadius}km (intento ${retryCount + 1})`
          : "Estamos encontrando el mejor conductor para ti";
      }
      return "Estamos encontrando el mejor conductor para ti";
    },
    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
  }), [showFinalOptions, searchState.status, dots, currentRadius, retryCount]);

  // Efecto para iniciar búsqueda asíncrona cuando se monta el componente
  useEffect(() => {
    const initializeAsyncSearch = async () => {
      // Validar que tenemos los datos necesarios
      if (
        !locationStore.userLatitude ||
        !locationStore.userLongitude
      ) {
        
        showError("Error", "Ubicación no disponible para buscar conductores");
        back();
        return;
      }

      // Iniciar animaciones
      startAnimations();

      // Iniciar búsqueda asíncrona
      const success = await startSearch({
        radiusKm: currentRadius,
        priority: 'normal',
      });

      if (!success) {
        
        showError("Error", "No se pudo iniciar la búsqueda de conductores");
        back();
      }
    };

    initializeAsyncSearch();
  }, []); // Solo se ejecuta una vez al montar

  // Efecto para monitorear cambios en el estado de búsqueda
  useEffect(() => {
    switch (searchState.status) {
      case 'found':
        if (searchState.matchedDriver) {
          handleDriverFound(searchState.matchedDriver);
        }
        break;

      case 'timeout':
        handleSearchTimeout();
        break;

      case 'cancelled':
        handleSearchCancelled();
        break;

      case 'idle':
        // Estado idle - verificar si necesitamos mostrar opciones finales
        if (retryCount >= MAX_RETRIES && !searchState.matchedDriver) {
          setShowFinalOptions(true);
        }
        break;
    }
  }, [searchState.status, searchState.matchedDriver, retryCount]);

  // Efecto para animación de dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Función para iniciar animaciones optimizadas
  const startAnimations = () => {
    // Fade in animation - optimizada con useNativeDriver
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300, // Más rápido para mejor UX
      useNativeDriver: true,
    }).start();

    // Pulse animation - optimizada para mejor rendimiento
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15, // Menos exagerado para mejor rendimiento
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimation.start();

    return pulseAnimation;
  };

  // Función para manejar cuando se encuentra un conductor
  const handleDriverFound = async (driver: any) => {
    

    try {
      // Confirmar el conductor automáticamente
      const confirmed = await confirmDriver(driver.id);

      if (confirmed) {
        showSuccess(
          "¡Conductor confirmado!",
          `${driver.firstName} ${driver.lastName} viene en camino`,
        );

        // Avanzar al siguiente paso después de un delay
        setTimeout(() => {
          next();
        }, 2000);
      }
    } catch (error) {
      
      showError("Error", "No se pudo confirmar el conductor seleccionado");
    }
  };

  // Función para manejar timeout de búsqueda
  const handleSearchTimeout = () => {
    

    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);

    if (newRetryCount >= MAX_RETRIES) {
      // Máximo de reintentos alcanzado - mostrar opciones finales
      
      setShowFinalOptions(true);
      return;
    }

    // Expandir radio de búsqueda
    const newRadius = Math.min(currentRadius + RADIUS_INCREMENT, MAX_RADIUS);
    setCurrentRadius(newRadius);

    

    // Reiniciar búsqueda con radio mayor
    setTimeout(async () => {
      const success = await startSearch({
        radiusKm: newRadius,
        priority: newRetryCount > 2 ? 'high' : 'normal',
      });

      if (!success) {
        
        setShowFinalOptions(true);
      }
    }, 1000); // Pequeño delay para mejor UX
  };

  // Función para manejar cancelación de búsqueda
  const handleSearchCancelled = () => {
    
    showSuccess(
      "Búsqueda cancelada",
      "Puedes modificar tu pedido e intentar nuevamente"
    );

    // Retroceder al paso anterior
    setTimeout(() => {
      back();
    }, 1500);
  };

  // Función para cancelar búsqueda manualmente
  const handleCancelMatching = async () => {
    if (isCancelling) return;

    setIsCancelling(true);

    try {
      await cancelSearch();
      // handleSearchCancelled será llamado por el useEffect que monitorea el estado
    } catch (error) {
      
      showError("Error", "No se pudo cancelar la búsqueda");
    } finally {
      setIsCancelling(false);
    }
  };

  // Función para reintentar búsqueda desde opciones finales
  const handleRetrySearch = async () => {
    

    // Resetear estado
    setShowFinalOptions(false);
    setRetryCount(0);
    setCurrentRadius(5);

    // Reiniciar búsqueda
    const success = await retrySearch();

    if (!success) {
      showError("Error", "No se pudo reiniciar la búsqueda");
      back();
    }
  };

  // Función para salir desde opciones finales
  const handleExitSearch = () => {
    

    showSuccess(
      "Búsqueda finalizada",
      "Puedes modificar tu pedido más tarde"
    );

    back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Componentes memoizados para optimización de rendimiento
  const SearchIndicator = memo(({ isFound }: { isFound: boolean }) => (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
        opacity: fadeAnim,
      }}
      className="mb-8"
    >
      <View className={`w-32 h-32 rounded-full items-center justify-center ${
        isFound ? 'bg-green-100' : 'bg-primary-100'
      }`}>
        <View className={`w-24 h-24 rounded-full items-center justify-center ${
          isFound ? 'bg-green-500' : 'bg-primary-500'
        }`}>
          <Text className="text-4xl">
            {isFound ? '✅' : '🔍'}
          </Text>
        </View>
      </View>
    </Animated.View>
  ));

  const ProgressInfo = memo(({ timeRemaining, currentRadius, wsConnected }: {
    timeRemaining: number;
    currentRadius: number;
    wsConnected: boolean;
  }) => (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="bg-gray-50 rounded-xl p-6 w-full max-w-sm mb-8"
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-JakartaMedium text-gray-600">
          Tiempo restante
        </Text>
        <Text className="font-JakartaBold text-primary-600 text-lg">
          {uiState.formatTime(timeRemaining)}
        </Text>
      </View>

      <View className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <View
          className="bg-primary-500 h-2 rounded-full"
          style={{
            width: `${Math.max(0, (timeRemaining / 300) * 100)}%`,
          }}
        />
      </View>

      <Text className="font-Jakarta text-sm text-gray-500 text-center">
        Buscando conductores en un radio de {currentRadius}km
      </Text>

      <View className="flex-row items-center justify-center mt-3">
        <View className={`w-2 h-2 rounded-full mr-2 ${
          wsConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <Text className="font-Jakarta text-xs text-gray-500">
          {wsConnected ? 'Conectado' : 'Conectando...'}
        </Text>
      </View>
    </Animated.View>
  ));

  const FinalOptions = memo(() => (
    <View className="w-full max-w-sm">
      <View className="w-32 h-32 bg-red-100 rounded-full items-center justify-center mb-8 mx-auto">
        <View className="w-24 h-24 bg-red-500 rounded-full items-center justify-center">
          <Text className="text-4xl">😔</Text>
        </View>
      </View>

      <Text className="text-xl font-JakartaBold text-gray-800 text-center mb-4">
        No encontramos conductores
      </Text>

      <Text className="font-Jakarta text-gray-600 text-center mb-8">
        Hemos buscado en un radio de hasta {MAX_RADIUS}km pero no hay conductores disponibles en este momento.
      </Text>

      <View className="space-y-3">
        <Button
          variant="primary"
          title="🔄 Intentar nuevamente"
          onPress={handleRetrySearch}
          className="rounded-xl py-4"
        />

        <Button
          variant="secondary"
          title="🏠 Hacer pedido más tarde"
          onPress={handleExitSearch}
          className="rounded-xl py-4"
        />
      </View>
    </View>
  ));

  return (
    <View className="flex-1">
      <FlowHeader
        title={uiState.getStatusText()}
        subtitle={uiState.getSubtitle()}
        onBack={showFinalOptions ? undefined : handleCancelMatching}
      />

      <View className="flex-1 justify-center items-center px-6">
        {/* Mostrar opciones finales si no se encontró conductor */}
        {showFinalOptions ? (
          <FinalOptions />
        ) : (
          <>
            {/* Animated Search Icon */}
            <SearchIndicator isFound={searchState.status === 'found'} />

            {/* Status Text */}
            <Animated.Text
              style={{ opacity: fadeAnim }}
              className="text-2xl font-JakartaBold text-gray-800 text-center mb-4"
            >
              {uiState.getStatusText()}
            </Animated.Text>

            {/* Progress Info - Solo mostrar durante búsqueda activa */}
            {searchState.status === 'searching' && (
              <ProgressInfo
                timeRemaining={searchState.timeRemaining}
                currentRadius={currentRadius}
                wsConnected={wsConnected}
              />
            )}

            {/* Driver Info - Mostrar cuando se encuentra conductor */}
            {searchState.status === 'found' && searchState.matchedDriver && (
              <Animated.View
                style={{ opacity: fadeAnim }}
                className="bg-green-50 rounded-xl p-6 w-full max-w-sm mb-8"
              >
                <Text className="font-JakartaBold text-green-800 text-center mb-3">
                  Conductor encontrado
                </Text>

                <View className="flex-row items-center mb-3">
                  <View className="w-12 h-12 bg-gray-300 rounded-full mr-3" />
                  <View>
                    <Text className="font-JakartaBold text-gray-800">
                      {searchState.matchedDriver.firstName} {searchState.matchedDriver.lastName}
                    </Text>
                    <Text className="font-Jakarta text-gray-600 text-sm">
                      ⭐ {searchState.matchedDriver.rating} • {searchState.matchedDriver.distance}
                    </Text>
                  </View>
                </View>

                <Text className="font-Jakarta text-green-700 text-center">
                  Confirmando conductor...
                </Text>
              </Animated.View>
            )}

            {/* Tips */}
            <Animated.View
              style={{ opacity: fadeAnim }}
              className="bg-blue-50 rounded-xl p-4 w-full max-w-sm mb-8"
            >
              <Text className="font-JakartaBold text-blue-800 mb-2">
                💡 Consejos
              </Text>
              <Text className="font-Jakarta text-blue-700 text-sm">
                • El radio de búsqueda se expande automáticamente{"\n"}
                • Más conductores estarán disponibles pronto{"\n"}
                • Recibirás notificación cuando encontremos uno
              </Text>
            </Animated.View>

            {/* Cancel Button - Solo mostrar durante búsqueda activa */}
            {searchState.status === 'searching' && (
              <Animated.View style={{ opacity: fadeAnim }}>
                <Button
                  variant="secondary"
                  title={isCancelling ? "Cancelando..." : "Cancelar búsqueda"}
                  onPress={handleCancelMatching}
                  disabled={isCancelling}
                  className="rounded-xl px-8 py-4"
                  loading={isCancelling}
                />
              </Animated.View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default DriverMatching;
