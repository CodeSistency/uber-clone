import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

// Ciudades por estado
const CITIES_BY_STATE: Record<string, { code: string; name: string }[]> = {
  // Venezuela - Miranda
  MI: [
    { code: "CCS", name: "Caracas" },
    { code: "GUA", name: "Guarenas" },
    { code: "CHV", name: "Charallave" },
    { code: "SAT", name: "San Antonio de los Altos" },
    { code: "TEQ", name: "Los Teques" },
    { code: "GUI", name: "Guatire" },
    { code: "CIP", name: "Cúpira" },
    { code: "RCH", name: "Río Chico" },
  ],
  // Distrito Capital
  DC: [
    { code: "CCS", name: "Caracas" },
    { code: "CAT", name: "Catia" },
    { code: "SAB", name: "Sabaneta" },
  ],
  // Agregar más estados según sea necesario
};

export default function CitySelection() {
  console.log("[CitySelection] Rendering city selection");

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
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState<
    { code: string; name: string }[]
  >([]);

  const stateCities = CITIES_BY_STATE[userData.state || "MI"] || [];

  useEffect(() => {
    console.log("[CitySelection] Component mounted, state:", userData.state);
    const filtered = stateCities.filter((city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredCities(filtered);
  }, [searchQuery, userData.state]);

  const handleCitySelect = (cityCode: string) => {
    console.log("[CitySelection] Selected city:", cityCode);
    setSelectedCity(cityCode);
  };

  const handleContinue = async () => {
    if (!selectedCity) {
      Alert.alert("Error", "Please select a city");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("[CitySelection] Saving city selection:", selectedCity);

      // Update local state
      updateUserData({ city: selectedCity });

      // API call to save complete location data
      const response = await fetchAPI("onboarding/location", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          country: userData.country,
          state: userData.state,
          city: selectedCity
        }),
      });

      console.log("[CitySelection] API response:", response);

      if (response.success) {
        console.log("[CitySelection] City saved successfully");
        nextStep();
      } else {
        throw new Error(response.message || "Failed to save city");
      }
    } catch (error: any) {
      console.error("[CitySelection] Error saving city:", error);
      setError(error.message || "Failed to save city selection");
      Alert.alert("Error", error.message || "Failed to save city selection");
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
        totalSteps={4}
      />

      <ScrollView className="flex-1 px-5">
        {/* Title */}
        <View className="mb-8">
          <Text className="text-2xl font-Jakarta-Bold text-center text-gray-800 mb-2">
            Perfect!
          </Text>
          <Text className="text-base font-Jakarta-Medium text-center text-gray-600">
            Now select your city
          </Text>
        </View>

        {/* Search */}
        <View className="mb-6">
          <InputField
            label=""
            placeholder="Search cities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="mb-4"
          />
        </View>

        {/* City Selection */}
        <View className="mb-8">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
            🏙️ Select Your City
          </Text>

          <View className="space-y-3">
            {filteredCities.map((city) => (
              <TouchableOpacity
                key={city.code}
                onPress={() => handleCitySelect(city.code)}
                className={`p-4 rounded-lg border-2 ${
                  selectedCity === city.code
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                }`}
              >
                <Text className="text-base font-Jakarta-Medium text-gray-800">
                  📍 {city.name}
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
            disabled={!selectedCity}
            className="w-full"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
