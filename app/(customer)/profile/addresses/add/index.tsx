import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/common';
import { Card, Button, TextField, Select } from '@/components/ui';
import { useProfileActions } from '@/store/profile';

const ADDRESS_TYPES = [
  { label: 'Home', value: 'home' },
  { label: 'Work', value: 'work' },
  { label: 'Gym', value: 'gym' },
  { label: 'Other', value: 'other' },
];

export default function AddAddressScreen() {
  const { addAddress } = useProfileActions();

  const [formData, setFormData] = useState({
    type: 'home',
    name: '',
    address: '',
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    isDefault: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Address name is required');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Address is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Here you would typically get coordinates from a map or geocoding service
      // For now, we'll use mock coordinates
      const mockCoordinates = {
        latitude: 10.4806 + (Math.random() - 0.5) * 0.01, // Caracas area
        longitude: -66.9036 + (Math.random() - 0.5) * 0.01,
      };

      // Add address to store
      addAddress({
        type: formData.type as any,
        name: formData.name.trim(),
        address: formData.address.trim(),
        coordinates: mockCoordinates,
        isDefault: formData.isDefault,
      });

      Alert.alert(
        'Address Added',
        'Your address has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding address:', error);
      Alert.alert('Error', 'Failed to add address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    const icons = {
      home: '🏠',
      work: '🏢',
      gym: '🏋️',
      other: '📍',
    };
    return icons[type as keyof typeof icons] || '📍';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppHeader
        title="Add Address"
        showBackButton={true}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <Card className="p-6">
            <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-6">
              Add New Address
            </Text>

            {/* Address Type */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Address Type
              </Text>
              <Select
                options={ADDRESS_TYPES}
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
                placeholder="Select address type"
                className="bg-white"
              />
            </View>

            {/* Address Name */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Address Name *
              </Text>
              <TextField
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder={`Enter ${formData.type} name (e.g., My Home)`}
                className="bg-white"
              />
            </View>

            {/* Map Placeholder */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Location
              </Text>
              <View className="bg-gray-100 border border-gray-300 rounded-lg p-8 items-center">
                <Text className="text-4xl mb-2">🗺️</Text>
                <Text className="text-sm font-Jakarta-Medium text-gray-600 text-center">
                  Map integration would go here
                </Text>
                <Text className="text-xs text-gray-500 text-center mt-1">
                  Select location on map or enter address below
                </Text>
              </View>
            </View>

            {/* Address Details */}
            <View className="mb-6">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Address Details *
              </Text>
              <TextField
                value={formData.address}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Enter full address"
                multiline
                numberOfLines={3}
                className="bg-white"
              />
              <Text className="text-xs text-gray-500 mt-1">
                Include street, building, apartment, etc.
              </Text>
            </View>

            {/* Set as Default */}
            <View className="mb-6">
              <View className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-sm font-Jakarta-SemiBold text-gray-700">
                    Set as Default Address
                  </Text>
                  <Text className="text-xs text-gray-500">
                    This will be your primary pickup location
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleInputChange('isDefault', !formData.isDefault)}
                  className={`w-12 h-6 rounded-full ${
                    formData.isDefault ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <View
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                      formData.isDefault ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Preview */}
            {formData.name && formData.address && (
              <View className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Text className="text-sm font-Jakarta-SemiBold text-blue-800 mb-2">
                  Preview:
                </Text>
                <View className="flex-row items-start">
                  <Text className="text-2xl mr-3">
                    {getAddressTypeIcon(formData.type)}
                  </Text>
                  <View className="flex-1">
                    <Text className="font-Jakarta-SemiBold text-blue-900">
                      {formData.name}
                    </Text>
                    <Text className="text-sm text-blue-700">
                      {formData.address}
                    </Text>
                    {formData.isDefault && (
                      <Text className="text-xs text-green-600 font-Jakarta-SemiBold mt-1">
                        Default Address
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Save Button */}
            <Button
              title="Save Address"
              onPress={handleSave}
              disabled={isLoading}
              className="w-full"
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}




