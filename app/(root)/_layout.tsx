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
      <Stack.Screen name="payment-method" options={{ headerShown: false }} />
      <Stack.Screen
        name="payment-confirmation"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="active-ride" options={{ headerShown: false }} />
      <Stack.Screen name="conductor" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-ride-new" options={{ headerShown: false }} />
      <Stack.Screen
        name="driver-unified-flow-demo"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="map-flows-demo" options={{ headerShown: false }} />
      <Stack.Screen name="rating-screen" options={{ headerShown: false }} />
      <Stack.Screen name="unified-flow-demo" options={{ headerShown: false }} />
      <Stack.Screen name="vehicle-selection" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
