import { Stack } from "expo-router";

export default function DocumentsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Documents",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Document Details",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="upload"
        options={{
          title: "Upload Document",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
