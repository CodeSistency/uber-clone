import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "../../../components/CustomButton";
import DrawerContent, { HamburgerMenu } from "../../components/DrawerContent";
import RideNotificationSystem from "../../../components/RideNotificationSystem";
import GPSNavigationView from "../../../components/GPSNavigationView";
import EarningsTracker from "../../../components/EarningsTracker";
import VehicleChecklist from "../../../components/VehicleChecklist";
import PerformanceDashboard from "../../../components/PerformanceDashboard";

// Enhanced dummy data for testing
const DUMMY_STATS = {
  todayEarnings: 142.30,
  todayTrips: 9,
  rating: 4.8,
  onlineStatus: true,
  onlineHours: 6.5,
  weeklyEarnings: 892.50,
  monthlyEarnings: 3456.75,
};

const DUMMY_ACTIVE_RIDE = {
  id: "RIDE_001",
  pickupAddress: "123 Main St, Downtown",
  dropoffAddress: "456 Broadway Ave, Uptown",
  passengerName: "John Doe",
  fare: 18.5,
  distance: 3.2,
  duration: 15, // minutes
  latitude: 37.7749,
  longitude: -122.4194,
};

const MOCK_PERFORMANCE_DATA = {
  weeklyEarnings: 892.50,
  weeklyTrips: 67,
  avgRating: 4.8,
  onlineHours: 45,
  bestDay: 'Saturday',
  peakHours: ['6PM', '9PM'],
  topPerformingHours: ['7PM', '9PM'],
  recommendations: [
    'Stay online during peak hours (6PM - 9PM)',
    'Focus on high-demand areas downtown',
    'Maintain 4.8+ rating for better trip matching',
    'Consider driving during weekends for higher earnings'
  ]
};

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(DUMMY_STATS.onlineStatus);
  const [hasActiveRide] = useState(false); // For testing purposes
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState<
    "customer" | "driver" | "business"
  >("driver");

  // New state for enhanced features
  const [showRideNotification, setShowRideNotification] = useState(false);
  const [showGPSNavigation, setShowGPSNavigation] = useState(false);
  const [showEarningsTracker, setShowEarningsTracker] = useState(false);
  const [showVehicleChecklist, setShowVehicleChecklist] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [mockRideRequest, setMockRideRequest] = useState<any>(null);

  // Load current mode from AsyncStorage
  useEffect(() => {
    const loadCurrentMode = async () => {
      try {
        const savedMode = (await AsyncStorage.getItem("user_mode")) as
          | "customer"
          | "driver"
          | "business"
          | null;
        if (savedMode) {
          setCurrentMode(savedMode);
        }
      } catch (error) {
        console.error("Error loading current mode:", error);
      }
    };
    loadCurrentMode();
  }, []);

  // Function to handle mode changes from drawer
  const handleModeChange = (newMode: "customer" | "driver" | "business") => {
    console.log("Mode changed from driver dashboard to:", newMode);
    setCurrentMode(newMode);
    setDrawerVisible(false);
  };

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    Alert.alert(
      "Status Updated",
      `You are now ${!isOnline ? "online" : "offline"}`,
    );
  };

  const handleAcceptRide = () => {
    // For now, just show an alert since the active ride view doesn't exist yet
    Alert.alert(
      "Ride Started",
      "You have started the ride. Navigation would begin now.",
    );
  };

  // Enhanced handlers for new features
  const handleTestRideNotification = () => {
    const mockRide = {
      id: "RIDE_123",
      pickupAddress: "456 Oak St, Midtown",
      dropoffAddress: "789 Pine Ave, Downtown",
      distance: 2.1,
      duration: 12,
      fare: 15.50,
      passengerName: "Sarah Johnson",
      passengerRating: 4.9,
      specialRequests: ["Quiet ride preferred", "No smoking"]
    };
    setMockRideRequest(mockRide);
    setShowRideNotification(true);
  };

  const handleRideAccepted = (rideId: string) => {
    console.log("[DriverDashboard] Ride accepted:", rideId);
    Alert.alert(
      "Ride Accepted! 🎉",
      "Starting navigation to pickup location...",
      [
        {
          text: "Start Navigation",
          onPress: () => {
            setShowGPSNavigation(true);
          }
        }
      ]
    );
  };

  const handleRideDeclined = (rideId: string) => {
    console.log("[DriverDashboard] Ride declined:", rideId);
  };

  const handleVehicleCheckComplete = () => {
    console.log("[DriverDashboard] Vehicle check completed");
    Alert.alert(
      "Ready to Drive! 🚗",
      "Your vehicle is ready. You can now accept rides.",
      [{ text: "OK" }]
    );
  };

  const handleArrivedAtPickup = () => {
    console.log("[DriverDashboard] Arrived at pickup");
    setShowGPSNavigation(false);
    Alert.alert(
      "Arrived at Pickup 📍",
      "Please wait for the passenger to board.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-primary dark:bg-brand-primaryDark">
      {/* Header with Hamburger Menu and Online Toggle */}
      <View className="flex-row items-center justify-between p-5 bg-white dark:bg-brand-primary">
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
          <Text className="text-xl font-JakartaBold text-black dark:text-white">Driver Dashboard</Text>
        </View>
        <TouchableOpacity
          onPress={handleToggleOnline}
          className={`px-4 py-2 rounded-full ${isOnline ? "bg-success-500" : "bg-danger-500"}`}
        >
          <Text className="text-white font-JakartaBold">
            {isOnline ? "Online" : "Offline"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Drawer Modal */}
      <DrawerContent
        visible={drawerVisible}
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onClose={() => {
          console.log("Driver drawer closed");
          setDrawerVisible(false);
        }}
      />

      <ScrollView className="flex-1 px-5">
        {/* Quick Stats */}
        <View className="bg-white dark:bg-brand-primary rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3 text-black dark:text-white">Today's Summary</Text>
          <View className="flex-row justify-between mb-2">
            <View className="items-center">
              <Text className="text-2xl font-JakartaExtraBold text-brand-secondary">
                ${DUMMY_STATS.todayEarnings}
              </Text>
              <Text className="text-sm text-secondary-600 dark:text-gray-300">Earnings</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-JakartaExtraBold text-success-500">
                {DUMMY_STATS.todayTrips}
              </Text>
              <Text className="text-sm text-secondary-600 dark:text-gray-300">Trips</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-JakartaExtraBold text-warning-500">
                {DUMMY_STATS.rating}
              </Text>
              <Text className="text-sm text-secondary-600 dark:text-gray-300">Rating</Text>
            </View>
          </View>
        </View>

        {/* Active Ride Card */}
        {hasActiveRide && (
          <View className="bg-white dark:bg-brand-primary rounded-lg p-4 mb-4">
            <Text className="text-lg font-JakartaBold mb-3 text-primary-500">
              🚗 Active Ride
            </Text>
            <View className="mb-3">
              <Text className="text-sm text-secondary-600 mb-1">From</Text>
              <Text className="font-JakartaMedium">
                {DUMMY_ACTIVE_RIDE.pickupAddress}
              </Text>
            </View>
            <View className="mb-3">
              <Text className="text-sm text-secondary-600 mb-1">To</Text>
              <Text className="font-JakartaMedium">
                {DUMMY_ACTIVE_RIDE.dropoffAddress}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm text-secondary-600">Passenger</Text>
                <Text className="font-JakartaBold">
                  {DUMMY_ACTIVE_RIDE.passengerName}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-lg font-JakartaExtraBold text-success-500">
                  ${DUMMY_ACTIVE_RIDE.fare}
                </Text>
                <Text className="text-sm text-secondary-600">
                  {DUMMY_ACTIVE_RIDE.distance} mi
                </Text>
              </View>
            </View>
            <CustomButton
              title="View Ride Details"
              onPress={handleAcceptRide}
              className="mt-4"
            />
          </View>
        )}

        {/* Enhanced Quick Actions */}
        <View className="bg-white dark:bg-brand-primary rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3 text-black dark:text-white">🚀 Enhanced Features</Text>
          <View className="space-y-3">
            <TouchableOpacity
              onPress={handleTestRideNotification}
              className="flex-row items-center p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg"
            >
              <Text className="text-lg mr-3">🔔</Text>
              <View className="flex-1">
                <Text className="font-JakartaBold text-primary-500">Test Ride Notification</Text>
                <Text className="text-sm text-primary-600">Try the new notification system</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowEarningsTracker(!showEarningsTracker)}
              className="flex-row items-center p-3 bg-success-500/10 border border-success-500/20 rounded-lg"
            >
              <Text className="text-lg mr-3">💰</Text>
              <View className="flex-1">
                <Text className="font-JakartaBold text-success-500">Earnings Tracker</Text>
                <Text className="text-sm text-success-600">Real-time earnings dashboard</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowVehicleChecklist(true)}
              className="flex-row items-center p-3 bg-warning-500/10 border border-warning-500/20 rounded-lg"
            >
              <Text className="text-lg mr-3">🚗</Text>
              <View className="flex-1">
                <Text className="font-JakartaBold text-warning-500">Vehicle Checklist</Text>
                <Text className="text-sm text-warning-600">Pre-ride vehicle preparation</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPerformanceDashboard(true)}
              className="flex-row items-center p-3 bg-secondary-500/10 border border-secondary-500/20 rounded-lg"
            >
              <Text className="text-lg mr-3">📊</Text>
              <View className="flex-1">
                <Text className="font-JakartaBold text-secondary-500">Performance Analytics</Text>
                <Text className="text-sm text-secondary-600">Weekly insights & recommendations</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Traditional Actions */}
        <View className="bg-white dark:bg-brand-primary rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3 text-black dark:text-white">Classic Actions</Text>
          <View className="space-y-3">
            <TouchableOpacity
              onPress={() => router.push("/(driver)/ride-requests" as any)}
              className="flex-row items-center p-3 bg-general-500 rounded-lg"
            >
              <Text className="text-lg mr-3">🚕</Text>
              <Text className="font-JakartaMedium">View Ride Requests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(driver)/earnings" as any)}
              className="flex-row items-center p-3 bg-general-500 rounded-lg"
            >
              <Text className="text-lg mr-3">💰</Text>
              <Text className="font-JakartaMedium">Earnings & History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(driver)/profile" as any)}
              className="flex-row items-center p-3 bg-general-500 rounded-lg"
            >
              <Text className="text-lg mr-3">👤</Text>
              <Text className="font-JakartaMedium">Profile & Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Toggle */}
        <View className="bg-white dark:bg-brand-primary rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3 text-black dark:text-white">Service Type</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="flex-1 mr-2 p-3 bg-brand-secondary rounded-lg items-center">
              <Text className="text-black font-JakartaBold">Rides Only</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 ml-2 p-3 bg-general-500 rounded-lg items-center">
              <Text className="text-secondary-700 font-JakartaBold">
                All Services
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Earnings Tracker Modal */}
        {showEarningsTracker && (
          <Modal
            visible={showEarningsTracker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowEarningsTracker(false)}
          >
            <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white dark:bg-brand-primary rounded-t-3xl max-h-96">
                <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-brand-primaryDark">
                  <Text className="text-lg font-JakartaBold text-black dark:text-white">💰 Earnings Tracker</Text>
                  <TouchableOpacity
                    onPress={() => setShowEarningsTracker(false)}
                    className="w-8 h-8 items-center justify-center"
                  >
                    <Text className="text-xl text-black dark:text-white">✕</Text>
                  </TouchableOpacity>
                </View>
                <EarningsTracker
                  isVisible={true}
                  earnings={{
                    todayEarnings: DUMMY_STATS.todayEarnings,
                    todayTrips: DUMMY_STATS.todayTrips,
                    currentTripEarnings: 0,
                    totalEarnings: DUMMY_STATS.weeklyEarnings,
                    weeklyEarnings: DUMMY_STATS.weeklyEarnings,
                    monthlyEarnings: DUMMY_STATS.monthlyEarnings,
                    rating: DUMMY_STATS.rating,
                    onlineHours: DUMMY_STATS.onlineHours,
                  }}
                  currentRide={hasActiveRide ? DUMMY_ACTIVE_RIDE : null}
                />
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>

      {/* Full Screen Modals */}
      <RideNotificationSystem
        visible={showRideNotification}
        rideRequest={mockRideRequest}
        onAccept={handleRideAccepted}
        onDecline={handleRideDeclined}
        onClose={() => setShowRideNotification(false)}
      />

      <Modal
        visible={showGPSNavigation}
        animationType="slide"
        onRequestClose={() => setShowGPSNavigation(false)}
      >
        <GPSNavigationView
          destinationLatitude={DUMMY_ACTIVE_RIDE.latitude}
          destinationLongitude={DUMMY_ACTIVE_RIDE.longitude}
          destinationAddress={DUMMY_ACTIVE_RIDE.pickupAddress}
          onArrived={handleArrivedAtPickup}
          onClose={() => setShowGPSNavigation(false)}
        />
      </Modal>

      <Modal
        visible={showVehicleChecklist}
        animationType="slide"
        onRequestClose={() => setShowVehicleChecklist(false)}
      >
        <VehicleChecklist
          isVisible={showVehicleChecklist}
          onComplete={handleVehicleCheckComplete}
          onClose={() => setShowVehicleChecklist(false)}
        />
      </Modal>

      <Modal
        visible={showPerformanceDashboard}
        animationType="slide"
        onRequestClose={() => setShowPerformanceDashboard(false)}
      >
        <PerformanceDashboard
          isVisible={showPerformanceDashboard}
          performance={MOCK_PERFORMANCE_DATA}
          onClose={() => setShowPerformanceDashboard(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};

export default DriverDashboard;
