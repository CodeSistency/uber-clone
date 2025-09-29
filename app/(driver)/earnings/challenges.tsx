import React from "react";
import { View, Text, SafeAreaView } from "react-native";

const DriverChallenges = () => {
  return (
    <SafeAreaView className="flex-1 bg-general-500 justify-center items-center">
      <Text className="text-lg text-center px-4">
        Challenges feature coming soon!
      </Text>
      <Text className="text-secondary-600 text-center px-4 mt-2">
        Complete challenges to earn bonuses and rewards.
      </Text>
    </SafeAreaView>
  );
};

export default DriverChallenges;
