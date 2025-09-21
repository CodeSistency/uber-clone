import { router } from "expo-router";
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUI } from "@/components/UIWrapper";

export default function CompletionSuccess() {
  const { theme } = useUI();

  useEffect(() => {
    const t = setTimeout(
      () => router.replace("/(root)/(tabs)/home" as any),
      1200,
    );
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView
      className={`flex-1 bg-brand-primary dark:bg-brand-primaryDark items-center justify-center`}
    >
      <View className="items-center">
        <View className="w-24 h-24 rounded-full bg-brand-secondary items-center justify-center mb-4">
          <Text className="text-4xl">✅</Text>
        </View>
        <Text
          className={`text-2xl font-JakartaBold text-black dark:text-white mb-1`}
        >
          All set!
        </Text>
        <Text className={`text-gray-600 dark:text-gray-300`}>
          Taking you to the app…
        </Text>
      </View>
    </SafeAreaView>
  );
}
