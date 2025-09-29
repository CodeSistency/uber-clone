import React from "react";
import { View, Text, SafeAreaView } from "react-native";

const SafetyResources = () => {
  return (
    <SafeAreaView className="flex-1 bg-general-500 justify-center items-center">
      <Text className="text-lg text-center px-4">
        Safety Resources feature coming soon!
      </Text>
      <Text className="text-secondary-600 text-center px-4 mt-2">
        Access safety guidelines, training materials, and emergency procedures.
      </Text>
    </SafeAreaView>
  );
};

export default SafetyResources;
