import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

const VEHICLE_TYPES = [
  {
    id: "standard",
    name: "Standard Car",
    description: "Most common",
    icon: "🚗",
  },
  { id: "suv", name: "SUV/Van", description: "Extra space", icon: "🚐" },
  { id: "motorcycle", name: "Motorcycle", description: "Quick", icon: "🏍️" },
  { id: "bike", name: "Bike/Scooter", description: "Eco-friendly", icon: "🚲" },
];

const SERVICE_LEVELS = [
  { id: "economy", name: "Economy", description: "Affordable", price: "$2.50" },
  { id: "comfort", name: "Comfort", description: "More space", price: "$4.00" },
  { id: "premium", name: "Premium", description: "Luxury", price: "$6.00" },
];

export default function TravelPreferences() {
  console.log("[TravelPreferences] Rendering travel preferences");

  const {
    currentStep,
    progress,
    userData,
    updateUserData,
    nextStep,
    previousStep,
    setLoading,
    setError,
    isLoading,
  } = useOnboardingStore();

  const [preferences, setPreferences] = useState({
    preferredVehicleType: userData.preferredVehicleType || "",
    preferredServiceLevel: userData.preferredServiceLevel || "",
  });

  const handleVehicleSelect = (vehicleType: string) => {
    console.log("[TravelPreferences] Selected vehicle type:", vehicleType);
    setPreferences((prev) => ({ ...prev, preferredVehicleType: vehicleType }));
  };

  const handleServiceSelect = (serviceLevel: string) => {
    console.log("[TravelPreferences] Selected service level:", serviceLevel);
    setPreferences((prev) => ({
      ...prev,
      preferredServiceLevel: serviceLevel,
    }));
  };

  const handleContinue = async () => {
    if (
      !preferences.preferredVehicleType ||
      !preferences.preferredServiceLevel
    ) {
      Alert.alert(
        "Error",
        "Please select your vehicle type and service level preferences",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("[TravelPreferences] Saving preferences:", preferences);

      // Update local state (store preferences for later saving)
      updateUserData({
        preferredVehicleType: preferences.preferredVehicleType as any,
        preferredServiceLevel: preferences.preferredServiceLevel as any,
        preferredLanguage: "es",
        timezone: "America/Caracas",
        currency: "USD",
      });

      // TODO: Backend doesn't have /api/onboarding/preferences endpoint yet
      // According to documentation, it should accept:
      // { preferredVehicleType, preferredServiceLevel, preferredLanguage, timezone, currency }
      // For now, preferences are stored locally and saved with profile completion
      console.log("[TravelPreferences] Preferences stored locally, will save with profile completion");

      // Continue to next step (preferences saved locally)
      nextStep();
      router.replace('/(onboarding)');
    } catch (error: any) {
      console.error("[TravelPreferences] Error saving preferences:", error);

      // Handle authentication errors specially
      if (error.message?.includes("Authentication expired") ||
          error.message?.includes("Token inválido") ||
          error.statusCode === 401) {
        setError("Your session has expired. Please log in again.");
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/sign-in")
            }
          ]
        );
        return;
      }

      setError(error.message || "Failed to save travel preferences");
      Alert.alert(
        "Error",
        error.message || "Failed to save travel preferences",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-5">
        <TouchableOpacity
          onPress={() => {
            previousStep();
            router.back();
          }}
          className="p-2"
        >
          <Text className="text-xl text-gray-600">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-Jakarta-Bold text-gray-800">
          Travel Preferences
        </Text>
        <View className="w-10" /> {/* Spacer for centering */}
      </View>

      {/* Progress Bar */}
      <ProgressBar
        progress={progress}
        currentStep={currentStep}
        totalSteps={5}
      />

      <ScrollView className="flex-1 px-5">
        {/* Title */}
        <View className="mb-8">
          <Text className="text-2xl font-Jakarta-Bold text-center text-gray-800 mb-2">
            Customize your ride experience
          </Text>
        </View>

        {/* Vehicle Type Selection */}
        <View className="mb-8">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
            🚗 Preferred Vehicle Type
          </Text>

          <View className="space-y-3">
            {VEHICLE_TYPES.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                onPress={() => handleVehicleSelect(vehicle.id)}
                className={`p-4 rounded-lg border-2 ${
                  preferences.preferredVehicleType === vehicle.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-xl mr-3">{vehicle.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-Jakarta-Bold text-gray-800">
                      {vehicle.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {vehicle.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Service Level Selection */}
        <View className="mb-8">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
            💎 Service Level Preference
          </Text>

          <View className="space-y-3">
            {SERVICE_LEVELS.map((service) => (
              <TouchableOpacity
                key={service.id}
                onPress={() => handleServiceSelect(service.id)}
                className={`p-4 rounded-lg border-2 ${
                  preferences.preferredServiceLevel === service.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-Jakarta-Bold text-gray-800">
                      {service.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {service.description}
                    </Text>
                  </View>
                  <Text className="text-lg font-Jakarta-Bold text-primary">
                    {service.price}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Continue Button */}
        <View className="mb-8">
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            loading={isLoading}
            disabled={
              !preferences.preferredVehicleType ||
              !preferences.preferredServiceLevel
            }
            className="w-full"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
