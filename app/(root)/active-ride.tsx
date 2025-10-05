import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

import ChatModal from "@/components/ChatModal";
import CustomButton from "@/components/CustomButton";
import Map from "@/components/Map";
import RideProgressBar from "@/components/RideProgressBar";
import { icons } from "@/constants";
import {
  DARK_MODERN_STYLE,
  type MapConfiguration,
} from "@/constants/mapStyles";

type RideStatus =
  | "driver_en_route"
  | "driver_arrived"
  | "in_progress"
  | "completed";

const ActiveRide = () => {
  const [rideStatus, setRideStatus] = useState<RideStatus>("driver_en_route");
  const [showChat, setShowChat] = useState(false);
  const [progress, setProgress] = useState(20);

  // Mock data - in real app this would come from props/state
  const rideData = {
    driverName: "Sarah Johnson",
    driverImage:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
    vehicle: "Toyota Camry 2020",
    licensePlate: "ABC-123",
    rating: 4.9,
    estimatedTime: "2 min",
    distance: "0.8 miles",
  };

  const chatMessages = [
    {
      id: "1",
      senderId: "driver",
      senderName: "Sarah",
      message: "Hi! I'm on my way to pick you up.",
      timestamp: new Date(Date.now() - 300000),
      isOwnMessage: false,
      messageType: "text" as const,
    },
    {
      id: "2",
      senderId: "user",
      senderName: "You",
      message: "Great! I'll be waiting outside.",
      timestamp: new Date(Date.now() - 240000),
      isOwnMessage: true,
      messageType: "text" as const,
    },
  ];

  const getStatusInfo = () => {
    switch (rideStatus) {
      case "driver_en_route":
        return {
          title: "Driver is arriving",
          subtitle: `Arriving in ${rideData.estimatedTime}`,
          progress: 20,
          actionText: "Cancel Ride",
        };
      case "driver_arrived":
        return {
          title: "Driver has arrived",
          subtitle: "Your driver is waiting outside",
          progress: 50,
          actionText: "I'm Ready - Start Ride",
        };
      case "in_progress":
        return {
          title: "Trip in progress",
          subtitle: "1.2 miles • 5 min remaining",
          progress: 75,
          actionText: "Emergency",
        };
      default:
        return {
          title: "Trip completed",
          subtitle: "Thank you for riding with us!",
          progress: 100,
          actionText: "Rate Driver",
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleAction = () => {
    switch (rideStatus) {
      case "driver_en_route":
        // Cancel ride logic
        
        break;
      case "driver_arrived":
        setRideStatus("in_progress");
        setProgress(75);
        break;
      case "in_progress":
        // Emergency logic
        
        break;
      case "completed":
        router.push("/(root)/payment-method" as any);
        break;
    }
  };

  const handleSendMessage = (message: string) => {
    
    // Here you would send the message to the driver
  };

  // 🎨 Configuración del mapa con tema dark moderno
  const mapConfig: Partial<MapConfiguration> = {
    theme: "dark",
    customStyle: DARK_MODERN_STYLE,
    userInterfaceStyle: "dark",
    mapType: "standard",
    showsUserLocation: true,
    showsPointsOfInterest: false,
    showsBuildings: true,
    showsTraffic: false,
    showsCompass: true,
    showsScale: false,
    showsMyLocationButton: false,
    zoomEnabled: true,
    scrollEnabled: true,
    rotateEnabled: true,
    pitchEnabled: true,
    tintColor: "#00FF88",
    routeColor: "#4285F4",
    trailColor: "#FFE014",
    predictionColor: "#00FF88",
  };

  return (
    <View className="flex-1 bg-general-500">
      {/* Map - 60% of screen */}
      <View className="flex-1 relative">
        <Map mapConfig={mapConfig} />

        {/* Status overlay on map */}
        <View className="absolute top-12 left-4 right-4 z-10">
          <View className="bg-white rounded-lg p-4 shadow-lg">
            <Text className="text-lg font-JakartaBold mb-2">
              {statusInfo.title}
            </Text>
            <Text className="text-sm text-gray-600">{statusInfo.subtitle}</Text>
          </View>
        </View>

        {/* Emergency button overlay */}
        <View className="absolute bottom-32 right-4 z-10">
          <TouchableOpacity className="bg-red-500 w-14 h-14 rounded-full items-center justify-center shadow-lg">
            <Text className="text-white font-JakartaBold text-lg">🚨</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet - 40% of screen */}
      <View className="bg-white rounded-t-3xl p-6" style={{ height: "40%" }}>
        {/* Driver Info */}
        <View className="flex-row items-center mb-4">
          {rideData.driverImage && (
            <Image
              source={{ uri: rideData.driverImage }}
              className="w-12 h-12 rounded-full mr-3"
            />
          )}
          <View className="flex-1">
            <Text className="font-JakartaBold text-base">
              {rideData.driverName}
            </Text>
            <View className="flex-row items-center">
              <Image
                source={icons.star}
                className="w-4 h-4 tint-yellow-400 mr-1"
              />
              <Text className="text-sm text-gray-600 mr-2">
                {rideData.rating}
              </Text>
              <Text className="text-sm text-gray-600">{rideData.vehicle}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setShowChat(true)}
              className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center"
            >
              <Image source={icons.chat} className="w-5 h-5" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
              <Image source={icons.phone} className="w-5 h-5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Bar */}
        <RideProgressBar
          progress={statusInfo.progress}
          status={statusInfo.title}
          estimatedTime={rideData.estimatedTime}
          className="mb-4"
        />

        {/* Trip Info */}
        {rideStatus === "in_progress" && (
          <View className="bg-gray-50 rounded-lg p-3 mb-4">
            <Text className="text-sm font-JakartaMedium text-gray-700 mb-1">
              Current location: Downtown Ave & 5th St
            </Text>
            <Text className="text-sm text-gray-600">
              Destination: Mall Plaza • {rideData.distance} remaining
            </Text>
          </View>
        )}

        {/* Main Action Button */}
        <CustomButton
          title={statusInfo.actionText}
          onPress={handleAction}
          className="mb-4"
          bgVariant={rideStatus === "in_progress" ? "danger" : "primary"}
        />

        {/* Additional Info */}
        <View className="flex-row justify-between text-xs text-gray-500">
          <Text>Ride ID: #12345</Text>
          <Text>Trip cost: $4.75</Text>
        </View>
      </View>

      {/* Chat Modal */}
      <ChatModal
        visible={showChat}
        onClose={() => setShowChat(false)}
        driverName={rideData.driverName}
        driverImage={rideData.driverImage}
        rideId="12345"
        onSendMessage={handleSendMessage}
        messages={chatMessages}
        isTyping={false}
      />
    </View>
  );
};

export default ActiveRide;
