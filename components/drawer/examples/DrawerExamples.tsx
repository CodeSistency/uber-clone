import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

import { useDrawer, Drawer, useModuleStore } from "../index";

/**
 * EJEMPLO 1: Uso básico con módulo automático
 * El drawer detecta automáticamente el módulo actual del store global
 */
export const BasicDrawerExample: React.FC = () => {
  const drawer = useDrawer(); // Usa el módulo actual del store global

  return (
    <View className="flex-1">
      {/* Contenido principal */}
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-2xl font-JakartaBold mb-4">
          Current Module: {drawer.currentModule}
        </Text>

        <TouchableOpacity
          onPress={drawer.toggle}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-JakartaMedium">
            {drawer.isOpen ? "Close" : "Open"} Drawer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Drawer */}
      <Drawer
        config={drawer.config}
        isOpen={drawer.isOpen}
        activeRoute={drawer.activeRoute}
        expandedRoutes={drawer.expandedRoutes}
        currentModule={drawer.currentModule}
        isTransitioning={drawer.isTransitioning}
        onRoutePress={drawer.handleRoutePress}
        onToggleExpanded={drawer.toggleExpanded}
        onClose={drawer.close}
        onModuleChange={drawer.switchModule}
      />
    </View>
  );
};

/**
 * EJEMPLO 2: Drawer con módulo específico forzado
 * Útil cuando necesitas forzar un módulo específico independientemente del global
 */
export const ForcedModuleExample: React.FC = () => {
  const customerDrawer = useDrawer({ module: "customer" });
  const businessDrawer = useDrawer({ module: "business" });

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-xl font-JakartaBold mb-6">Drawer Examples</Text>

        {/* Customer Drawer */}
        <View className="mb-6">
          <Text className="text-lg font-JakartaSemiBold mb-2">
            Customer Drawer
          </Text>
          <TouchableOpacity
            onPress={customerDrawer.toggle}
            className="bg-green-500 px-4 py-2 rounded-lg mb-2"
          >
            <Text className="text-white">
              {customerDrawer.isOpen ? "Close" : "Open"} Customer Drawer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Business Drawer */}
        <View className="mb-6">
          <Text className="text-lg font-JakartaSemiBold mb-2">
            Business Drawer
          </Text>
          <TouchableOpacity
            onPress={businessDrawer.toggle}
            className="bg-purple-500 px-4 py-2 rounded-lg mb-2"
          >
            <Text className="text-white">
              {businessDrawer.isOpen ? "Close" : "Open"} Business Drawer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Estado global */}
        <View className="bg-white p-4 rounded-lg">
          <Text className="font-JakartaBold mb-2">Global Module State</Text>
          <Text>Current Module: {useModuleStore.getState().currentModule}</Text>
          <Text>
            Is Transitioning:{" "}
            {useModuleStore.getState().isTransitioning ? "Yes" : "No"}
          </Text>
        </View>
      </View>

      {/* Customer Drawer */}
      <Drawer
        config={customerDrawer.config}
        isOpen={customerDrawer.isOpen}
        activeRoute={customerDrawer.activeRoute}
        expandedRoutes={customerDrawer.expandedRoutes}
        currentModule={customerDrawer.currentModule}
        onRoutePress={customerDrawer.handleRoutePress}
        onToggleExpanded={customerDrawer.toggleExpanded}
        onClose={customerDrawer.close}
        onModuleChange={customerDrawer.switchModule}
      />

      {/* Business Drawer */}
      <Drawer
        config={businessDrawer.config}
        isOpen={businessDrawer.isOpen}
        activeRoute={businessDrawer.activeRoute}
        expandedRoutes={businessDrawer.expandedRoutes}
        currentModule={businessDrawer.currentModule}
        onRoutePress={businessDrawer.handleRoutePress}
        onToggleExpanded={businessDrawer.toggleExpanded}
        onClose={businessDrawer.close}
        onModuleChange={businessDrawer.switchModule}
      />
    </ScrollView>
  );
};

