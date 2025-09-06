import { Redirect } from "expo-router";
import { Text } from "react-native";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useOnboardingStore } from "@/store";

export default function OnboardingIndex() {
  console.log("[OnboardingIndex] Rendering onboarding index");

  const { currentStep, isCompleted, isLoading, completedSteps } = useOnboardingStore();

  useEffect(() => {
    console.log(
      "[OnboardingIndex] Current step:",
      currentStep,
      "Completed:",
      isCompleted,
    );
    console.log("[OnboardingIndex] Step routes:", stepRoutes);
    console.log("[OnboardingIndex] Target route:", stepRoutes[currentStep] || stepRoutes[0]);
  }, [currentStep, isCompleted]);

  // If onboarding is completed, redirect to home
  if (isCompleted) {
    console.log("[OnboardingIndex] Onboarding completed, redirecting to home");
    return <Redirect href="/(root)/(tabs)/home" />;
  }

  // Show loading while determining state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0286FF" />
      </SafeAreaView>
    );
  }

  // Redirect to appropriate step based on current step
  const stepRoutes = [
    "/(onboarding)/country-selection", // Combined location step
    "/(onboarding)/personal-info",
    "/(onboarding)/travel-preferences",
    "/(onboarding)/phone-verification",
    "/(onboarding)/profile-completion",
  ];

  const targetRoute = stepRoutes[currentStep] || stepRoutes[0];
  console.log(
    "[OnboardingIndex] Redirecting to step:",
    currentStep,
    "route:",
    targetRoute,
  );

  return <Redirect href={targetRoute as any} />;
}
