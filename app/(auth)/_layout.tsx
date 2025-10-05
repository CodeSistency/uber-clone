import { Stack } from "expo-router";

const Layout = () => {
  

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen
        name="driver-register"
        options={{
          headerShown: false,
          title: "Driver Registration",
        }}
      />
      <Stack.Screen
        name="business-register"
        options={{
          headerShown: false,
          title: "Business Registration",
        }}
      />
    </Stack>
  );
};

export default Layout;
