import { Stack } from "expo-router";

const Layout = () => {
  console.log("[RootLayout] Rendering root layout");

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="find-ride" options={{ headerShown: false }} />
      <Stack.Screen
        name="confirm-ride"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="book-ride"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="services-hub" options={{ headerShown: false }} />
      <Stack.Screen name="componentes" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
