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
import { registerAllSteps } from "@/components/unified-flow/registry";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs(["Clerk:"]);

export default function RootLayout() {
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
    if (loaded || error) {
      // Hide splash screen regardless of success/failure
      SplashScreen.hideAsync();

      // Validate environment configuration first (highest priority)
      try {
        const config = getConfig();
      } catch (error: any) {
        
        // In a production app, you might want to show an error screen or prevent app initialization
        // For now, we'll log the error but continue (useful for development)
        
      }

      // Perform health checks for critical endpoints
      (async () => {
        try {
          const healthResults: HealthCheckResult[] = await checkAllEndpoints();
          const allAvailable = areAllEndpointsAvailable();

          if (!allAvailable) {
            
            // In production, you might want to show a warning or retry
          }
        } catch (error: any) {
          
          
        }
      })();

      // Initialize connectivity manager first (foundation for all network operations)
      const initializeConnectivity = async () => {
        try {
          const { connectivityManager } = await import("@/lib/connectivity");
          await connectivityManager.initialize();
        } catch (error) {
          
          
        }
      };
      initializeConnectivity();

      // Initialize storage migration (MMKV migration from AsyncStorage)
      const initializeStorage = async () => {
        try {
          const { migrationManager } = await import("@/lib/storage/migrationManager");
          await migrationManager.checkAndMigrate();
        } catch (error) {
          console.error('[RootLayout] Storage migration failed:', error);
        }
      };
      initializeStorage();

      // Initialize Firebase (highest priority)
      try {
        firebaseService.initializeFirebase().catch((error: any) => {
          
        });
      } catch (error) {
        
      }

      // Initialize user store after fonts are loaded (or failed)
      try {
        const { initializeUserStore } = require("@/lib/auth");
        if (typeof initializeUserStore === "function") {
          initializeUserStore().catch((error: any) => {
            
          });
        } else {
          
        }
      } catch (error) {
        
      }

      // Initialize module store after user store
      try {
        const { initializeModuleStore } = require("@/store/module");
        if (typeof initializeModuleStore === "function") {
          initializeModuleStore().catch((error: any) => {
            
          });
        } else {
          
        }
      } catch (error) {
        
      }
    }

    if (error) {
      
    }
  }, [loaded, error]);

  // Load Dev flags once
  useEffect(() => {
    try {
      const { loadFromStorage } = require("@/store").useDevStore.getState();
      loadFromStorage?.();
    } catch {}
  }, []);

  // Register all step components once
  useEffect(() => {
    try {
      registerAllSteps();
    } catch (error) {
      if (__DEV__) {
        console.error('[App] Error registering step components:', error);
      }
    }
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
          const token = await tokenManager.getAccessToken();
          if (!token) {
            
            return;
          }
          await websocketService.connect(String(user.id), token);
        } else {
          websocketService.disconnect();
        }
      } catch (e: any) {
        
      }
    };

    connectWs();

    return () => {
      if (!isMounted) return;
      websocketService.disconnect();
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]);

  // Don't block app loading on font loading - render with system fonts as fallback
  if (!loaded && !error) {
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

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UIWrapper>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(customer)" options={{ headerShown: false }} />
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
