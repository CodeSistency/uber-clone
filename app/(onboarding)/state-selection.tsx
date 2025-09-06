import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

// Estados por país
const STATES_BY_COUNTRY: Record<string, { code: string; name: string }[]> = {
  VE: [
    { code: "DC", name: "Distrito Capital" },
    { code: "MI", name: "Miranda" },
    { code: "VA", name: "Vargas" },
    { code: "CA", name: "Carabobo" },
    { code: "ZU", name: "Zulia" },
    { code: "TA", name: "Táchira" },
    { code: "AN", name: "Anzoátegui" },
    { code: "BO", name: "Bolívar" },
    { code: "SU", name: "Sucre" },
    { code: "MO", name: "Monagas" },
  ],
  CO: [
    { code: "CU", name: "Cundinamarca" },
    { code: "AN", name: "Antioquia" },
    { code: "VA", name: "Valle del Cauca" },
    { code: "SA", name: "Santander" },
    { code: "BO", name: "Bolívar" },
  ],
  MX: [
    { code: "CDMX", name: "Ciudad de México" },
    { code: "JAL", name: "Jalisco" },
    { code: "NL", name: "Nuevo León" },
  ],
  // Agregar más países según sea necesario
};

export default function StateSelection() {
  console.log("[StateSelection] Rendering state selection");

  const {
    currentStep,
    progress,
    userData,
    updateUserData,
    nextStep,
    previousStep,
    setLoading,
    setError,
  } = useOnboardingStore();
  const [selectedState, setSelectedState] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStates, setFilteredStates] = useState<
    { code: string; name: string }[]
  >([]);

  const countryStates = STATES_BY_COUNTRY[userData.country || "VE"] || [];

  useEffect(() => {
    console.log(
      "[StateSelection] Component mounted, country:",
      userData.country,
    );
    const filtered = countryStates.filter((state) =>
      state.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredStates(filtered);
  }, [searchQuery, userData.country]);

  const handleStateSelect = (stateCode: string) => {
    console.log("[StateSelection] Selected state:", stateCode);
    setSelectedState(stateCode);
  };

  const handleContinue = async () => {
    if (!selectedState) {
      Alert.alert("Error", "Please select a state");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("[StateSelection] Saving state selection:", selectedState);

      // Update local state
      updateUserData({ state: selectedState });

      // API call to save location data
      const response = await fetchAPI("onboarding/location", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          country: userData.country,
          state: selectedState,
          city: null // Send null for city
        }),
      });

      console.log("[StateSelection] API response:", response);

      if (response.success) {
        console.log("[StateSelection] State saved successfully");
        nextStep();
      } else {
        throw new Error(response.message || "Failed to save state");
      }
    } catch (error: any) {
      console.error("[StateSelection] Error saving state:", error);
      setError(error.message || "Failed to save state selection");
      Alert.alert("Error", error.message || "Failed to save state selection");
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
          Setup Your Location
        </Text>
        <View className="w-10" /> {/* Spacer for centering */}
      </View>

      {/* Progress Bar */}
      <ProgressBar
        progress={progress}
        currentStep={currentStep}
        totalSteps={7}
      />

      <ScrollView className="flex-1 px-5">
        {/* Title */}
        <View className="mb-8">
          <Text className="text-2xl font-Jakarta-Bold text-center text-gray-800 mb-2">
            Great!
          </Text>
          <Text className="text-base font-Jakarta-Medium text-center text-gray-600">
            Now let's find your state
          </Text>
        </View>

        {/* Search */}
        <View className="mb-6">
          <InputField
            label=""
            placeholder="Search states..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="mb-4"
          />
        </View>

        {/* State Selection */}
        <View className="mb-8">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
            🏛️ Select Your State
          </Text>

          <View className="space-y-3">
            {filteredStates.map((state) => (
              <TouchableOpacity
                key={state.code}
                onPress={() => handleStateSelect(state.code)}
                className={`p-4 rounded-lg border-2 ${
                  selectedState === state.code
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                }`}
              >
                <Text className="text-base font-Jakarta-Medium text-gray-800">
                  📍 {state.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Continue Button */}
        <View className="mb-8">
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedState}
            className="w-full"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
