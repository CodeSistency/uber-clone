import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/common';
import { Card, Button, TextField, Select } from '@/components/ui';
import { useLocationInfo, useProfileActions } from '@/store/profile';

const COUNTRIES = [
  { label: 'Venezuela', value: 'venezuela' },
  { label: 'United States', value: 'united_states' },
  { label: 'Mexico', value: 'mexico' },
  { label: 'Colombia', value: 'colombia' },
  { label: 'Peru', value: 'peru' },
  { label: 'Chile', value: 'chile' },
  { label: 'Argentina', value: 'argentina' },
  { label: 'Brazil', value: 'brazil' },
];

const STATES = {
  venezuela: [
    { label: 'Miranda', value: 'miranda' },
    { label: 'Distrito Capital', value: 'distrito_capital' },
    { label: 'Zulia', value: 'zulia' },
    { label: 'Carabobo', value: 'carabobo' },
    { label: 'Lara', value: 'lara' },
    { label: 'Aragua', value: 'aragua' },
    { label: 'Anzoátegui', value: 'anzoategui' },
    { label: 'Bolívar', value: 'bolivar' },
  ],
  united_states: [
    { label: 'California', value: 'california' },
    { label: 'New York', value: 'new_york' },
    { label: 'Texas', value: 'texas' },
    { label: 'Florida', value: 'florida' },
    { label: 'Illinois', value: 'illinois' },
  ],
  mexico: [
    { label: 'Ciudad de México', value: 'cdmx' },
    { label: 'Jalisco', value: 'jalisco' },
    { label: 'Nuevo León', value: 'nuevo_leon' },
    { label: 'Puebla', value: 'puebla' },
  ],
  colombia: [
    { label: 'Bogotá D.C.', value: 'bogota' },
    { label: 'Antioquia', value: 'antioquia' },
    { label: 'Valle del Cauca', value: 'valle_del_cauca' },
    { label: 'Atlántico', value: 'atlantico' },
  ],
};

const CITIES = {
  miranda: [
    { label: 'Caracas', value: 'caracas' },
    { label: 'Los Teques', value: 'los_teques' },
    { label: 'Guarenas', value: 'guarenas' },
    { label: 'Guatire', value: 'guatire' },
  ],
  distrito_capital: [
    { label: 'Caracas', value: 'caracas' },
    { label: 'El Junquito', value: 'el_junquito' },
  ],
  zulia: [
    { label: 'Maracaibo', value: 'maracaibo' },
    { label: 'Cabimas', value: 'cabimas' },
    { label: 'Ciudad Ojeda', value: 'ciudad_ojeda' },
  ],
  carabobo: [
    { label: 'Valencia', value: 'valencia' },
    { label: 'Maracay', value: 'maracay' },
    { label: 'Puerto Cabello', value: 'puerto_cabello' },
  ],
  california: [
    { label: 'Los Angeles', value: 'los_angeles' },
    { label: 'San Francisco', value: 'san_francisco' },
    { label: 'San Diego', value: 'san_diego' },
  ],
  new_york: [
    { label: 'New York City', value: 'new_york_city' },
    { label: 'Buffalo', value: 'buffalo' },
    { label: 'Rochester', value: 'rochester' },
  ],
};

export default function ChangeLocationScreen() {
  const locationInfo = useLocationInfo();
  const { updateLocation } = useProfileActions();

  const [formData, setFormData] = useState({
    country: locationInfo.country || 'venezuela',
    state: locationInfo.state || '',
    city: locationInfo.city || '',
    postalCode: locationInfo.postalCode || '',
    address: locationInfo.address || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset dependent fields when country changes
      if (field === 'country') {
        newData.state = '';
        newData.city = '';
      }
      
      // Reset city when state changes
      if (field === 'state') {
        newData.city = '';
      }
      
      return newData;
    });
  };

  const getStateOptions = () => {
    return STATES[formData.country as keyof typeof STATES] || [];
  };

  const getCityOptions = () => {
    if (!formData.state) return [];
    return CITIES[formData.state as keyof typeof CITIES] || [];
  };

  const validateForm = () => {
    if (!formData.country) {
      Alert.alert('Error', 'Please select a country');
      return false;
    }
    if (!formData.state) {
      Alert.alert('Error', 'Please select a state/province');
      return false;
    }
    if (!formData.city) {
      Alert.alert('Error', 'Please select a city');
      return false;
    }
    if (!formData.postalCode.trim()) {
      Alert.alert('Error', 'Postal code is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Update location data
      updateLocation({
        country: formData.country,
        state: formData.state,
        city: formData.city,
        postalCode: formData.postalCode,
        address: formData.address,
      });

      // Here you would typically make an API call
      // await profileAPI.updateLocation(formData);

      Alert.alert(
        'Location Updated',
        'Your location has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating location:', error);
      Alert.alert('Error', 'Failed to update location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppHeader
        title="Change Location"
        showBackButton={true}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <Card className="p-6">
            <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-6">
              Update Your Location
            </Text>

            {/* Country */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Country *
              </Text>
              <Select
                options={COUNTRIES}
                value={formData.country}
                onValueChange={(value) => handleInputChange('country', value)}
                placeholder="Select country"
                className="bg-white"
              />
            </View>

            {/* State/Province */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                State/Province *
              </Text>
              <Select
                options={getStateOptions()}
                value={formData.state}
                onValueChange={(value) => handleInputChange('state', value)}
                placeholder="Select state/province"
                className="bg-white"
                disabled={!formData.country}
              />
            </View>

            {/* City */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                City *
              </Text>
              <Select
                options={getCityOptions()}
                value={formData.city}
                onValueChange={(value) => handleInputChange('city', value)}
                placeholder="Select city"
                className="bg-white"
                disabled={!formData.state}
              />
            </View>

            {/* Postal Code */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Postal Code *
              </Text>
              <TextField
                value={formData.postalCode}
                onChangeText={(text) => handleInputChange('postalCode', text)}
                placeholder="Enter postal code"
                keyboardType="numeric"
                className="bg-white"
              />
            </View>

            {/* Address */}
            <View className="mb-6">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Address (Optional)
              </Text>
              <TextField
                value={formData.address}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Enter your address"
                className="bg-white"
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Current Location Display */}
            <View className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Current Location:
              </Text>
              <Text className="text-sm text-gray-600">
                {locationInfo.address && `${locationInfo.address}, `}
                {locationInfo.city && `${locationInfo.city}, `}
                {locationInfo.state && `${locationInfo.state}, `}
                {locationInfo.country && locationInfo.country}
                {locationInfo.postalCode && ` ${locationInfo.postalCode}`}
              </Text>
            </View>

            {/* Save Button */}
            <Button
              title="Save Location"
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