/**
 * EJEMPLO 3: Drawer con configuración personalizada
 * Útil para overrides específicos en ciertas pantallas
 */
export const CustomConfigExample: React.FC = () => {
  const drawer = useDrawer({
    config: {
      header: {
        title: "Custom Screen",
        subtitle: "Special configuration",
      },
      routes: [
        {
          id: "custom-action",
          title: "Custom Action",
          icon: "⭐",
          onPress: () => {
            console.log('Custom action pressed');
          },
        },
      ],
    },
  });

  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-JakartaBold mb-4">
          Custom Drawer Config
        </Text>

        <TouchableOpacity
          onPress={drawer.toggle}
          className="bg-orange-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-JakartaMedium">
            Open Custom Drawer
          </Text>
        </TouchableOpacity>
      </View>

      <Drawer
        config={drawer.config}
        isOpen={drawer.isOpen}
        activeRoute={drawer.activeRoute}
        onRoutePress={drawer.handleRoutePress}
        onClose={drawer.close}
      />
    </View>
  );
};

/**
 * EJEMPLO 4: Integración completa con UI existente
 * Cómo integrar el drawer con el sistema UI existente del proyecto
 */
export const FullIntegrationExample: React.FC = () => {
  const drawer = useDrawer();

  return (
    <View className="flex-1">
      {/* Header con botón de menú */}
      <View className="flex-row items-center justify-between p-4 bg-white shadow-sm">
        <TouchableOpacity onPress={drawer.toggle} className="p-2">
          <Text className="text-2xl text-secondary-700 dark:text-secondary-300">
            ☰
          </Text>
        </TouchableOpacity>
        <Text className="text-lg font-JakartaBold">
          {drawer.currentModule.charAt(0).toUpperCase() +
            drawer.currentModule.slice(1)}{" "}
          App
        </Text>
        <View className="w-10" /> {/* Spacer */}
      </View>

      {/* Contenido principal */}
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-JakartaBold mb-4">
          Welcome to the App
        </Text>
        <Text className="text-gray-600 mb-6">
          You are currently in {drawer.currentModule} mode. Use the menu button
          to access the drawer.
        </Text>

        <View className="bg-blue-50 p-4 rounded-lg mb-4">
          <Text className="font-JakartaSemiBold mb-2">Current State:</Text>
          <Text>• Module: {drawer.currentModule}</Text>
          <Text>• Active Route: {drawer.activeRoute || "None"}</Text>
          <Text>• Drawer Open: {drawer.isOpen ? "Yes" : "No"}</Text>
          <Text>• Transitioning: {drawer.isTransitioning ? "Yes" : "No"}</Text>
        </View>

        <TouchableOpacity
          onPress={() => drawer.switchModule("customer")}
          className="bg-green-500 px-4 py-3 rounded-lg mb-2"
        >
          <Text className="text-white font-JakartaMedium text-center">
            Switch to Customer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => drawer.switchModule("business")}
          className="bg-purple-500 px-4 py-3 rounded-lg mb-2"
        >
          <Text className="text-white font-JakartaMedium text-center">
            Switch to Business
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => drawer.switchModule("driver")}
          className="bg-red-500 px-4 py-3 rounded-lg"
        >
          <Text className="text-white font-JakartaMedium text-center">
            Switch to Driver
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Drawer */}
      <Drawer
        config={drawer.config}
        isOpen={drawer.isOpen}
        activeRoute={drawer.activeRoute}
        expandedRoutes={drawer.expandedRoutes}
        currentModule={drawer.currentModule}
        isTransitioning={drawer.isTransitioning}
        onRoutePress={drawer.handleRoutePress}
        onToggleExpanded={drawer.toggleExpanded}
        onClose={drawer.close}
        onModuleChange={drawer.switchModule}
      />
    </View>
  );
};
