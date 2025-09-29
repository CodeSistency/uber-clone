import { Stack } from "expo-router";

export default function EmergencyLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Emergency",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="contacts"
        options={{
          title: "Emergency Contacts",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="contacts/add"
        options={{
          title: "Add Emergency Contact",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: "Emergency History",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          title: "Report Issue",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="resources"
        options={{
          title: "Safety Resources",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
