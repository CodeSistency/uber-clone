import React, { useEffect, useState, useCallback, useRef } from "react";
import { Stack } from "expo-router";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { router } from "expo-router";

import { 
  AnimatedDrawerLayout, 
  AnimatedBackdrop, 
  DriverModuleDrawerContent 
} from "@/components/drawer";
import { useUI } from "@/components/UIWrapper";
import { useUserStore } from "@/store/user";
import { useDriverRoleStore } from "@/store/driverRole";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function DriverLayout() {
  const { theme, showError } = useUI();
  const { user, isAuthenticated, isLoading: authLoading } = useUserStore();
  const {
    isDriver,
    driverRole,
    isLoading: roleLoading,
    error: roleError,
    checkDriverRole,
  } = useDriverRoleStore();
  const [authChecked, setAuthChecked] = useState(false);
  const verificationInProgressRef = useRef(false);
  const authCheckCompletedRef = useRef(false);
  
  const drawerWidth = SCREEN_WIDTH * 0.6;
  const overflowMargin = SCREEN_WIDTH * 0.1;

  // Memoized authorization check function
  const checkAuthorization = useCallback(async () => {
    // Prevent multiple simultaneous verifications
    if (verificationInProgressRef.current) {
      
      return;
    }

    // Skip if we already completed auth check
    if (authCheckCompletedRef.current) {
      
      return;
    }

    try {
      
      verificationInProgressRef.current = true;

      // Wait for authentication to be determined
      if (authLoading) {
        
        verificationInProgressRef.current = false;
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated) {
        
        Alert.alert("No se pudo cambiar el módulo", "Usuario no autenticado");
        router.replace("/(auth)/sign-in");
        setAuthChecked(true);
        authCheckCompletedRef.current = true;
        verificationInProgressRef.current = false;
        return;
      }

      // Check driver role using the DriverRoleStore
      
      try {
        await checkDriverRole();
        
      } catch (roleError) {
        
        // Continue with the layout decision even if role check fails
        // The store will handle the error state
      }

      // Role check is handled by the store
      setAuthChecked(true);
      authCheckCompletedRef.current = true;
    } catch (error: any) {
      
      Alert.alert(
        "No se pudo cambiar el módulo",
        "Error al verificar permisos",
      );
      setAuthChecked(true);
      authCheckCompletedRef.current = true;
    } finally {
      verificationInProgressRef.current = false;
    }
  }, [isAuthenticated, authLoading, showError, checkDriverRole]);

  // Check if user is authenticated and has driver role
  useEffect(() => {
    checkAuthorization();
  }, [checkAuthorization]); // Only depend on the memoized function

  // Show loading while checking authentication and role
  if (!authChecked || authLoading || roleLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-general-500">
        <ActivityIndicator size="large" color="#0286FF" />
        <Text className="text-secondary-600 mt-4 font-JakartaMedium">
          Verifying driver access...
        </Text>
      </View>
    );
  }

  // Show unauthorized message if not a driver
  if (!isDriver) {
    return (
      <View className="flex-1 justify-center items-center bg-general-500 px-6">
        <Text className="text-6xl mb-4">🚗</Text>
        <Text className="text-xl font-JakartaBold text-center mb-2">
          Driver Access Required
        </Text>
        <Text className="text-secondary-600 text-center mb-6">
          You need to complete the driver onboarding process to access this
          section.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(driver)/onboarding" as any)}
          className="bg-primary-500 px-6 py-3 rounded-lg mb-4"
        >
          <Text className="text-white font-JakartaBold">
            Start Driver Onboarding
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("/(auth)/welcome")}>
          <Text className="text-primary-500 font-JakartaMedium">
            Switch to Customer Mode
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AnimatedDrawerLayout
      width={drawerWidth}
      screenWidth={SCREEN_WIDTH}
      overflowMargin={overflowMargin}
      animationDuration={300}
      scaleFactor={0.65}
      borderRadius={24}
      secondaryScaleFactor={0.75}
      secondaryTranslateMultiplier={0.75}
      renderBackdrop={({ progress }) => <AnimatedBackdrop progress={progress} />}
      renderDrawer={(params) => <DriverModuleDrawerContent drawerParams={params} />}
      renderContent={(params) => (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: theme === "dark" ? "#000000" : "#FFFFFF",
            },
            // Driver-specific navigation options
            animation: "slide_from_right",
            presentation: "card",
          }}
        >
          {/* Core driver functionality */}
          <Stack.Screen
            name="dashboard"
            options={{
              title: "Driver Dashboard",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="earnings"
            options={{
              title: "Earnings",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="safety"
            options={{
              title: "Safety",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ratings"
            options={{
              title: "Ratings",
              headerShown: false,
            }}
          />

          {/* Driver management screens */}
          <Stack.Screen
            name="profile"
            options={{
              title: "Driver Profile",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="vehicles"
            options={{
              title: "My Vehicles",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="documents"
            options={{
              title: "Documents",
              headerShown: false,
            }}
          />

          {/* Additional driver screens */}
          <Stack.Screen
            name="settings"
            options={{
              title: "Settings",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ride-requests"
            options={{
              title: "Ride Requests",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="active-ride"
            options={{
              title: "Active Ride",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="wallet"
            options={{
              title: "Driver Wallet",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="emergency"
            options={{
              title: "Emergency",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="support"
            options={{
              title: "Driver Support",
              headerShown: false,
            }}
          />
        </Stack>
      )}
    />
  );
}
