import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
} from "react-native";
import { useColorScheme } from "react-native";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";

import { DrawerFooter } from "./DrawerFooter";
import { DrawerHeader } from "./DrawerHeader";
import { DrawerRouteItem } from "./DrawerRouteItem";
import { DrawerProps } from "./types";

import ModuleSwitcherWithSplash from "@/components/ModuleSwitcherWithSplash";
import { useModuleStore } from "@/store/module/module";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Componente principal del Drawer
const Drawer: React.FC<DrawerProps> = ({
  config,
  isOpen,
  activeRoute,
  expandedRoutes = new Set(),
  currentModule,
  isTransitioning = false,
  onRoutePress,
  onToggleExpanded,
  onClose,
  onModuleChange,
  width = SCREEN_WIDTH * 0.7, // 70% del ancho de pantalla
  position = "left",
  className = "",
  animationType = "slide",
  backdropOpacity = 0.5,
}) => {
  // Estados para transiciones de módulo
  const { isSplashActive, splashProgress, currentTransition } = useModuleStore(
    (state) => ({
      isSplashActive: state.isSplashActive,
      splashProgress: state.splashProgress,
      currentTransition: state.currentTransition,
    }),
  );
  // Refs y animaciones
  const slideAnim = useRef(
    new Animated.Value(position === "left" ? -width : SCREEN_WIDTH),
  ).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Tema del dispositivo
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Efecto para animar apertura/cierre
  useEffect(() => {
    const animations = [];

    if (animationType === "slide") {
      const toValue = isOpen
        ? position === "left"
          ? 0
          : SCREEN_WIDTH - width
        : position === "left"
          ? -width
          : SCREEN_WIDTH;
      animations.push(
        Animated.timing(slideAnim, {
          toValue,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      );
    }

    if (animationType === "fade" || animationType === "scale") {
      animations.push(
        Animated.timing(fadeAnim, {
          toValue: isOpen ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
      );
    }

    if (animationType === "scale") {
      animations.push(
        Animated.timing(scaleAnim, {
          toValue: isOpen ? 1 : 0.9,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      );
    }

    Animated.parallel(animations).start();
  }, [isOpen, animationType, position, width, slideAnim, fadeAnim, scaleAnim]);

  // Handler para gestos de swipe
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: slideAnim } }],
    { useNativeDriver: false },
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;

      // Determinar si cerrar basado en la dirección, distancia y velocidad
      // Más sensible para movimientos consistentes
      const shouldClose =
        (position === "left" && (translationX < -30 || velocityX < -300)) ||
        (position === "right" && (translationX > 30 || velocityX > 300));

      if (shouldClose && onClose) {
        onClose();
      } else {
        // Snap back to original position (siempre dentro de límites válidos)
        const targetPosition = position === "left" ? 0 : SCREEN_WIDTH - width;
        Animated.spring(slideAnim, {
          toValue: targetPosition,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  // Estilos dinámicos usando colores del tema
  const drawerStyle = {
    width,
    backgroundColor: isDark ? "#363531" : "#FFFFFF", // brand.primary / brand.primaryDark
    borderRightWidth: isDark ? 0 : 1,
    borderRightColor: isDark ? "transparent" : "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: position === "left" ? 4 : -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  };

  const animatedStyle = {
    transform: [
      { translateX: slideAnim },
      ...(animationType === "scale" ? [{ scale: scaleAnim }] : []),
    ],
    opacity: animationType === "fade" ? fadeAnim : 1,
  };

  return (
    <>
      {/* Backdrop - Debe estar encima de todo */}
      {isOpen && (
        <TouchableOpacity
          className="absolute inset-0 z-40"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
          activeOpacity={1}
          onPress={isSplashActive ? undefined : onClose}
          disabled={isSplashActive}
        >
          <Animated.View
            className="absolute inset-0"
            style={{
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, backdropOpacity],
              }),
            }}
          />
        </TouchableOpacity>
      )}

      {/* Drawer - Debe estar encima del backdrop */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={isOpen && !isSplashActive}
        minPointers={1}
        maxPointers={1}
        shouldCancelWhenOutside={false}
        activeOffsetX={[-15, 15]} // Solo activar con movimiento horizontal más significativo
        failOffsetY={[-15, 15]} // Fallar si hay movimiento vertical moderado
      >
        <Animated.View
          className={`absolute top-0 bottom-0 z-50 ${className}`}
          style={[drawerStyle, animatedStyle, { [position]: 0 }]}
        >
          {/* Overlay de transición de módulo */}
          {isSplashActive && (
            <View className="absolute inset-0 bg-black/20 z-10 items-center justify-center">
              <View className="bg-white rounded-lg p-6 mx-4 shadow-lg items-center">
                <Text className="text-lg font-JakartaBold text-gray-800 mb-2">
                  Cambiando a {currentTransition?.toModule}
                </Text>
                <Text className="text-sm font-JakartaMedium text-gray-600 mb-4">
                  Cargando configuración...
                </Text>
                <View className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <View
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${splashProgress}%` }}
                  />
                </View>
                <Text className="text-xs font-JakartaMedium text-gray-500">
                  {splashProgress}% completado
                </Text>
              </View>
            </View>
          )}
          {/* Header */}
          {config.header && <DrawerHeader config={config.header} />}

          {/* Routes - Scrollable */}
          <ScrollView
            className="flex-1 px-4 py-2 bg-white dark:bg-brand-primaryDark"
            showsVerticalScrollIndicator={true}
            showsHorizontalScrollIndicator={false}
            bounces={true}
            alwaysBounceVertical={true}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
          >
            {config.routes.map((route) => (
              <DrawerRouteItem
                key={route.id}
                route={route}
                isActive={activeRoute === route.id}
                isExpanded={expandedRoutes.has(route.id)}
                level={0}
                onPress={onRoutePress}
                onToggleExpanded={onToggleExpanded}
                currentModule={currentModule}
              />
            ))}

            {/* Module Switcher with Splash Screens */}
            {currentModule && (
              <View className="mt-4 mb-4">
                <ModuleSwitcherWithSplash
                  currentModule={currentModule}
                  onModuleChange={onModuleChange}
                />
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          {config.footer && <DrawerFooter config={config.footer} />}
        </Animated.View>
      </PanGestureHandler>
    </>
  );
};

export default Drawer;
