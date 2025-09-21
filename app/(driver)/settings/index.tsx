import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useDriverConfigStore } from "@/store";
import { driverService, DriverProfile } from "@/app/services/driverService";
import { useUI } from "@/components/UIWrapper";

// Dummy data for development
const dummyDriverProfile: DriverProfile = {
  id: "driver_123",
  firstName: "Carlos",
  lastName: "Rodriguez",
  email: "carlos.rodriguez@email.com",
  phone: "+1 (555) 123-4567",
  profilePicture: undefined,
  dateOfBirth: new Date("1985-06-15"),
  licenseNumber: "DL123456789",
  licenseExpiry: new Date("2025-12-31"),
  insuranceProvider: "State Farm",
  insuranceExpiry: new Date("2024-12-31"),
  vehicleRegistration: "ABC123",
  registrationExpiry: new Date("2024-12-31"),
  isVerified: true,
  verificationStatus: "approved",
  joinedDate: new Date("2023-01-15"),
  totalRides: 1234,
  totalEarnings: 18765.40,
  averageRating: 4.8
};

const SettingsScreen = () => {
  const { theme } = useUI();
  const {
    profile,
    documents,
    vehicles,
    serviceTypes,
    isLoading,
    error
  } = useDriverConfigStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [driverProfile, setDriverProfile] = useState<DriverProfile>(dummyDriverProfile);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoAcceptRides, setAutoAcceptRides] = useState(false);
  const [destinationFilter, setDestinationFilter] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real implementation, fetch from API
    } catch (error) {
      console.error('Error refreshing settings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderProfileSection = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">Profile</Text>
      
      <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/profile' as any)}
          className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700"
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-brand-primary rounded-full items-center justify-center mr-3">
              <Text className="text-white font-JakartaBold text-lg">
                {driverProfile.firstName[0]}{driverProfile.lastName[0]}
              </Text>
            </View>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">
                {driverProfile.firstName} {driverProfile.lastName}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                {driverProfile.email}
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/vehicles' as any)}
          className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">🚗</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">My Vehicles</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Manage your vehicle information
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/documents' as any)}
          className="p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">📄</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Documents</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                License, insurance, registration
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className={`w-3 h-3 rounded-full mr-2 ${
              driverProfile.isVerified ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <Text className="text-gray-400">›</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderServiceTypes = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">Service Types</Text>
      
      <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/service-types' as any)}
          className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">🎯</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Available Services</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                UberX, UberXL, Uber Pet
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/women-only' as any)}
          className="p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">👩</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Women-Only Rides</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Drive for women passengers only
              </Text>
            </View>
          </View>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={false ? '#f4f3f4' : '#f5dd4b'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDrivingPreferences = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">Driving Preferences</Text>
      
      <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <View className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">🤖</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Auto-Accept Rides</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Automatically accept ride requests
              </Text>
            </View>
          </View>
          <Switch
            value={autoAcceptRides}
            onValueChange={setAutoAcceptRides}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={autoAcceptRides ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        
        <View className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">📍</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Destination Filter</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Only receive rides toward your destination
              </Text>
            </View>
          </View>
          <Switch
            value={destinationFilter}
            onValueChange={setDestinationFilter}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={destinationFilter ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/working-hours' as any)}
          className="p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">⏰</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Working Hours</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Set your preferred driving schedule
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAppSettings = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">App Settings</Text>
      
      <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <View className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">🔔</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Notifications</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Ride requests, earnings, promotions
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/notifications' as any)}
          className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">⚙️</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Notification Settings</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Customize notification preferences
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/theme' as any)}
          className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">🎨</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Theme</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Light, Dark, or Auto
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Text className="text-gray-600 dark:text-gray-400 mr-2 capitalize">{theme}</Text>
            <Text className="text-gray-400">›</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/language' as any)}
          className="p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">🌐</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Language</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                English, Español, Français
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Text className="text-gray-600 dark:text-gray-400 mr-2">English</Text>
            <Text className="text-gray-400">›</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaymentSettings = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">Payment & Earnings</Text>
      
      <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/payment-methods' as any)}
          className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">💳</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Payment Methods</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Bank account, debit card
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/tax-settings' as any)}
          className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">📊</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Tax Settings</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Tax documents and settings
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/instant-pay' as any)}
          className="p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">⚡</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Instant Pay</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Get paid instantly after each ride
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSupportSection = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">Support & Help</Text>
      
      <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/help' as any)}
          className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">❓</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Help Center</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                FAQs, guides, and tutorials
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/contact-support' as any)}
          className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">💬</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Contact Support</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Chat, email, or phone support
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/legal' as any)}
          className="p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">📋</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Legal & Privacy</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Terms, privacy policy, data usage
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAccountActions = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">Account</Text>
      
      <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/change-password' as any)}
          className="p-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">🔒</Text>
            <View>
              <Text className="font-JakartaBold text-black dark:text-white">Change Password</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Update your account password
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/(driver)/settings/deactivate-account' as any)}
          className="p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">⚠️</Text>
            <View>
              <Text className="font-JakartaBold text-red-600">Deactivate Account</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Temporarily deactivate your driver account
              </Text>
            </View>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-JakartaBold text-black dark:text-white">Settings</Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderProfileSection()}
        {renderServiceTypes()}
        {renderDrivingPreferences()}
        {renderAppSettings()}
        {renderPaymentSettings()}
        {renderSupportSection()}
        {renderAccountActions()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
