import { Redirect } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

import { useOnboardingStore } from "@/store";

// Redirect to appropriate step based on current step (guard NaN)
const stepRoutes = [
  "/(onboarding)/country-selection", // Location setup (country/state/city)
  "/(onboarding)/travel-preferences",
  "/(onboarding)/phone-verification", // optional
  "/(onboarding)/profile-completion",
];

export default function OnboardingIndex() {
  

  const { currentStep, isCompleted, isLoading } = useOnboardingStore();

  useEffect(() => {
    
    
    
  }, [currentStep, isCompleted]);

  // Prevent navigation during loading or when state is not ready
  if (
    isLoading ||
    typeof currentStep !== "number" ||
    typeof isCompleted !== "boolean"
  ) {
    
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );
  }

  // If onboarding is completed, redirect to home
  if (isCompleted) {
    
    return <Redirect href="/(root)/(tabs)/home" />;
  }

  const safeStep =
    Number.isFinite(currentStep) &&
    currentStep >= 0 &&
    currentStep < stepRoutes.length
      ? currentStep
      : 0;
  const targetRoute = stepRoutes[safeStep] || stepRoutes[0];
  

  return <Redirect href={targetRoute as any} />;
}
