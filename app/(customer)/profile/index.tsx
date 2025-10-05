import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/common';
import { Card, Badge } from '@/components/ui';
import { useProfileData, useVerificationBadge, useProfileActions } from '@/store/profile';
import { initializeProfileWithMockData } from '@/lib/profileData';

// Icons (you can replace with your icon system)
const icons = {
  edit: '✏️',
  email: '📧',
  phone: '📱',
  location: '📍',
  verify: '🆔',
  theme: '🌙',
  language: '🌍',
  wallet: '💳',
  addresses: '🏠',
  privacy: '🔒',
  logout: '🚪',
  settings: '⚙️',
};

export default function ProfileScreen() {
  const profileData = useProfileData();
  const verificationBadge = useVerificationBadge();
  const { refreshProfile, setProfileData } = useProfileActions();

  useEffect(() => {
    // Initialize profile data if not exists
    if (!profileData) {
      const mockData = initializeProfileWithMockData();
      setProfileData(mockData);
    }
  }, []);

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const getVerificationBadgeColor = () => {
    switch (verificationBadge.color) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getVerificationText = () => {
    switch (verificationBadge.status) {
      case 'verified':
        return '✅ Verified Account';
      case 'pending':
        return '⏳ Verification Pending';
      default:
        return '⚠️ Not Verified';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppHeader
        title="Profile"
        showBackButton={true}
        rightIcon={icons.settings}
        onRightPress={() => handleNavigation('/(customer)/profile/preferences')}
      />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center py-6 px-4">
          {/* Profile Image */}
          <View className="relative mb-4">
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
              {profileData?.profileImage ? (
                <Image
                  source={{ uri: profileData.profileImage }}
                  className="w-24 h-24 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-4xl text-gray-400">👤</Text>
              )}
            </View>
          </View>

          {/* User Info */}
          <Text className="text-2xl font-Jakarta-Bold text-gray-800 mb-1">
            {profileData?.firstName} {profileData?.lastName}
          </Text>
          <Text className="text-base font-Jakarta-Medium text-gray-600 mb-3">
            {profileData?.email}
          </Text>

          {/* Verification Status Badge */}
          <View className={`px-4 py-2 rounded-full ${getVerificationBadgeColor()}`}>
            <Text className="text-white font-Jakarta-SemiBold text-sm">
              {getVerificationText()}
            </Text>
          </View>
        </View>

        {/* Personal Information Section */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
            Personal Information
          </Text>
          
          <Card className="p-0 overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={() => handleNavigation('/(customer)/profile/edit-basic-info')}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-xl mr-3">{icons.edit}</Text>
                <View className="flex-1">
                  <Text className="font-Jakarta-SemiBold text-gray-800">
                    Edit Basic Info
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Name, date of birth, gender
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xl">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={() => handleNavigation('/(customer)/profile/change-email')}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-xl mr-3">{icons.email}</Text>
                <View className="flex-1">
                  <Text className="font-Jakarta-SemiBold text-gray-800">
                    Change Email
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {profileData?.email}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xl">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={() => handleNavigation('/(customer)/profile/change-phone')}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-xl mr-3">{icons.phone}</Text>
                <View className="flex-1">
                  <Text className="font-Jakarta-SemiBold text-gray-800">
                    Change Phone
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {profileData?.phone || 'Not set'}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xl">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={() => handleNavigation('/(customer)/profile/change-location')}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-xl mr-3">{icons.location}</Text>
                <View className="flex-1">
                  <Text className="font-Jakarta-SemiBold text-gray-800">
                    Change Location
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {profileData?.city}, {profileData?.state}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xl">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => handleNavigation('/(customer)/profile/verify-account')}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-xl mr-3">{icons.verify}</Text>
                <View className="flex-1">
                  <Text className="font-Jakarta-SemiBold text-gray-800">
                    Verify Account
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Upload ID documents
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xl">→</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Preferences Section */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
            Preferences
          </Text>
          
          <Card className="p-0 overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={() => handleNavigation('/(customer)/profile/preferences')}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-xl mr-3">{icons.theme}</Text>
                <View className="flex-1">
                  <Text className="font-Jakarta-SemiBold text-gray-800">
                    Theme & Settings
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Dark mode, language, notifications
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xl">→</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Services Section */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
            Services
          </Text>
          
          <Card className="p-0 overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={() => handleNavigation('/(customer)/wallet')}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-xl mr-3">{icons.wallet}</Text>
                <View className="flex-1">
                  <Text className="font-Jakarta-SemiBold text-gray-800">
                    Wallet
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Payment methods, transactions
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xl">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => handleNavigation('/(customer)/profile/addresses')}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-xl mr-3">{icons.addresses}</Text>
                <View className="flex-1">
                  <Text className="font-Jakarta-SemiBold text-gray-800">
                    My Addresses
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Home, work, gym locations
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xl">→</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Account Section */}
        <View className="px-4 mb-8">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
            Account
          </Text>
          
          <Card className="p-0 overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={() => handleNavigation('/(customer)/privacy')}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-xl mr-3">{icons.privacy}</Text>
                <View className="flex-1">
                  <Text className="font-Jakarta-SemiBold text-gray-800">
                    Privacy Settings
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Data privacy, security
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xl">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => {
                // Handle logout
                console.log('Logout pressed');
              }}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-xl mr-3">{icons.logout}</Text>
                <View className="flex-1">
                  <Text className="font-Jakarta-SemiBold text-red-600">
                    Logout
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Sign out of your account
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xl">→</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
