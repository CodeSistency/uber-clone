import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

const COUNTRIES = [
  { code: "VE", name: "Venezuela", flag: "🇻🇪", states: ["Miranda", "Caracas", "Zulia", "Táchira", "Anzoátegui"] },
  { code: "CO", name: "Colombia", flag: "🇨🇴", states: ["Bogotá D.C.", "Antioquia", "Valle del Cauca", "Cundinamarca", "Santander"] },
  { code: "MX", name: "Mexico", flag: "🇲🇽", states: ["Ciudad de México", "Jalisco", "Nuevo León", "Puebla", "Guanajuato"] },
  { code: "AR", name: "Argentina", flag: "🇦🇷", states: ["Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Tucumán"] },
  { code: "PE", name: "Peru", flag: "🇵🇪", states: ["Lima", "Arequipa", "Cusco", "Trujillo", "Piura"] },
  { code: "CL", name: "Chile", flag: "🇨🇱", states: ["Santiago", "Valparaíso", "Biobío", "Maule", "Los Lagos"] },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", states: ["Pichincha", "Guayas", "Azuay", "Manabí", "Los Ríos"] },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", states: ["La Paz", "Santa Cruz", "Cochabamba", "Potosí", "Chuquisaca"] },
];

const CITIES: { [key: string]: string[] } = {
  "Miranda": ["Caracas", "Los Teques", "Guarenas", "Charallave", "San Antonio de los Altos"],
  "Caracas": ["Caracas", "Los Teques", "Guarenas", "Charallave", "San Antonio de los Altos"],
  "Bogotá D.C.": ["Bogotá", "Soacha", "Zipaquirá", "Cajicá", "Chía"],
  "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Sabaneta"],
  "Ciudad de México": ["Ciudad de México", "Ecatepec", "Naucalpan", "Tlalnepantla", "Chimalhuacán"],
  "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonala", "El Salto"],
  "Buenos Aires": ["Buenos Aires", "La Plata", "Mar del Plata", "Bahía Blanca", "Tandil"],
  "Córdoba": ["Córdoba", "Villa María", "Río Cuarto", "San Francisco", "Villa Carlos Paz"],
  "Lima": ["Lima", "Callao", "Ate", "Comas", "San Juan de Lurigancho"],
  "Arequipa": ["Arequipa", "Cayma", "Yanahuara", "Socabaya", "Tiabaya"],
  "Santiago": ["Santiago", "Puente Alto", "Maipú", "La Florida", "Peñalolén"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "Concón"],
  "Pichincha": ["Quito", "Sangolquí", "Cumbayá", "Píntag", "Tumbaco"],
  "Guayas": ["Guayaquil", "Durán", "Milagro", "Daule", "Samborondón"],
  "La Paz": ["La Paz", "El Alto", "Viacha", "Achocalla", "Laja"],
  "Santa Cruz": ["Santa Cruz de la Sierra", "Warnes", "Cotoca", "Montero", "La Guardia"]
};

