import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

const COUNTRIES = [
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
];

export default function CountrySelection() {
  console.log("[CountrySelection] Rendering country selection");

  const {
    currentStep,
    progress,
    updateUserData,
    nextStep,
    setLoading,
    setError,
  } = useOnboardingStore();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);

  useEffect(() => {
    console.log("[CountrySelection] Component mounted");
    const filtered = COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredCountries(filtered);
  }, [searchQuery]);

  const handleCountrySelect = (countryCode: string) => {
    console.log("[CountrySelection] Selected country:", countryCode);
    setSelectedCountry(countryCode);
  };

  const handleContinue = async () => {
    if (!selectedCountry) {
      Alert.alert("Error", "Please select a country");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(
        "[CountrySelection] Saving country selection:",
        selectedCountry,
      );

      // Update local state
      updateUserData({ country: selectedCountry });

      // API call to save location data
      const response = await fetchAPI("onboarding/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: selectedCountry,
        }),
      });

      console.log("[CountrySelection] API response:", response);

      if (response.success) {
        console.log("[CountrySelection] Country saved successfully");
        nextStep();
      } else {
        throw new Error(response.message || "Failed to save country");
      }
    } catch (error: any) {
      console.error("[CountrySelection] Error saving country:", error);
      setError(error.message || "Failed to save country selection");
      Alert.alert("Error", error.message || "Failed to save country selection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-5">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
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
            Welcome!
          </Text>
          <Text className="text-base font-Jakarta-Medium text-center text-gray-600">
            Let's get you set up
          </Text>
        </View>

        {/* Search */}
        <View className="mb-6">
          <InputField
            label=""
            placeholder="Search countries..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="mb-4"
          />
        </View>

        {/* Country Selection */}
        <View className="mb-8">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
            🌍 Select Your Country
          </Text>

          <View className="space-y-3">
            {filteredCountries.map((country) => (
              <TouchableOpacity
                key={country.code}
                onPress={() => handleCountrySelect(country.code)}
                className={`p-4 rounded-lg border-2 ${
                  selectedCountry === country.code
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                }`}
              >
                <Text className="text-base font-Jakarta-Medium text-gray-800">
                  {country.flag} {country.name}
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
            disabled={!selectedCountry}
            className="w-full"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
