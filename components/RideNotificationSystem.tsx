import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RideRequest {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  distance: number;
  duration: number;
  fare: number;
  passengerName: string;
  passengerRating: number;
  specialRequests?: string[];
}

interface RideNotificationSystemProps {
  visible: boolean;
  rideRequest: RideRequest | null;
  onAccept: (rideId: string) => void;
  onDecline: (rideId: string) => void;
  onClose: () => void;
}

const RideNotificationSystem: React.FC<RideNotificationSystemProps> = ({
  visible,
  rideRequest,
  onAccept,
  onDecline,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds to accept
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (visible && rideRequest) {
      setTimeLeft(15);
      setProgress(100);

      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleAutoDecline();
            return 0;
          }
          const newTime = prevTime - 1;
          setProgress((newTime / 15) * 100);
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [visible, rideRequest]);

  const handleAutoDecline = () => {
    if (rideRequest) {
      onDecline(rideRequest.id);
      onClose();
    }
  };

  const handleAccept = () => {
    if (rideRequest) {
      onAccept(rideRequest.id);
      onClose();
    }
  };

  const handleDecline = () => {
    if (rideRequest) {
      onDecline(rideRequest.id);
      onClose();
    }
  };

  if (!visible || !rideRequest) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <SafeAreaView className="bg-white rounded-t-3xl">
          {/* Header */}
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-xl font-JakartaBold text-center">
              🚨 New Ride Request
            </Text>
          </View>

          {/* Ride Details */}
          <View className="px-6 py-4">
            {/* Passenger Info */}
            <View className="flex-row items-center mb-4">
              <Text className="text-2xl mr-3">👤</Text>
              <View className="flex-1">
                <Text className="font-JakartaBold text-lg">
                  {rideRequest.passengerName}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-yellow-500 mr-1">⭐</Text>
                  <Text className="font-JakartaMedium">
                    {rideRequest.passengerRating}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-xl font-JakartaExtraBold text-primary-500">
                  ${rideRequest.fare}
                </Text>
                <Text className="text-sm text-secondary-600">
                  {rideRequest.distance} mi
                </Text>
              </View>
            </View>

            {/* Route */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-green-500 mr-2">📍</Text>
                <Text className="font-JakartaMedium flex-1" numberOfLines={1}>
                  {rideRequest.pickupAddress}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-red-500 mr-2">🏁</Text>
                <Text className="font-JakartaMedium flex-1" numberOfLines={1}>
                  {rideRequest.dropoffAddress}
                </Text>
              </View>
            </View>

            {/* Trip Details */}
            <View className="flex-row justify-between bg-general-500 rounded-lg p-3 mb-4">
              <View className="items-center">
                <Text className="text-sm text-secondary-600">Distance</Text>
                <Text className="font-JakartaBold">
                  {rideRequest.distance} mi
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-sm text-secondary-600">Time</Text>
                <Text className="font-JakartaBold">
                  {rideRequest.duration} min
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-sm text-secondary-600">Earnings</Text>
                <Text className="font-JakartaBold text-success-500">
                  ${rideRequest.fare}
                </Text>
              </View>
            </View>

            {/* Special Requests */}
            {rideRequest.specialRequests &&
              rideRequest.specialRequests.length > 0 && (
                <View className="mb-4">
                  <Text className="font-JakartaBold mb-2">
                    Special Requests:
                  </Text>
                  {rideRequest.specialRequests.map((request, index) => (
                    <Text key={index} className="text-secondary-600 text-sm">
                      • {request}
                    </Text>
                  ))}
                </View>
              )}

            {/* Timer and Progress */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-JakartaBold">Accept in:</Text>
                <Text className="font-JakartaBold text-lg">{timeLeft}s</Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-3">
                <View
                  className="bg-primary-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-6 pb-6">
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={handleDecline}
                className="flex-1 bg-danger-500 rounded-full py-4 items-center"
              >
                <Text className="text-white font-JakartaBold text-lg">
                  Decline
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAccept}
                className="flex-1 bg-success-500 rounded-full py-4 items-center"
              >
                <Text className="text-white font-JakartaBold text-lg">
                  Accept Ride
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default RideNotificationSystem;