export default function LocationSelection() {
  console.log("[LocationSelection] Rendering location selection");

  const {
    currentStep,
    progress,
    completedSteps,
    updateUserData,
    nextStep,
    setLoading,
    setError,
    resetOnboarding,
    isLoading,
  } = useOnboardingStore();

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Wizard state
  const [currentWizardStep, setCurrentWizardStep] = useState<'country' | 'state' | 'city'>('country');

  useEffect(() => {
    console.log("[LocationSelection] Component mounted");
    console.log("[LocationSelection] Current state - currentStep:", currentStep, "completedSteps:", completedSteps);

    // Only reset if there's a truly corrupted state:
    // - currentStep is beyond valid range (> 4)
    // - OR currentStep > 0 but no steps are completed (meaning we somehow skipped the location step)
    const isCorruptedState = currentStep > 4 || (currentStep > 0 && completedSteps.length === 0);

    if (isCorruptedState) {
      console.log("[LocationSelection] Corrupted state detected - currentStep:", currentStep, "completedSteps:", completedSteps, "- resetting");
      resetOnboarding();
    } else if (currentStep !== 0) {
      // If we're not at step 0, this component shouldn't be rendered
      // Let the onboarding index handle the navigation
      console.log("[LocationSelection] Not at location step (currentStep:", currentStep, ") - navigation should be handled by index");
      return; // Exit early to prevent further execution
    }

    const filtered = COUNTRIES.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredCountries(filtered);
  }, [searchQuery, currentStep, completedSteps, resetOnboarding]);

  // Navigate to the appropriate step route when the global step changes
  useEffect(() => {
    if (currentStep !== 0) {
      console.log("[LocationSelection] currentStep changed to", currentStep, "- navigating to onboarding index for redirect");
      router.replace('/(onboarding)');
    }
  }, [currentStep]);

  useEffect(() => {
    if (selectedCountry) {
      const country = COUNTRIES.find(c => c.code === selectedCountry);
      if (country) {
        setAvailableStates(country.states);
        setSelectedState("");
        setSelectedCity("");
        setAvailableCities([]);
      }
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState && CITIES[selectedState]) {
      setAvailableCities(CITIES[selectedState]);
      setSelectedCity("");
    }
  }, [selectedState]);

  const handleCountrySelect = (countryCode: string) => {
    console.log("[LocationSelection] Selected country:", countryCode);
    setSelectedCountry(countryCode);
    Haptics.selectionAsync();
  };

  const handleStateSelect = (state: string) => {
    console.log("[LocationSelection] Selected state:", state);
    setSelectedState(state);
    Haptics.selectionAsync();
  };

  const handleCitySelect = (city: string) => {
    console.log("[LocationSelection] Selected city:", city);
    setSelectedCity(city);
    Haptics.selectionAsync();
  };

  // Wizard navigation functions
  const handleCountryNext = () => {
    if (!selectedCountry) {
      Alert.alert("Error", "Please select a country");
      return;
    }
    setCurrentWizardStep('state');
  };

  const handleStateNext = () => {
    if (!selectedState) {
      Alert.alert("Error", "Please select a state");
      return;
    }
    setCurrentWizardStep('city');
  };

  const handleStateBack = () => {
    setCurrentWizardStep('country');
  };

  const handleCityBack = () => {
    setCurrentWizardStep('state');
  };

  const handleContinue = async () => {
    if (!selectedCountry) {
      Alert.alert("Error", "Please select a country");
      return;
    }

    if (!selectedState) {
      Alert.alert("Error", "Please select a state");
      return;
    }

    if (!selectedCity) {
      Alert.alert("Error", "Please select a city");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("[LocationSelection] Saving location selection:", {
        country: selectedCountry,
        state: selectedState,
        city: selectedCity
      });

      // Update local state
      updateUserData({
        country: selectedCountry,
        state: selectedState,
        city: selectedCity
      });

      // API call to save complete location data
      const response = await fetchAPI("onboarding/location", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          country: selectedCountry,
          state: selectedState,
          city: selectedCity
        }),
      });

      console.log("[LocationSelection] API response:", response);
      const isSuccess = (response && (response.success === true || response.statusCode === 200 || response.statusCode === 201)) || (!('success' in (response || {})) && !('statusCode' in (response || {})));

      if (isSuccess) {
        console.log("[LocationSelection] Location saved successfully, completing step");
        console.log("[LocationSelection] Current step before completeStep:", useOnboardingStore.getState().currentStep);

        // Mark current step as completed (this will auto-advance to next step)
        const { completeStep } = useOnboardingStore.getState();
        completeStep("location");

        console.log("[LocationSelection] Current step after completeStep:", useOnboardingStore.getState().currentStep);
        // Ensure navigation proceeds to the next screen based on updated step
        router.replace('/(onboarding)');
      } else {
        throw new Error(response.message || "Failed to save location");
      }
    } catch (error: any) {
      console.error("[LocationSelection] Error saving location:", error);

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

      setError(error.message || "Failed to save location");
      Alert.alert("Error", error.message || "Failed to save location");
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
        totalSteps={5}
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
            className="mb-2"
          />
          {filteredCountries.length === 0 && (
            <Text className="text-sm text-gray-500">No results</Text>
          )}
        </View>

        {/* Wizard Content */}
        {currentWizardStep === 'country' && (
          <View className="flex-1">
            <View className="mb-8">
              <Text className="text-2xl font-Jakarta-Bold text-center text-gray-800 mb-2">
                Welcome!
              </Text>
              <Text className="text-base font-Jakarta-Medium text-center text-gray-600 mb-8">
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
                className="mb-2"
              />
              {filteredCountries.length === 0 && (
                <Text className="text-sm text-gray-500">No results</Text>
              )}
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

            {/* Next Button */}
            <View className="mb-8">
              <CustomButton
                title="Next"
                onPress={handleCountryNext}
                disabled={!selectedCountry}
                loading={isLoading}
                className="w-full"
              />
            </View>
          </View>
        )}

        {currentWizardStep === 'state' && (
          <View className="flex-1">
            <View className="mb-8">
              <Text className="text-2xl font-Jakarta-Bold text-center text-gray-800 mb-2">
                Great! 🇻🇪
              </Text>
              <Text className="text-base font-Jakarta-Medium text-center text-gray-600 mb-8">
                Now let's select your state
              </Text>
            </View>

            {/* State Selection */}
            <View className="mb-8">
              <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
                🏛️ Select Your State
              </Text>

              <View className="space-y-3">
                {availableStates.map((state) => (
                  <TouchableOpacity
                    key={state}
                    onPress={() => handleStateSelect(state)}
                    className={`p-4 rounded-lg border-2 ${
                      selectedState === state
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    }`}
                  >
                    <Text className="text-base font-Jakarta-Medium text-gray-800">
                      {state}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Navigation Buttons */}
            <View className="mb-8">
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={handleStateBack}
                  className="flex-1 bg-gray-200 rounded-full py-3 items-center"
                >
                  <Text className="text-gray-700 font-Jakarta-Bold">Back</Text>
                </TouchableOpacity>
                <View className="w-4" />
                <CustomButton
                  title="Next"
                  onPress={handleStateNext}
                  disabled={!selectedState}
                  loading={isLoading}
                  className="flex-1"
                />
              </View>
            </View>
          </View>
        )}

        {currentWizardStep === 'city' && (
          <View className="flex-1">
            <View className="mb-8">
              <Text className="text-2xl font-Jakarta-Bold text-center text-gray-800 mb-2">
                Almost there! 🏛️
              </Text>
              <Text className="text-base font-Jakarta-Medium text-center text-gray-600 mb-8">
                Just need your city
              </Text>
            </View>

            {/* City Selection */}
            <View className="mb-8">
              <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-4">
                🏙️ Select Your City
              </Text>

              <View className="space-y-3">
                {availableCities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    onPress={() => handleCitySelect(city)}
                    className={`p-4 rounded-lg border-2 ${
                      selectedCity === city
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    }`}
                  >
                    <Text className="text-base font-Jakarta-Medium text-gray-800">
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Navigation Buttons */}
            <View className="mb-8">
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={handleCityBack}
                  className="flex-1 bg-gray-200 rounded-full py-3 items-center"
                >
                  <Text className="text-gray-700 font-Jakarta-Bold">Back</Text>
                </TouchableOpacity>
                <View className="w-4" />
                <CustomButton
                  title="Continue"
                  onPress={handleContinue}
                  disabled={!selectedCity}
                  loading={isLoading}
                  className="flex-1"
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  // Prevent component execution if we're not at the right step
  if (currentStep !== 0) {
    console.log("[LocationSelection] Component should not be active at step", currentStep, "- returning null");
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-600">Navigating to next step...</Text>
      </SafeAreaView>
    );
  }
}
