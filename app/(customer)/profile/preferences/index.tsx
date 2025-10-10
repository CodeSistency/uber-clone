import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/common';
import { Card, Button, Switch, Select } from '@/components/ui';
import { usePreferences, useProfileActions } from '@/store/profile';

const LANGUAGES = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
  { label: 'Português', value: 'pt' },
  { label: 'Français', value: 'fr' },
];

const TIMEZONES = [
  { label: 'Caracas (UTC-4)', value: 'America/Caracas' },
  { label: 'New York (UTC-5)', value: 'America/New_York' },
  { label: 'Los Angeles (UTC-8)', value: 'America/Los_Angeles' },
  { label: 'London (UTC+0)', value: 'Europe/London' },
  { label: 'Madrid (UTC+1)', value: 'Europe/Madrid' },
];

const CURRENCIES = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'VES (Bs)', value: 'VES' },
  { label: 'MXN ($)', value: 'MXN' },
  { label: 'COP ($)', value: 'COP' },
];

const THEMES = [
  { label: 'Auto', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function PreferencesScreen() {
  const preferences = usePreferences();
  const { updatePreferences } = useProfileActions();

  const [formData, setFormData] = useState({
    theme: preferences.theme,
    preferredLanguage: preferences.preferredLanguage,
    timezone: preferences.timezone,
    currency: preferences.currency,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    rideUpdates: true,
    driverMessages: true,
    promotional: false,
    emergencyAlerts: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handlePreferenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Update preferences
      updatePreferences({
        theme: formData.theme,
        preferredLanguage: formData.preferredLanguage,
        timezone: formData.timezone,
        currency: formData.currency,
      });

      // Here you would typically save notification settings to a separate store or API
      // await notificationAPI.updateSettings(notificationSettings);

      Alert.alert(
        'Settings Updated',
        'Your preferences have been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating preferences:', error);
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppHeader
        title="Preferences"
        showBackButton={true}
        rightText="Save"
        onRightPress={handleSave}
        rightTextDisabled={isLoading}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Appearance Section */}
          <View className="mb-6">
            <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
              Appearance
            </Text>
            
            <Card className="p-0 overflow-hidden">
              {/* Theme */}
              <View className="p-4 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-Jakarta-SemiBold text-gray-800">
                      Theme
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Choose your preferred theme
                    </Text>
                  </View>
                  <View className="w-32">
                    <Select
                      options={THEMES}
                      value={formData.theme}
                      onValueChange={(value) => handlePreferenceChange('theme', value)}
                      className="bg-white"
                    />
                  </View>
                </View>
              </View>

              {/* Language */}
              <View className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-Jakarta-SemiBold text-gray-800">
                      Language
                    </Text>
                    <Text className="text-sm text-gray-600">
                      App language
                    </Text>
                  </View>
                  <View className="w-32">
                    <Select
                      options={LANGUAGES}
                      value={formData.preferredLanguage}
                      onValueChange={(value) => handlePreferenceChange('preferredLanguage', value)}
                      className="bg-white"
                    />
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Location & Currency Section */}
          <View className="mb-6">
            <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
              Location & Currency
            </Text>
            
            <Card className="p-0 overflow-hidden">
              {/* Timezone */}
              <View className="p-4 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-Jakarta-SemiBold text-gray-800">
                      Timezone
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Your local timezone
                    </Text>
                  </View>
                  <View className="w-40">
                    <Select
                      options={TIMEZONES}
                      value={formData.timezone}
                      onValueChange={(value) => handlePreferenceChange('timezone', value)}
                      className="bg-white"
                    />
                  </View>
                </View>
              </View>

              {/* Currency */}
              <View className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-Jakarta-SemiBold text-gray-800">
                      Currency
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Display currency
                    </Text>
                  </View>
                  <View className="w-32">
                    <Select
                      options={CURRENCIES}
                      value={formData.currency}
                      onValueChange={(value) => handlePreferenceChange('currency', value)}
                      className="bg-white"
                    />
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Notifications Section */}
          <View className="mb-6">
            <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
              Notifications
            </Text>
            
            <Card className="p-0 overflow-hidden">
              {/* Ride Updates */}
              <View className="p-4 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-Jakarta-SemiBold text-gray-800">
                      Ride Updates
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Driver location, arrival time
                    </Text>
                  </View>
                  <Switch
                    value={notificationSettings.rideUpdates}
                    onValueChange={(value) => handleNotificationChange('rideUpdates', value)}
                  />
                </View>
              </View>

              {/* Driver Messages */}
              <View className="p-4 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-Jakarta-SemiBold text-gray-800">
                      Driver Messages
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Chat notifications
                    </Text>
                  </View>
                  <Switch
                    value={notificationSettings.driverMessages}
                    onValueChange={(value) => handleNotificationChange('driverMessages', value)}
                  />
                </View>
              </View>

              {/* Promotional */}
              <View className="p-4 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-Jakarta-SemiBold text-gray-800">
                      Promotional
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Offers and promotions
                    </Text>
                  </View>
                  <Switch
                    value={notificationSettings.promotional}
                    onValueChange={(value) => handleNotificationChange('promotional', value)}
                  />
                </View>
              </View>

              {/* Emergency Alerts */}
              <View className="p-4 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-Jakarta-SemiBold text-gray-800">
                      Emergency Alerts
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Safety notifications
                    </Text>
                  </View>
                  <Switch
                    value={notificationSettings.emergencyAlerts}
                    onValueChange={(value) => handleNotificationChange('emergencyAlerts', value)}
                  />
                </View>
              </View>

              {/* Sound */}
              <View className="p-4 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-Jakarta-SemiBold text-gray-800">
                      Sound
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Notification sounds
                    </Text>
                  </View>
                  <Switch
                    value={notificationSettings.soundEnabled}
                    onValueChange={(value) => handleNotificationChange('soundEnabled', value)}
                  />
                </View>
              </View>

              {/* Vibration */}
              <View className="p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-Jakarta-SemiBold text-gray-800">
                      Vibration
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Haptic feedback
                    </Text>
                  </View>
                  <Switch
                    value={notificationSettings.vibrationEnabled}
                    onValueChange={(value) => handleNotificationChange('vibrationEnabled', value)}
                  />
                </View>
              </View>
            </Card>
          </View>

          {/* Privacy Section */}
          <View className="mb-8">
            <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
              Privacy
            </Text>
            
            <Card className="p-0 overflow-hidden">
              <View className="p-4">
                <Text className="font-Jakarta-SemiBold text-gray-800 mb-2">
                  Data Privacy
                </Text>
                <Text className="text-sm text-gray-600 mb-4">
                  Manage your data privacy settings and learn how we protect your information.
                </Text>
                <Button
                  title="Privacy Settings"
                  onPress={() => {
                    // Navigate to privacy settings
                    console.log('Navigate to privacy settings');
                  }}
                  variant="secondary"
                  className="w-full"
                />
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}








