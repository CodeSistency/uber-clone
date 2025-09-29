import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
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
    isLoading,
  } = useOnboardingStore();
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  // Dial code by country (subset for supported countries)
  const DIAL_CODES: Record<string, string> = {
    VE: "+58",
    CO: "+57",
    MX: "+52",
    AR: "+54",
    PE: "+51",
    CL: "+56",
    EC: "+593",
    BO: "+591",
  };
  const dialCode =
    userData.country && DIAL_CODES[userData.country]
      ? DIAL_CODES[userData.country]
      : "";

  const handleSendVerification = async () => {
    try {
      setLoading(true);
      setError(null);

      const fullPhone = `${dialCode}${userData.phone || ""}`.trim();
      console.log(
        "[PhoneVerification] Sending verification code to:",
        fullPhone,
      );

      // API call to send verification code
      const response = await fetchAPI("onboarding/verify-phone", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          phone: fullPhone,
        }),
      });

      console.log("[PhoneVerification] Send verification response:", response);

      const isSuccess =
        (response &&
          (response.success === true ||
            response.statusCode === 200 ||
            response.statusCode === 201)) ||
        (!("success" in (response || {})) &&
          !("statusCode" in (response || {})));

      if (isSuccess) {
        console.log("[PhoneVerification] Verification code sent successfully");
        setIsVerificationSent(true);
        // In a real implementation, you'd navigate to SMS code input
        // For now, we'll just skip this step
        nextStep();
        router.replace("/");
      } else {
        throw new Error(response.message || "Failed to send verification code");
      }
    } catch (error: any) {
      console.error("[PhoneVerification] Error sending verification:", error);

      // Handle authentication errors specially
      if (
        error.message?.includes("Authentication expired") ||
        error.message?.includes("Token inválido") ||
        error.statusCode === 401
      ) {
        setError("Your session has expired. Please log in again.");
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/sign-in"),
            },
          ],
        );
        return;
      }

      setError(error.message || "Failed to send verification code");
      Alert.alert("Error", error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    console.log("[PhoneVerification] Skipping phone verification");
    nextStep();
        router.replace("/");
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
        totalSteps={5}
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
            📱 {dialCode} {userData.phone}
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
          <Button
            title="Send Verification Code"
            onPress={handleSendVerification}
            loading={isLoading}
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
