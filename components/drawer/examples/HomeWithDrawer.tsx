/**
 * Ejemplo de integración del nuevo componente Drawer
 * en una pantalla tipo Home
 */

import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDrawer, Drawer } from "../index";

const HomeWithDrawer: React.FC = () => {
  const drawer = useDrawer(); // Usa el módulo actual del store global

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header con botón de menú */}
      <View className="flex-row items-center justify-between p-4 bg-brand-primary dark:bg-brand-primaryDark shadow-sm border-b border-secondary-300 dark:border-secondary-600">
        <TouchableOpacity onPress={drawer.toggle} className="p-2">
          <Text className="text-2xl text-secondary-700 dark:text-secondary-300">
            ☰
          </Text>
        </TouchableOpacity>

        <Text className="text-lg font-JakartaBold text-secondary-700 dark:text-secondary-300">
          {drawer.currentModule.charAt(0).toUpperCase() +
            drawer.currentModule.slice(1)}{" "}
          App
        </Text>

        <TouchableOpacity className="p-2">
          <Text className="text-xl text-secondary-700 dark:text-secondary-300">
            🔔
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-JakartaBold mb-4">Welcome!</Text>

        <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <Text className="font-JakartaSemiBold mb-2">Current Status:</Text>
          <Text className="text-gray-600">
            • Module: {drawer.currentModule}
          </Text>
          <Text className="text-gray-600">
            • Active Route: {drawer.activeRoute || "None"}
          </Text>
          <Text className="text-gray-600">
            • Drawer: {drawer.isOpen ? "Open" : "Closed"}
          </Text>
        </View>

        {/* Acciones rápidas */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity className="bg-blue-500 px-4 py-3 rounded-lg flex-1 mr-2">
            <Text className="text-white font-JakartaMedium text-center">
              Find Ride
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-green-500 px-4 py-3 rounded-lg flex-1 ml-2">
            <Text className="text-white font-JakartaMedium text-center">
              Order Food
            </Text>
          </TouchableOpacity>
        </View>

        {/* Opciones de cambio de módulo */}
        <View className="bg-white p-4 rounded-lg shadow-sm">
          <Text className="font-JakartaBold mb-3">Switch Module</Text>

          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => drawer.switchModule("customer")}
              disabled={
                drawer.currentModule === "customer" || drawer.isTransitioning
              }
              className={`px-4 py-2 rounded-lg flex-1 mr-1 ${
                drawer.currentModule === "customer"
                  ? "bg-blue-500"
                  : "bg-gray-200"
              }`}
            >
              <Text
                className={`font-JakartaMedium text-center ${
                  drawer.currentModule === "customer"
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => drawer.switchModule("business")}
              disabled={
                drawer.currentModule === "business" || drawer.isTransitioning
              }
              className={`px-4 py-2 rounded-lg flex-1 mx-1 ${
                drawer.currentModule === "business"
                  ? "bg-purple-500"
                  : "bg-gray-200"
              }`}
            >
              <Text
                className={`font-JakartaMedium text-center ${
                  drawer.currentModule === "business"
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                Business
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => drawer.switchModule("driver")}
              disabled={
                drawer.currentModule === "driver" || drawer.isTransitioning
              }
              className={`px-4 py-2 rounded-lg flex-1 ml-1 ${
                drawer.currentModule === "driver" ? "bg-red-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`font-JakartaMedium text-center ${
                  drawer.currentModule === "driver"
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                Driver
              </Text>
            </TouchableOpacity>
          </View>

          {drawer.isTransitioning && (
            <Text className="text-center text-blue-500 mt-2 font-JakartaMedium">
              Switching modules...
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Drawer integrado */}
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
    </SafeAreaView>
  );
};

export default HomeWithDrawer;
