import { Stack } from "expo-router";
import { useEffect } from "react";

import { useOnboardingStore } from "@/store";

export default function OnboardingLayout() {
  console.log("[OnboardingLayout] Rendering onboarding layout");

  const { currentStep, isCompleted } = useOnboardingStore();

  useEffect(() => {
    console.log(
      "[OnboardingLayout] Current step:",
      currentStep,
      "Completed:",
      isCompleted,
    );
  }, [currentStep, isCompleted]);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent going back
        }}
      />
      <Stack.Screen
        name="country-selection"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="state-selection"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="city-selection"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="personal-info"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="travel-preferences"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="phone-verification"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="profile-completion"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="welcome"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
