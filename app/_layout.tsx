import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View, Text } from "react-native";
import "react-native-reanimated";
import "react-native-get-random-values";
import { LogBox } from "react-native";

import UIWrapper from "@/components/UIWrapper";
import { initializeUserStore } from "@/lib/auth";
import { firebaseService } from "@/app/services/firebaseService";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs(["Clerk:"]);

export default function RootLayout() {
  console.log("[RootLayout] Rendering root layout");

  const [loaded, error] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    Jakarta: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    console.log("[RootLayout] useEffect - loaded:", loaded, "error:", error);
    if (loaded || error) {
      // Hide splash screen regardless of success/failure
      SplashScreen.hideAsync();

      // Initialize Firebase first (highest priority)
      console.log("[RootLayout] Initializing Firebase service...");
      try {
        firebaseService.initializeFirebase().catch((error: any) => {
          console.warn("[RootLayout] Firebase initialization failed (expected in dev):", error.message);
        });
      } catch (error) {
        console.warn("[RootLayout] Error initializing Firebase:", error);
      }

      // Initialize user store after fonts are loaded (or failed)
      console.log("[RootLayout] Initializing user store...");
      try {
        const { initializeUserStore } = require("@/lib/auth");
        if (typeof initializeUserStore === "function") {
          initializeUserStore().catch((error: any) => {
            console.error(
              "[RootLayout] Failed to initialize user store:",
              error,
            );
          });
        } else {
          console.error("[RootLayout] initializeUserStore is not a function");
        }
      } catch (error) {
        console.error(
          "[RootLayout] Error importing initializeUserStore:",
          error,
        );
      }
    }

    if (error) {
      console.error("[RootLayout] Font loading error:", error);
    }
  }, [loaded, error]);

  // Don't block app loading on font loading - render with system fonts as fallback
  if (!loaded && !error) {
    console.log("[RootLayout] Fonts still loading, showing loading state");
    return (
      <UIWrapper>
        <View className="flex-1 items-center justify-center bg-brand-primary dark:bg-brand-primaryDark">
          <Text className="text-lg font-JakartaMedium text-secondary-600 dark:text-gray-300">Loading...</Text>
        </View>
      </UIWrapper>
    );
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
        <Stack.Screen name="+not-found" />
      </Stack>
    </UIWrapper>
  );
}
