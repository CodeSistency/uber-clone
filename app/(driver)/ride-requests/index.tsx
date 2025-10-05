import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import { fetchAPI, useFetch } from "@/lib/fetch";
import { useUserStore } from "@/store";

interface RideRequest {
  ride_id: number;
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  ride_time: number;
  fare_price: number;
  created_at: string;
  tier_name?: string;
  tier_image?: string;
}

const RideRequests = () => {
  const { user } = useUserStore();
  const [acceptingRide, setAcceptingRide] = useState<string | null>(null);

  // Fetch available ride requests from API
  // NOTE: This endpoint needs to be implemented in backend
  const {
    data: rideRequests,
    loading,
    error,
    refetch,
  } = useFetch<RideRequest[]>("ride/requests");

  const handleAcceptRide = async (rideId: string) => {
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    setAcceptingRide(rideId);

    try {
      

      const response = await fetchAPI(`ride/${rideId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driverId: user.id,
        }),
      });

      

      if (response?.success) {
        Alert.alert(
          "Ride Accepted!",
          "You have 2 minutes to pick up the passenger.",
          [
            {
              text: "Start Ride",
              onPress: () => {
                // Navigate to active ride screen
                router.push(`/driver/active-ride/${rideId}` as any);
                setAcceptingRide(null);
              },
            },
          ],
        );
      } else {
        throw new Error(response?.message || "Failed to accept ride");
      }
    } catch (error: any) {
      
      Alert.alert("Error", error.message || "Failed to accept ride");
      setAcceptingRide(null);
    }
  };

  const handleDeclineRide = (rideId: string) => {
    Alert.alert("Decline Ride", "Are you sure you want to decline this ride?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Decline",
        style: "destructive",
        onPress: () => {
          // For now, just remove from local state
          // In the future, this could call an API to mark as declined
          
          refetch(); // Refresh the list
        },
      },
    ]);
  };

  // Calculate time ago from created_at
  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 min ago";
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Available Rides</Text>
        <Text className="text-secondary-600 mt-1">
          {loading
            ? "Loading rides..."
            : error
              ? "Error loading rides"
              : `${rideRequests?.length || 0} ride${(rideRequests?.length || 0) !== 1 ? "s" : ""} available`}
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-6xl mb-4">🔄</Text>
            <Text className="text-xl font-JakartaBold text-center mb-2">
              Loading rides...
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-6xl mb-4">❌</Text>
            <Text className="text-xl font-JakartaBold text-center mb-2">
              Error loading rides
            </Text>
            <Text className="text-secondary-600 text-center mb-4">{error}</Text>
            <TouchableOpacity
              onPress={refetch}
              className="bg-primary-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-JakartaBold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : !rideRequests || rideRequests.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-6xl mb-4">🚕</Text>
            <Text className="text-xl font-JakartaBold text-center mb-2">
              No rides available
            </Text>
            <Text className="text-secondary-600 text-center">
              New ride requests will appear here when available
            </Text>
          </View>
        ) : (
          rideRequests.map((ride) => (
            <View key={ride.ride_id} className="bg-white rounded-lg p-4 mb-4">
              {/* Ride Header */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-JakartaBold text-primary-500">
                  ${ride.fare_price / 100}
                </Text>
                <Text className="text-sm text-secondary-600">
                  {getTimeAgo(ride.created_at)}
                </Text>
              </View>

              {/* Route */}
              <View className="mb-3">
                <View className="flex-row items-center mb-2">
                  <Text className="text-green-500 mr-2">📍</Text>
                  <Text className="font-JakartaMedium flex-1" numberOfLines={1}>
                    {ride.origin_address}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-red-500 mr-2">🏁</Text>
                  <Text className="font-JakartaMedium flex-1" numberOfLines={1}>
                    {ride.destination_address}
                  </Text>
                </View>
              </View>

              {/* Ride Details */}
              <View className="flex-row justify-between mb-4 bg-general-500 rounded-lg p-3">
                <View className="items-center">
                  <Text className="text-sm text-secondary-600">Distance</Text>
                  <Text className="font-JakartaBold">
                    {/* Calculate approximate distance */}~
                    {Math.round(ride.ride_time * 0.3)} mi
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-sm text-secondary-600">Time</Text>
                  <Text className="font-JakartaBold">{ride.ride_time} min</Text>
                </View>
                <View className="items-center">
                  <Text className="text-sm text-secondary-600">Tier</Text>
                  <Text className="font-JakartaBold">
                    {ride.tier_name || "Standard"}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => handleDeclineRide(ride.ride_id.toString())}
                  className="flex-1 bg-danger-500 rounded-full py-3 items-center"
                  disabled={acceptingRide === ride.ride_id.toString()}
                >
                  <Text className="text-white font-JakartaBold">Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleAcceptRide(ride.ride_id.toString())}
                  className={`flex-1 bg-success-500 rounded-full py-3 items-center ${
                    acceptingRide === ride.ride_id.toString()
                      ? "opacity-50"
                      : ""
                  }`}
                  disabled={acceptingRide === ride.ride_id.toString()}
                >
                  <Text className="text-white font-JakartaBold">
                    {acceptingRide === ride.ride_id.toString()
                      ? "Accepting..."
                      : "Accept"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RideRequests;
