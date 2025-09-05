import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

export default function PhoneVerification() {
  console.log("[PhoneVerification] Rendering phone verification");

  const {
    currentStep,
    progress,
    userData,
    updateUserData,
    nextStep,
    previousStep,
    setLoading,
    setError,
  } = useOnboardingStore();
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const handleSendVerification = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "[PhoneVerification] Sending verification code to:",
        userData.phone,
      );

      // API call to send verification code
      const response = await fetchAPI("onboarding/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: userData.phone,
        }),
      });

      console.log("[PhoneVerification] Send verification response:", response);

      if (response.success) {
        console.log("[PhoneVerification] Verification code sent successfully");
        setIsVerificationSent(true);
        // In a real implementation, you'd navigate to SMS code input
        // For now, we'll just skip this step
        nextStep();
      } else {
        throw new Error(response.message || "Failed to send verification code");
      }
    } catch (error: any) {
      console.error("[PhoneVerification] Error sending verification:", error);
      setError(error.message || "Failed to send verification code");
      Alert.alert("Error", error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    console.log("[PhoneVerification] Skipping phone verification");
    nextStep();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-5">
        <TouchableOpacity
          onPress={() => {
            previousStep();
            router.back();
          }}
          className="p-2"
        >
          <Text className="text-xl text-gray-600">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-Jakarta-Bold text-gray-800">
          Phone Verification
        </Text>
        <View className="w-10" /> {/* Spacer for centering */}
      </View>

      {/* Progress Bar */}
      <ProgressBar
        progress={progress}
        currentStep={currentStep}
        totalSteps={7}
      />

      <View className="flex-1 px-5 justify-center">
        {/* Title */}
        <View className="mb-8">
          <Text className="text-2xl font-Jakarta-Bold text-center text-gray-800 mb-2">
            Let's verify your phone number
          </Text>
        </View>

        {/* Phone Display */}
        <View className="bg-gray-50 p-6 rounded-lg mb-8">
          <Text className="text-lg font-Jakarta-Bold text-center text-gray-800 mb-2">
            📱 {userData.phone}
          </Text>
          <Text className="text-base text-center text-gray-600">
            We'll send a code to verify your number
          </Text>
        </View>

        {/* Change Number */}
        <TouchableOpacity className="mb-8">
          <Text className="text-base text-center text-primary font-Jakarta-Medium">
            [Change Number]
          </Text>
        </TouchableOpacity>

        {/* Send Verification Button */}
        <View className="mb-4">
          <CustomButton
            title="Send Verification Code"
            onPress={handleSendVerification}
            className="w-full"
          />
        </View>

        {/* Skip Option */}
        <TouchableOpacity onPress={handleSkip} className="mb-4">
          <Text className="text-base text-center text-gray-500 font-Jakarta-Medium">
            Skip for now
          </Text>
        </TouchableOpacity>

        {/* Optional Note */}
        <Text className="text-sm text-center text-gray-400">
          *Optional step - you can skip this
        </Text>
      </View>
    </SafeAreaView>
  );
}
