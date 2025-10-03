import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";

import { TravelIllustration } from "@/components/onboarding/illustrations";
import { OnboardingScaffold } from "@/components/onboarding/OnboardingScaffold";
import { Card, Select, Tabs, RadioGroup } from "@/components/ui";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

const VEHICLE_TYPES = [
  {
    id: "standard",
    name: "Carro estándar",
    description: "La opción más común",
    icon: "🚗",
  },
  { id: "suv", name: "SUV / Van", description: "Más espacio", icon: "🚐" },
  {
    id: "motorcycle",
    name: "Motocicleta",
    description: "Más rápido",
    icon: "🏍️",
  },
  { id: "bike", name: "Bici / Scooter", description: "Ecológico", icon: "🚲" },
];

const SERVICE_LEVELS = [
  {
    id: "economy",
    name: "Economy",
    description: "Más accesible",
    price: "$2.50",
  },
  {
    id: "comfort",
    name: "Comfort",
    description: "Mayor espacio",
    price: "$4.00",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Experiencia lujo",
    price: "$6.00",
  },
];

const LANGUAGES = [
  { label: "Español", value: "es", subtitle: "Recomendado" },
  { label: "English", value: "en", subtitle: "Disponible" },
];

const CURRENCIES = [
  { label: "USD", value: "USD" },
  { label: "VES", value: "VES" },
  { label: "COP", value: "COP" },
];

export default function TravelPreferences() {
  const {
    currentStep,
    userData,
    updateUserData,
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

  useEffect(() => {
    if (Number.isFinite(currentStep) && currentStep !== 1) {
      router.replace("/");
    }
  }, [currentStep]);

  const handleContinue = async () => {
    try {
      setLoading(true);
      setError(null);

      updateUserData({
        preferredVehicleType: preferences.preferredVehicleType,
        preferredServiceLevel: preferences.preferredServiceLevel,
        preferredLanguage: preferences.language,
        currency: preferences.currency,
      });

      await fetchAPI("onboarding/preferences", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          preferredVehicleType: preferences.preferredVehicleType,
          preferredServiceLevel: preferences.preferredServiceLevel,
          preferredLanguage: preferences.language,
          currency: preferences.currency,
        }),
      }).catch(() => null);

      const { completeStep } = useOnboardingStore.getState();
      completeStep("travel-preferences", {
        preferredVehicleType: preferences.preferredVehicleType,
        preferredServiceLevel: preferences.preferredServiceLevel,
        preferredLanguage: preferences.language,
        currency: preferences.currency,
      });

      router.replace("./phone-verification");
    } catch (error: any) {
      setError(error.message || "No pudimos guardar tus preferencias");
      Alert.alert(
        "Error",
        error.message || "No pudimos guardar tus preferencias",
      );
    } finally {
      setLoading(false);
    }
  };

  if (currentStep !== 1) {
    return null;
  }

  return (
    <OnboardingScaffold
      illustration={TravelIllustration}
      title="Personaliza tu experiencia"
      subtitle="Elige tus tipos de viaje favoritos"
      onContinue={handleContinue}
      onBack={() => router.replace("./country-selection")}
      onSkip={() => router.replace("./phone-verification")}
      showBackButton
      continueButtonText="Guardar y continuar"
      isLoading={isLoading}
    >
      <View className="space-y-6">
        <Card
          header={
            <Text className="text-lg font-Jakarta-Bold text-gray-900 dark:text-white">
              Tipo de vehículo preferido
            </Text>
          }
        >
          <Tabs
            variant="segmented"
            items={VEHICLE_TYPES.map((v) => ({
              key: v.id,
              label: `${v.icon} ${v.name}`,
            }))}
            value={preferences.preferredVehicleType}
            onChange={(key) =>
              setPreferences((prev) => ({
                ...prev,
                preferredVehicleType: key as
                  | "standard"
                  | "suv"
                  | "motorcycle"
                  | "bike",
              }))
            }
          />
          <Text className="text-sm text-gray-500 dark:text-gray-300 mt-3">
            {
              VEHICLE_TYPES.find(
                (v) => v.id === preferences.preferredVehicleType,
              )?.description
            }
          </Text>
        </Card>

        <Card
          header={
            <Text className="text-lg font-Jakarta-Bold text-gray-900 dark:text-white">
              Nivel de servicio
            </Text>
          }
        >
          <RadioGroup
            options={SERVICE_LEVELS.map((service) => ({
              value: service.id,
              label: `${service.name} — ${service.description}`,
              subtitle: service.price,
            }))}
            value={preferences.preferredServiceLevel}
            onChange={(value) =>
              setPreferences((prev) => ({
                ...prev,
                preferredServiceLevel: value as
                  | "economy"
                  | "comfort"
                  | "premium",
              }))
            }
          />
        </Card>

        <Card
          header={
            <Text className="text-lg font-Jakarta-Bold text-gray-900 dark:text-white">
              Idioma y moneda
            </Text>
          }
        >
          <View className="space-y-4">
            <Select
              value={preferences.language}
              onChange={(value) =>
                setPreferences((prev) => ({
                  ...prev,
                  language: value,
                }))
              }
              options={LANGUAGES}
              placeholder="Selecciona un idioma"
              variant="primary"
            />
            <Select
              value={preferences.currency}
              onChange={(value) =>
                setPreferences((prev) => ({
                  ...prev,
                  currency: value,
                }))
              }
              options={CURRENCIES}
              placeholder="Selecciona moneda"
            />
          </View>
        </Card>
      </View>
    </OnboardingScaffold>
  );
}
