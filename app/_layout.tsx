import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "react-native-get-random-values";
import { LogBox } from "react-native";
import { initializeUserStore } from "@/lib/auth";
import UIWrapper from "@/components/UIWrapper";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs(["Clerk:"]);

export default function RootLayout() {
  console.log("[RootLayout] Rendering root layout");

  const [loaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    Jakarta: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    console.log("[RootLayout] useEffect - loaded:", loaded);
    if (loaded) {
      SplashScreen.hideAsync();

      // Initialize user store after fonts are loaded
      console.log("[RootLayout] Initializing user store...");
      try {
        const { initializeUserStore } = require('@/lib/auth');
        if (typeof initializeUserStore === 'function') {
          initializeUserStore().catch((error) => {
            console.error("[RootLayout] Failed to initialize user store:", error);
          });
        } else {
          console.error("[RootLayout] initializeUserStore is not a function");
        }
      } catch (error) {
        console.error("[RootLayout] Error importing initializeUserStore:", error);
      }
    }
  }, [loaded]);

  if (!loaded) {
    console.log("[RootLayout] Fonts not loaded, returning null");
    return null;
  }

  console.log("[RootLayout] Rendering stack");

  return (
    <UIWrapper>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(root)" options={{ headerShown: false }} />
        <Stack.Screen name="(business)" options={{ headerShown: false }} />
        <Stack.Screen name="(driver)" options={{ headerShown: false }} />
        <Stack.Screen name="(marketplace)" options={{ headerShown: false }} />
        <Stack.Screen name="(wallet)" options={{ headerShown: false }} />
        <Stack.Screen name="(emergency)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </UIWrapper>
  );
}
