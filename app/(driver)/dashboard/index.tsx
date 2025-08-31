import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../../../components/CustomButton';
import DrawerContent, { HamburgerMenu } from '../../components/DrawerContent';

// Dummy data for testing
const DUMMY_STATS = {
  todayEarnings: 45.75,
  todayTrips: 3,
  rating: 4.8,
  onlineStatus: false
};

const DUMMY_ACTIVE_RIDE = {
  id: 'RIDE_001',
  pickupAddress: '123 Main St, Downtown',
  dropoffAddress: '456 Broadway Ave, Uptown',
  passengerName: 'John Doe',
  fare: 18.50,
  distance: 3.2
};

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(DUMMY_STATS.onlineStatus);
  const [hasActiveRide] = useState(true); // For testing purposes
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState<'customer' | 'driver' | 'business'>('driver');

  // Load current mode from AsyncStorage
  useEffect(() => {
    const loadCurrentMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('user_mode') as 'customer' | 'driver' | 'business' | null;
        if (savedMode) {
          setCurrentMode(savedMode);
        }
      } catch (error) {
        console.error('Error loading current mode:', error);
      }
    };
    loadCurrentMode();
  }, []);

  // Function to handle mode changes from drawer
  const handleModeChange = (newMode: 'customer' | 'driver' | 'business') => {
    console.log('Mode changed from driver dashboard to:', newMode);
    setCurrentMode(newMode);
    setDrawerVisible(false);
  };

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    Alert.alert('Status Updated', `You are now ${!isOnline ? 'online' : 'offline'}`);
  };

  const handleAcceptRide = () => {
    // For now, just show an alert since the active ride view doesn't exist yet
    Alert.alert('Ride Started', 'You have started the ride. Navigation would begin now.');
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header with Hamburger Menu and Online Toggle */}
      <View className="flex-row items-center justify-between p-5 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => setDrawerVisible(true)}
            className="mr-3"
          >
            <View className="w-8 h-8 items-center justify-center">
              <View className="flex-col space-y-1">
                <View className="w-5 h-0.5 bg-primary-500 rounded-full" />
                <View className="w-5 h-0.5 bg-primary-500 rounded-full" />
                <View className="w-5 h-0.5 bg-primary-500 rounded-full" />
              </View>
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-JakartaBold">Driver Dashboard</Text>
        </View>
        <TouchableOpacity
          onPress={handleToggleOnline}
          className={`px-4 py-2 rounded-full ${isOnline ? 'bg-success-500' : 'bg-danger-500'}`}
        >
          <Text className="text-white font-JakartaBold">
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Drawer Modal */}
      <DrawerContent
        visible={drawerVisible}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onClose={() => {
          console.log('Driver drawer closed');
          setDrawerVisible(false);
        }}
      />

      <ScrollView className="flex-1 px-5">
        {/* Quick Stats */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Today's Summary</Text>
          <View className="flex-row justify-between mb-2">
            <View className="items-center">
              <Text className="text-2xl font-JakartaExtraBold text-primary-500">
                ${DUMMY_STATS.todayEarnings}
              </Text>
              <Text className="text-sm text-secondary-600">Earnings</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-JakartaExtraBold text-success-500">
                {DUMMY_STATS.todayTrips}
              </Text>
              <Text className="text-sm text-secondary-600">Trips</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-JakartaExtraBold text-warning-500">
                {DUMMY_STATS.rating}
              </Text>
              <Text className="text-sm text-secondary-600">Rating</Text>
            </View>
          </View>
        </View>

        {/* Active Ride Card */}
        {hasActiveRide && (
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-JakartaBold mb-3 text-primary-500">
              🚗 Active Ride
            </Text>
            <View className="mb-3">
              <Text className="text-sm text-secondary-600 mb-1">From</Text>
              <Text className="font-JakartaMedium">{DUMMY_ACTIVE_RIDE.pickupAddress}</Text>
            </View>
            <View className="mb-3">
              <Text className="text-sm text-secondary-600 mb-1">To</Text>
              <Text className="font-JakartaMedium">{DUMMY_ACTIVE_RIDE.dropoffAddress}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm text-secondary-600">Passenger</Text>
                <Text className="font-JakartaBold">{DUMMY_ACTIVE_RIDE.passengerName}</Text>
              </View>
              <View className="items-end">
                <Text className="text-lg font-JakartaExtraBold text-success-500">
                  ${DUMMY_ACTIVE_RIDE.fare}
                </Text>
                <Text className="text-sm text-secondary-600">{DUMMY_ACTIVE_RIDE.distance} mi</Text>
              </View>
            </View>
            <CustomButton
              title="View Ride Details"
              onPress={handleAcceptRide}
              className="mt-4"
            />
          </View>
        )}

        {/* Quick Actions */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Quick Actions</Text>
          <View className="space-y-3">
            <TouchableOpacity
              onPress={() => router.push('/(driver)/ride-requests' as any)}
              className="flex-row items-center p-3 bg-general-500 rounded-lg"
            >
              <Text className="text-lg mr-3">🚕</Text>
              <Text className="font-JakartaMedium">View Ride Requests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(driver)/earnings' as any)}
              className="flex-row items-center p-3 bg-general-500 rounded-lg"
            >
              <Text className="text-lg mr-3">💰</Text>
              <Text className="font-JakartaMedium">Earnings & History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(driver)/profile' as any)}
              className="flex-row items-center p-3 bg-general-500 rounded-lg"
            >
              <Text className="text-lg mr-3">👤</Text>
              <Text className="font-JakartaMedium">Profile & Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Toggle */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Service Type</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="flex-1 mr-2 p-3 bg-primary-500 rounded-lg items-center">
              <Text className="text-white font-JakartaBold">Rides Only</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 ml-2 p-3 bg-general-500 rounded-lg items-center">
              <Text className="text-secondary-700 font-JakartaBold">All Services</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverDashboard;
