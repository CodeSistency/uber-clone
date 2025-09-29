import React from "react";
import { View, Text, SafeAreaView } from "react-native";

const AddEmergencyContact = () => {
  return (
    <SafeAreaView className="flex-1 bg-general-500 justify-center items-center">
      <Text className="text-lg text-center px-4">
        Add Emergency Contact feature coming soon!
      </Text>
      <Text className="text-secondary-600 text-center px-4 mt-2">
        Add trusted contacts who will be notified in case of emergency.
      </Text>
    </SafeAreaView>
  );
};

export default AddEmergencyContact;
