import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { useUI } from "@/components/UIWrapper";
import { useOnboardingStore } from "@/store";

export default function Welcome() {
  console.log("[Welcome] Rendering welcome screen");

  const { resetOnboarding } = useOnboardingStore();
  const { theme } = useUI();

  const handleStartExploring = () => {
    console.log("[Welcome] Starting exploration");
    // Don't reset onboarding here - keep the completion status
    router.replace("/(root)/(tabs)/home");
  };

  const handleViewProfile = () => {
    console.log("[Welcome] Viewing profile");
    // Don't reset onboarding here - keep the completion status
    router.replace("/(root)/(tabs)/profile");
  };

  return (
    <SafeAreaView
      className={`flex-1 bg-brand-primary dark:bg-brand-primaryDark`}
    >
      <View className="flex-1 px-5 justify-center items-center">
        {/* Success Icon */}
        <View className="mb-8">
          <Text className="text-6xl text-center">🎉</Text>
        </View>

        {/* Welcome Title */}
        <View className="mb-8">
          <Text
            className={`text-3xl font-Jakarta-Bold text-center text-gray-800 dark:text-white mb-4`}
          >
            Welcome to Uber!
          </Text>

          <View
            className={`bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-6`}
          >
            <Text
              className={`text-lg font-Jakarta-Bold text-center text-green-800 dark:text-green-300 mb-2`}
            >
              ✅ Setup Complete!
            </Text>
            <Text
              className={`text-base text-center text-green-700 dark:text-green-400`}
            >
              Your profile is ready and personalized just for you.
            </Text>
          </View>

          <Text
            className={`text-lg text-center text-gray-600 dark:text-gray-300 mb-6`}
          >
            🚗 Ready to book your first ride?
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-4">
          <Button
            title="Start Exploring"
            onPress={handleStartExploring}
            className="w-full"
          />

          <TouchableOpacity
            onPress={handleViewProfile}
            className={`bg-gray-100 dark:bg-gray-700 p-4 rounded-lg`}
          >
            <Text
              className={`text-center font-Jakarta-Bold text-gray-700 dark:text-gray-200`}
            >
              View Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
