import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/common';
import { Card, Button, TextField } from '@/components/ui';
import { useProfileData, useProfileActions, useIsProfileLoading } from '@/store/profile';

export default function ChangeEmailScreen() {
  const profileData = useProfileData();
  const { requestEmailChange } = useProfileActions();
  const isLoading = useIsProfileLoading();

  const [formData, setFormData] = useState({
    currentEmail: profileData?.email || '',
    newEmail: '',
    confirmEmail: '',
    password: '',
  });

  const [localLoading, setLocalLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.newEmail.trim()) {
      Alert.alert('Error', 'New email is required');
      return false;
    }
    if (!formData.confirmEmail.trim()) {
      Alert.alert('Error', 'Please confirm your new email');
      return false;
    }
    if (formData.newEmail !== formData.confirmEmail) {
      Alert.alert('Error', 'Email addresses do not match');
      return false;
    }
    if (formData.newEmail === formData.currentEmail) {
      Alert.alert('Error', 'New email must be different from current email');
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert('Error', 'Password is required for verification');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.newEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSendVerification = async () => {
    if (!validateForm()) return;

    try {
      setLocalLoading(true);

      const result = await requestEmailChange(formData.newEmail, formData.password);

      if (result.success) {
        Alert.alert(
          'Verification Sent',
          result.message || 'A verification email has been sent to your new email address. Please check your inbox and follow the instructions.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to verification screen
                router.push({
                  pathname: '/(customer)/profile/change-email/verify',
                  params: { newEmail: formData.newEmail },
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending verification:', error);
      Alert.alert('Error', 'Failed to send verification email. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppHeader
        title="Change Email"
        showBackButton={true}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <Card className="p-6">
            <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-6">
              Change Email Address
            </Text>

            {/* Current Email (Read-only) */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Current Email
              </Text>
              <View className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <Text className="font-Jakarta-Medium text-gray-600">
                  {formData.currentEmail}
                </Text>
              </View>
            </View>

            {/* New Email */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                New Email Address *
              </Text>
              <TextField
                value={formData.newEmail}
                onChangeText={(text) => handleInputChange('newEmail', text)}
                placeholder="Enter your new email address"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white"
              />
            </View>

            {/* Confirm New Email */}
            <View className="mb-4">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Confirm New Email Address *
              </Text>
              <TextField
                value={formData.confirmEmail}
                onChangeText={(text) => handleInputChange('confirmEmail', text)}
                placeholder="Confirm your new email address"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white"
              />
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

            {/* Warning Message */}
            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <Text className="text-sm font-Jakarta-Medium text-yellow-800">
                ⚠️ A verification email will be sent to your new email address. 
                You'll need to verify the new email before it becomes active.
              </Text>
            </View>

            {/* Send Verification Button */}
            <Button
              title="Send Verification Email"
              onPress={handleSendVerification}
              disabled={localLoading || isLoading}
              className="w-full"
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
