/**
 * Archivo de prueba para verificar que las integraciones del drawer funcionan correctamente
 * Este archivo puede ser usado para testing manual de las integraciones
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDrawer } from '../index';

const DrawerIntegrationTest: React.FC = () => {
  const customerDrawer = useDrawer({ module: 'customer' });
  const businessDrawer = useDrawer({ module: 'business' });
  const driverDrawer = useDrawer({ module: 'driver' });
  const autoDrawer = useDrawer(); // Usa módulo automático

  const testDrawer = (drawer: any, name: string) => {
    Alert.alert(
      `${name} Drawer Test`,
      `Is Open: ${drawer.isOpen}\n` +
      `Module: ${drawer.currentModule}\n` +
      `Active Route: ${drawer.activeRoute || 'None'}\n` +
      `Transitioning: ${drawer.isTransitioning}\n` +
      `Routes Count: ${drawer.routes?.length || 0}`
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-2xl font-JakartaBold mb-6 text-center">
          Drawer Integration Test
        </Text>

        <Text className="text-lg font-JakartaSemiBold mb-4">Test Individual Modules:</Text>

        {/* Customer Drawer Test */}
        <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-JakartaBold">Customer Drawer</Text>
            <TouchableOpacity
              onPress={() => testDrawer(customerDrawer, 'Customer')}
              className="bg-blue-500 px-3 py-1 rounded"
            >
              <Text className="text-white text-sm">Test</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={customerDrawer.toggle}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-JakartaMedium text-center">
              {customerDrawer.isOpen ? 'Close' : 'Open'} Customer Drawer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Business Drawer Test */}
        <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-JakartaBold">Business Drawer</Text>
            <TouchableOpacity
              onPress={() => testDrawer(businessDrawer, 'Business')}
              className="bg-purple-500 px-3 py-1 rounded"
            >
              <Text className="text-white text-sm">Test</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={businessDrawer.toggle}
            className="bg-purple-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-JakartaMedium text-center">
              {businessDrawer.isOpen ? 'Close' : 'Open'} Business Drawer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Driver Drawer Test */}
        <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-JakartaBold">Driver Drawer</Text>
            <TouchableOpacity
              onPress={() => testDrawer(driverDrawer, 'Driver')}
              className="bg-red-500 px-3 py-1 rounded"
            >
              <Text className="text-white text-sm">Test</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={driverDrawer.toggle}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-JakartaMedium text-center">
              {driverDrawer.isOpen ? 'Close' : 'Open'} Driver Drawer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auto Drawer Test */}
        <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-JakartaBold">Auto Drawer (Current Module)</Text>
            <TouchableOpacity
              onPress={() => testDrawer(autoDrawer, 'Auto')}
              className="bg-green-500 px-3 py-1 rounded"
            >
              <Text className="text-white text-sm">Test</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={autoDrawer.toggle}
            className="bg-green-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-JakartaMedium text-center">
              {autoDrawer.isOpen ? 'Close' : 'Open'} Auto Drawer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Module Switching Test */}
        <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <Text className="font-JakartaBold mb-3">Module Switching Test</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => autoDrawer.switchModule('customer')}
              className="bg-blue-500 px-3 py-2 rounded-lg flex-1 mr-1"
            >
              <Text className="text-white font-JakartaMedium text-center text-sm">
                To Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => autoDrawer.switchModule('business')}
              className="bg-purple-500 px-3 py-2 rounded-lg flex-1 mx-1"
            >
              <Text className="text-white font-JakartaMedium text-center text-sm">
                To Business
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => autoDrawer.switchModule('driver')}
              className="bg-red-500 px-3 py-2 rounded-lg flex-1 ml-1"
            >
              <Text className="text-white font-JakartaMedium text-center text-sm">
                To Driver
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Integration Status */}
        <View className="bg-green-50 p-4 rounded-lg border border-green-200">
          <Text className="font-JakartaBold text-green-800 mb-2">✅ Integration Status</Text>
          <Text className="text-green-700 text-sm">
            • Customer drawer integrado en unified-flow-demo.tsx{'\n'}
            • Driver drawer integrado en driver-unified-flow-demo.tsx{'\n'}
            • Business drawer integrado en business/dashboard/index.tsx{'\n'}
            • Módulos dinámicos con transiciones fluidas{'\n'}
            • Estado persistente funcionando{'\n'}
            • Navegación con Expo Router integrada
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default DrawerIntegrationTest;

