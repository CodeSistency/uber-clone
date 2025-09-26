import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View, Text } from "react-native";
import "react-native-reanimated";
import "react-native-get-random-values";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { firebaseService } from "@/app/services/firebaseService";
import { websocketService } from "@/app/services/websocketService";
import ErrorBoundary from "@/components/ErrorBoundary";
import UIWrapper from "@/components/UIWrapper";
import { initializeUserStore } from "@/lib/auth";
import { tokenManager } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import {
  checkAllEndpoints,
  areAllEndpointsAvailable,
  HealthCheckResult,
} from "@/lib/endpoints";
import { useUserStore } from "@/store";
import { useDevStore } from "@/store";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs(["Clerk:"]);

export default function RootLayout() {
  console.log("[RootLayout] Rendering root layout");

  const { isAuthenticated, user } = useUserStore();

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

      // Validate environment configuration first (highest priority)
      console.log("[RootLayout] Validating environment configuration...");
      try {
        const config = getConfig();
        console.log(
          "[RootLayout] ✅ Environment configuration validated successfully",
        );
        console.log("[RootLayout] Environment:", process.env.NODE_ENV || 'development');
        console.log("[RootLayout] API URL:", config.EXPO_PUBLIC_SERVER_URL || 'Not configured');
      } catch (error: any) {
        console.error(
          "[RootLayout] ❌ Environment configuration failed:",
          error.message,
        );
        // In a production app, you might want to show an error screen or prevent app initialization
        // For now, we'll log the error but continue (useful for development)
        console.warn(
          "[RootLayout] Continuing with potentially incomplete configuration...",
        );
      }

      // Perform health checks for critical endpoints
      console.log("[RootLayout] Performing endpoint health checks...");
      (async () => {
        try {
          const healthResults: HealthCheckResult[] = await checkAllEndpoints();
        const allAvailable = areAllEndpointsAvailable();

        console.log("[RootLayout] Health check results:");
        healthResults.forEach((result) => {
          const status = result.available ? "✅" : "❌";
          console.log(
            `[RootLayout] ${status} ${result.endpoint}: ${result.available ? "Available" : result.error || "Unavailable"} (${result.responseTime}ms)`,
          );
        });

        if (!allAvailable) {
          console.warn(
            "[RootLayout] ⚠️ Some endpoints are not available. App may have limited functionality.",
          );
          // In production, you might want to show a warning or retry
        } else {
          console.log("[RootLayout] ✅ All critical endpoints are available");
        }
      } catch (error: any) {
        console.error("[RootLayout] ❌ Health check failed:", error.message);
        console.warn("[RootLayout] Continuing without health check results...");
      }
      })();

      // Initialize Firebase first (highest priority)
      console.log("[RootLayout] Initializing Firebase service...");
      try {
        firebaseService.initializeFirebase().catch((error: any) => {
          console.warn(
            "[RootLayout] Firebase initialization failed (expected in dev):",
            error.message,
          );
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

      // Initialize module store after user store
      console.log("[RootLayout] Initializing module store...");
      try {
        const { initializeModuleStore } = require("@/store/module");
        if (typeof initializeModuleStore === "function") {
          initializeModuleStore().catch((error: any) => {
            console.warn(
              "[RootLayout] Failed to initialize module store (non-critical):",
              error,
            );
          });
        } else {
          console.error("[RootLayout] initializeModuleStore is not a function");
        }
      } catch (error) {
        console.warn(
          "[RootLayout] Error importing initializeModuleStore (non-critical):",
          error,
        );
      }
    }

    if (error) {
      console.error("[RootLayout] Font loading error:", error);
    }
  }, [loaded, error]);

  // Load Dev flags once
  useEffect(() => {
    try {
      const { loadFromStorage } = require("@/store").useDevStore.getState();
      loadFromStorage?.();
    } catch {}
  }, []);

  // Connect WebSocket when authenticated
  useEffect(() => {
    let isMounted = true;
    const connectWs = async () => {
      try {
        if (
          isAuthenticated &&
          user?.id &&
          !(
            useDevStore.getState().developerMode &&
            useDevStore.getState().wsBypass
          )
        ) {
          console.log(
            "[RootLayout] Attempting WebSocket connect for user:",
            user.id,
          );
          const token = await tokenManager.getAccessToken();
          if (!token) {
            console.warn(
              "[RootLayout] No access token available for WebSocket connect",
            );
            return;
          }
          await websocketService.connect(String(user.id), token);
          console.log("[RootLayout] WebSocket connected");
        } else {
          console.log(
            "[RootLayout] Not authenticated, ensuring WebSocket disconnected",
          );
          websocketService.disconnect();
        }
      } catch (e: any) {
        console.warn("[RootLayout] WebSocket connect failed:", e?.message || e);
      }
    };

    connectWs();

    return () => {
      if (!isMounted) return;
      console.log("[RootLayout] Cleaning up WebSocket on unmount/auth change");
      websocketService.disconnect();
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]);

  // Don't block app loading on font loading - render with system fonts as fallback
  if (!loaded && !error) {
    console.log("[RootLayout] Fonts still loading, showing loading state");
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UIWrapper>
          <View className="flex-1 items-center justify-center bg-brand-primary dark:bg-brand-primaryDark">
            <Text className="text-lg font-JakartaMedium text-secondary-600 dark:text-gray-300">
              Loading...
            </Text>
          </View>
        </UIWrapper>
      </GestureHandlerRootView>
    );
  }

  console.log("[RootLayout] Rendering stack");

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.log(
          "[RootLayout] Error boundary caught error:",
          error,
          errorInfo,
        );
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UIWrapper>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(root)" options={{ headerShown: false }} />
            <Stack.Screen name="(business)" options={{ headerShown: false }} />
            <Stack.Screen name="(driver)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(marketplace)"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </UIWrapper>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
