import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { Select, Button } from "@/components/ui";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

const COUNTRIES = [
  {
    code: "VE",
    name: "Venezuela",
    flag: "🇻🇪",
    states: ["Miranda", "Caracas", "Zulia", "Táchira", "Anzoátegui"],
  },
  {
    code: "CO",
    name: "Colombia",
    flag: "🇨🇴",
    states: [
      "Bogotá D.C.",
      "Antioquia",
      "Valle del Cauca",
      "Cundinamarca",
      "Santander",
    ],
  },
  {
    code: "MX",
    name: "Mexico",
    flag: "🇲🇽",
    states: [
      "Ciudad de México",
      "Jalisco",
      "Nuevo León",
      "Puebla",
      "Guanajuato",
    ],
  },
  {
    code: "AR",
    name: "Argentina",
    flag: "🇦🇷",
    states: ["Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Tucumán"],
  },
  {
    code: "PE",
    name: "Peru",
    flag: "🇵🇪",
    states: ["Lima", "Arequipa", "Cusco", "Trujillo", "Piura"],
  },
  {
    code: "CL",
    name: "Chile",
    flag: "🇨🇱",
    states: ["Santiago", "Valparaíso", "Biobío", "Maule", "Los Lagos"],
  },
  {
    code: "EC",
    name: "Ecuador",
    flag: "🇪🇨",
    states: ["Pichincha", "Guayas", "Azuay", "Manabí", "Los Ríos"],
  },
  {
    code: "BO",
    name: "Bolivia",
    flag: "🇧🇴",
    states: ["La Paz", "Santa Cruz", "Cochabamba", "Potosí", "Chuquisaca"],
  },
];

