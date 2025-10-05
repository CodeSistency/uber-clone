import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/common';
import { Card, Button, TextField, Select } from '@/components/ui';
import { useProfileData, useProfileActions } from '@/store/profile';

const COUNTRY_CODES = [
  { label: '+1 (US/Canada)', value: '+1' },
  { label: '+58 (Venezuela)', value: '+58' },
  { label: '+52 (Mexico)', value: '+52' },
  { label: '+57 (Colombia)', value: '+57' },
  { label: '+51 (Peru)', value: '+51' },
  { label: '+56 (Chile)', value: '+56' },
  { label: '+54 (Argentina)', value: '+54' },
  { label: '+55 (Brazil)', value: '+55' },
];

export default function ChangePhoneScreen() {
  const profileData = useProfileData();
  const { updatePhoneVerification } = useProfileActions();

  const [formData, setFormData] = useState({
    currentPhone: profileData?.phone || '',
    countryCode: '+58',
    newPhone: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.newPhone.trim()) {
      Alert.alert('Error', 'New phone number is required');
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert('Error', 'Password is required for verification');
      return false;
    }

    // Basic phone validation (numbers only)
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(formData.newPhone)) {
      Alert.alert('Error', 'Phone number should contain only numbers');
      return false;
    }

    if (formData.newPhone.length < 7) {
      Alert.alert('Error', 'Phone number is too short');
      return false;
    }

    const fullPhone = `${formData.countryCode}${formData.newPhone}`;
    if (fullPhone === formData.currentPhone) {
      Alert.alert('Error', 'New phone number must be different from current phone');
      return false;
    }

    return true;
  };

  const handleSendVerification = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const fullPhoneNumber = `${formData.countryCode}${formData.newPhone}`;

      // Here you would typically make an API call
      // await profileAPI.sendPhoneVerification({
      //   newPhone: fullPhoneNumber,
      //   password: formData.password,
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Verification Sent',
        'A verification SMS has been sent to your new phone number. Please check your messages and follow the instructions.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to verification screen
              router.push({
                pathname: '/(customer)/profile/change-phone/verify',
                params: { newPhone: fullPhoneNumber },
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error sending verification:', error);
      Alert.alert('Error', 'Failed to send verification SMS. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppHeader
        title="Change Phone"
        showBackButton={true}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <Card className="p-6">
            <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-6">
              Change Phone Number
            </Text>

            {/* Current Phone (Read-only) */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Current Phone
              </Text>
              <View className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <Text className="font-Jakarta-Medium text-gray-600">
                  {formData.currentPhone || 'Not set'}
                </Text>
              </View>
            </View>

            {/* Country Code */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Country Code
              </Text>
              <Select
                options={COUNTRY_CODES}
                value={formData.countryCode}
                onValueChange={(value) => handleInputChange('countryCode', value)}
                placeholder="Select country code"
                className="bg-white"
              />
            </View>

            {/* New Phone Number */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                New Phone Number *
              </Text>
              <TextField
                value={formData.newPhone}
                onChangeText={(text) => handleInputChange('newPhone', text)}
                placeholder="Enter your new phone number"
                keyboardType="phone-pad"
                className="bg-white"
              />
              <Text className="text-xs text-gray-500 mt-1">
                Enter only the number without country code
              </Text>
            </View>

            {/* Password Verification */}
            <View className="mb-6">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Password Verification *
              </Text>
              <TextField
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                placeholder="Enter your current password"
                secureTextEntry
                className="bg-white"
              />
              <Text className="text-xs text-gray-500 mt-1">
                We need your password to verify this change
              </Text>
            </View>

            {/* Preview */}
            {formData.newPhone && (
              <View className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Text className="text-sm font-Jakarta-SemiBold text-blue-800 mb-1">
                  New Phone Number:
                </Text>
                <Text className="text-lg font-Jakarta-Bold text-blue-900">
                  {formData.countryCode} {formData.newPhone}
                </Text>
              </View>
            )}

            {/* Warning Message */}
            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <Text className="text-sm font-Jakarta-Medium text-yellow-800">
                ⚠️ A verification SMS will be sent to your new phone number. 
                You'll need to verify the new number before it becomes active.
              </Text>
            </View>

            {/* Send Verification Button */}
            <Button
              title="Send Verification SMS"
              onPress={handleSendVerification}
              disabled={isLoading}
              className="w-full"
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}




