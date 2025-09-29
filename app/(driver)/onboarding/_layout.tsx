import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Driver Onboarding",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="step2"
        options={{
          title: "Personal Information",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="step3"
        options={{
          title: "Documents",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="step4"
        options={{
          title: "Vehicle Information",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="step5"
        options={{
          title: "Agreements",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          title: "Review & Submit",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
