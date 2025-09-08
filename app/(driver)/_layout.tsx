import { Stack } from "expo-router";
import { useUI } from "@/components/UIWrapper";

export default function DriverLayout() {
  const { theme } = useUI();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme === 'dark' ? '#000000' : '#FFFFFF',
        },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="safety" />
      <Stack.Screen name="ratings" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="ride-requests" />
      <Stack.Screen name="active-ride" />
    </Stack>
  );
}