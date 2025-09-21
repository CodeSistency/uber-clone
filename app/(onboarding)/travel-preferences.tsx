import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { Tabs, RadioGroup, Select } from "@/components/ui";
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
    preferredVehicleType: (userData.preferredVehicleType || "standard") as
      | "standard"
      | "suv"
      | "motorcycle"
      | "bike",
    preferredServiceLevel: (userData.preferredServiceLevel || "economy") as
      | "economy"
      | "comfort"
      | "premium",
    language: userData.preferredLanguage || "es",
    currency: userData.currency || "USD",
  });

  const handleVehicleSelect = (
    vehicleType: "standard" | "suv" | "motorcycle" | "bike",
  ) => {
    console.log("[TravelPreferences] Selected vehicle type:", vehicleType);
    setPreferences((prev) => ({ ...prev, preferredVehicleType: vehicleType }));
  };

  const handleServiceSelect = (
    serviceLevel: "economy" | "comfort" | "premium",
  ) => {
    console.log("[TravelPreferences] Selected service level:", serviceLevel);
    setPreferences((prev) => ({
      ...prev,
      preferredServiceLevel: serviceLevel,
    }));
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[TravelPreferences] Saving preferences:", preferences);

      // Update local state (store preferences for later saving)
      updateUserData({
        preferredVehicleType: preferences.preferredVehicleType as any,
        preferredServiceLevel: preferences.preferredServiceLevel as any,
        preferredLanguage: preferences.language,
        timezone: "America/Caracas",
        currency: preferences.currency,
      });

      // TODO: Backend doesn't have /api/onboarding/preferences endpoint yet
      // According to documentation, it should accept:
      // { preferredVehicleType, preferredServiceLevel, preferredLanguage, timezone, currency }
      // For now, preferences are stored locally and saved with profile completion
      console.log(
        "[TravelPreferences] Preferences stored locally, will save with profile completion",
      );

      // Continue to next step (preferences saved locally)
      nextStep();
      router.replace("/(onboarding)");
    } catch (error: any) {
      console.error("[TravelPreferences] Error saving preferences:", error);

      // Handle authentication errors specially
      if (
        error.message?.includes("Authentication expired") ||
        error.message?.includes("Token inválido") ||
        error.statusCode === 401
      ) {
        setError("Your session has expired. Please log in again.");
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/sign-in"),
            },
          ],
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
        totalSteps={4}
      />

      <ScrollView className="flex-1 px-5">
        {/* Title */}
        <View className="mb-8">
          <Text className="text-2xl font-Jakarta-Bold text-center text-gray-800 mb-2">
            Customize your ride experience
          </Text>
        </View>

        {/* Vehicle Type Selection (segmented tabs) */}
        <View className="mb-8">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
            🚗 Preferred Vehicle Type
          </Text>
          <Tabs
            variant="segmented"
            items={VEHICLE_TYPES.map((v) => ({
              key: v.id,
              label: v.icon + " " + v.name,
            }))}
            value={preferences.preferredVehicleType}
            onChange={(k) =>
              handleVehicleSelect(
                k as "standard" | "suv" | "motorcycle" | "bike",
              )
            }
          />
        </View>

        {/* Service Level Selection (radio-like) */}
        <View className="mb-8">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
            💎 Service Level Preference
          </Text>
          <RadioGroup
            options={SERVICE_LEVELS.map((s) => ({
              value: s.id,
              label: `${s.name} — ${s.description} (${s.price})`,
            }))}
            value={preferences.preferredServiceLevel}
            onChange={(v) =>
              handleServiceSelect(v as "economy" | "comfort" | "premium")
            }
          />
        </View>

        {/* Language & Currency */}
        <View className="mb-8">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
            🌐 Language & Currency
          </Text>
          <View className="mb-3">
            <Select
              value={preferences.language}
              onChange={(v) => setPreferences((p) => ({ ...p, language: v }))}
              options={[
                { label: "Español", value: "es" },
                { label: "English", value: "en" },
              ]}
              placeholder="Language"
            />
          </View>
          <Select
            value={preferences.currency}
            onChange={(v) => setPreferences((p) => ({ ...p, currency: v }))}
            options={[
              { label: "USD", value: "USD" },
              { label: "VES", value: "VES" },
              { label: "COP", value: "COP" },
            ]}
            placeholder="Currency"
          />
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