const CITIES: { [key: string]: string[] } = {
  Miranda: [
    "Caracas",
    "Los Teques",
    "Guarenas",
    "Charallave",
    "San Antonio de los Altos",
  ],
  Caracas: [
    "Caracas",
    "Los Teques",
    "Guarenas",
    "Charallave",
    "San Antonio de los Altos",
  ],
  "Bogotá D.C.": ["Bogotá", "Soacha", "Zipaquirá", "Cajicá", "Chía"],
  Antioquia: ["Medellín", "Bello", "Itagüí", "Envigado", "Sabaneta"],
  "Ciudad de México": [
    "Ciudad de México",
    "Ecatepec",
    "Naucalpan",
    "Tlalnepantla",
    "Chimalhuacán",
  ],
  Jalisco: ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonala", "El Salto"],
  "Buenos Aires": [
    "Buenos Aires",
    "La Plata",
    "Mar del Plata",
    "Bahía Blanca",
    "Tandil",
  ],
  Córdoba: [
    "Córdoba",
    "Villa María",
    "Río Cuarto",
    "San Francisco",
    "Villa Carlos Paz",
  ],
  Lima: ["Lima", "Callao", "Ate", "Comas", "San Juan de Lurigancho"],
  Arequipa: ["Arequipa", "Cayma", "Yanahuara", "Socabaya", "Tiabaya"],
  Santiago: ["Santiago", "Puente Alto", "Maipú", "La Florida", "Peñalolén"],
  Valparaíso: [
    "Valparaíso",
    "Viña del Mar",
    "Quilpué",
    "Villa Alemana",
    "Concón",
  ],
  Pichincha: ["Quito", "Sangolquí", "Cumbayá", "Píntag", "Tumbaco"],
  Guayas: ["Guayaquil", "Durán", "Milagro", "Daule", "Samborondón"],
  "La Paz": ["La Paz", "El Alto", "Viacha", "Achocalla", "Laja"],
  "Santa Cruz": [
    "Santa Cruz de la Sierra",
    "Warnes",
    "Cotoca",
    "Montero",
    "La Guardia",
  ],
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
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Location autodetect
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    console.log("[LocationSelection] Component mounted");
    console.log(
      "[LocationSelection] Current state - currentStep:",
      currentStep,
      "completedSteps:",
      completedSteps,
    );

    const isInvalidStep =
      !Number.isFinite(currentStep) || currentStep < 0 || currentStep > 3;
    if (isInvalidStep) {
      console.log(
        "[LocationSelection] Invalid step detected (",
        currentStep,
        ") - letting index handle correction",
      );
      return;
    }

    if (currentStep !== 0) {
      console.log(
        "[LocationSelection] Not at location step (currentStep:",
        currentStep,
        ") - navigation should be handled by index",
      );
      return;
    }
  }, [currentStep, completedSteps]);

  // Navigate to the appropriate step route when the global step changes
  useEffect(() => {
    if (!Number.isFinite(currentStep)) return;
    if (currentStep !== 0) {
      console.log(
        "[LocationSelection] currentStep changed to",
        currentStep,
        "- navigating to onboarding index for redirect",
      );
      router.replace("/(onboarding)");
    }
  }, [currentStep]);

  useEffect(() => {
    if (selectedCountry) {
      const country = COUNTRIES.find((c) => c.code === selectedCountry);
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

  const handleDetectLocation = async () => {
    try {
      setDetecting(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Location permission is needed to detect your location",
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const geos = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const geo = geos[0];
      if (!geo) return;
      // Match country
      const foundCountry = COUNTRIES.find(
        (c) => c.name.toLowerCase() === (geo.country || "").toLowerCase(),
      );
      if (foundCountry) {
        setSelectedCountry(foundCountry.code);
      }
      // Match state
      if (geo.region) {
        const country = COUNTRIES.find(
          (c) =>
            c.code === (foundCountry ? foundCountry.code : selectedCountry),
        );
        if (country) {
          const regionLc = (geo.region || "").toLowerCase();
          const st =
            country.states.find((s) => s.toLowerCase() === regionLc) ||
            country.states[0];
          if (st) setSelectedState(st);
        }
      }
      // Match city
      if (geo.city || geo.subregion) {
        const candidate = (geo.city || geo.subregion || "").toLowerCase();
        if (candidate && CITIES[selectedState]) {
          const ct =
            CITIES[selectedState].find((c) => c.toLowerCase() === candidate) ||
            CITIES[selectedState][0];
          if (ct) setSelectedCity(ct);
        }
      }
    } catch (e) {
      console.log("[LocationSelection] Autodetect error", e);
    } finally {
      setDetecting(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedCountry) {
      Alert.alert("Error", "Please select a country");
      return;
    }

    // State optional

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
        city: selectedCity,
      });

      // Update local state
      updateUserData({
        country: selectedCountry,
        state: selectedState,
        city: selectedCity,
      });

      // API call to save complete location data
      const response = await fetchAPI("onboarding/location", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          country: selectedCountry,
          state: selectedState,
          city: selectedCity,
        }),
      });

      console.log("[LocationSelection] API response:", response);
      const isSuccess =
        (response &&
          (response.success === true ||
            response.statusCode === 200 ||
            response.statusCode === 201)) ||
        (!("success" in (response || {})) &&
          !("statusCode" in (response || {})));

      if (isSuccess) {
        console.log(
          "[LocationSelection] Location saved successfully, completing step",
        );
        console.log(
          "[LocationSelection] Current step before completeStep:",
          useOnboardingStore.getState().currentStep,
        );

        // Mark current step as completed (this will auto-advance to next step)
        const { completeStep } = useOnboardingStore.getState();
        completeStep("location");

        console.log(
          "[LocationSelection] Current step after completeStep:",
          useOnboardingStore.getState().currentStep,
        );
        // Ensure navigation proceeds to the next screen based on updated step
        router.replace("/(onboarding)");
      } else {
        throw new Error(response.message || "Failed to save location");
      }
    } catch (error: any) {
      console.error("[LocationSelection] Error saving location:", error);

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
        totalSteps={4}
      />

      <ScrollView className="flex-1 px-5">
        <View className="mb-6">
          <Text className="text-2xl font-Jakarta-Bold text-center text-gray-800 mb-2">
            Welcome!
          </Text>
          <Text className="text-base font-Jakarta-Medium text-center text-gray-600">
            Let's get you set up
          </Text>
        </View>

        {/* Autodetect */}
        <View className="mb-6 items-center">
          <Button
            title={detecting ? "Detecting…" : "Use my location"}
            variant="outline"
            onPress={handleDetectLocation}
            disabled={detecting}
          />
        </View>

        {/* Country */}
        <View className="mb-4">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-2">
            🌍 Country
          </Text>
          <Select
            value={selectedCountry}
            onChange={(code) => handleCountrySelect(code)}
            options={filteredCountries.map((c) => ({
              label: `${c.flag} ${c.name}`,
              value: c.code,
            }))}
            placeholder="Select country"
          />
        </View>

        {/* State (optional) */}
        <View className="mb-4">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-2">
            🏛️ State / Province
          </Text>
          <Select
            value={selectedState}
            onChange={(s) => handleStateSelect(s)}
            options={availableStates.map((s) => ({ label: s, value: s }))}
            placeholder={
              availableStates.length ? "Select state" : "Select country first"
            }
          />
        </View>

        {/* City */}
        <View className="mb-8">
          <Text className="text-lg font-Jakarta-Bold text-gray-800 mb-2">
            🏙️ City
          </Text>
          <Select
            value={selectedCity}
            onChange={(c) => handleCitySelect(c)}
            options={availableCities.map((c) => ({ label: c, value: c }))}
            placeholder={
              availableCities.length ? "Select city" : "Select state first"
            }
          />
        </View>

        <CustomButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedCountry || !selectedCity}
          loading={isLoading}
          className="w-full"
        />
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );

  // Prevent component execution if we're not at the right step
  if (currentStep !== 0) {
    console.log(
      "[LocationSelection] Component should not be active at step",
      currentStep,
      "- returning null",
    );
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-600">
          Navigating to next step...
        </Text>
      </SafeAreaView>
    );
  }
}
