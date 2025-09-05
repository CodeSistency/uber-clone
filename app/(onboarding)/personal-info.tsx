import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

export default function PersonalInfo() {
  console.log("[PersonalInfo] Rendering personal info");

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

  const [form, setForm] = useState({
    phone: userData.phone || "",
    dateOfBirth: userData.dateOfBirth || "",
    gender: userData.gender || "",
  });

  const handleInputChange = (field: string, value: string) => {
    console.log(`[PersonalInfo] Input change - ${field}:`, value);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenderSelect = (gender: "male" | "female" | "other") => {
    console.log("[PersonalInfo] Selected gender:", gender);
    setForm((prev) => ({ ...prev, gender }));
  };

  const handleContinue = async () => {
    // Validate form
    if (!form.phone || !form.dateOfBirth || !form.gender) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Validate phone format (Venezuelan format)
    const phoneRegex = /^\+58\s?\d{3}[-\s]?\d{3}[-\s]?\d{4}$/;
    if (!phoneRegex.test(form.phone)) {
      Alert.alert(
        "Error",
        "Please enter a valid Venezuelan phone number (+58 XXX XXX XXXX)",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("[PersonalInfo] Saving personal info:", form);

      // Update local state
      updateUserData({
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender as "male" | "female" | "other",
      });

      // API call to save personal info
      const response = await fetchAPI("onboarding/personal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
        }),
      });

      console.log("[PersonalInfo] API response:", response);

      if (response.success) {
        console.log("[PersonalInfo] Personal info saved successfully");
        nextStep();
      } else {
        throw new Error(
          response.message || "Failed to save personal information",
        );
      }
    } catch (error: any) {
      console.error("[PersonalInfo] Error saving personal info:", error);
      setError(error.message || "Failed to save personal information");
      Alert.alert(
        "Error",
        error.message || "Failed to save personal information",
      );
    } finally {
      setLoading(false);
    }
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
          Personal Information
        </Text>
        <View className="w-10" /> {/* Spacer for centering */}
      </View>

      {/* Progress Bar */}
      <ProgressBar
        progress={progress}
        currentStep={currentStep}
        totalSteps={7}
      />

      <ScrollView className="flex-1 px-5">
        {/* Title */}
        <View className="mb-8">
          <Text className="text-2xl font-Jakarta-Bold text-center text-gray-800 mb-2">
            Let's get to know you better
          </Text>
        </View>

        {/* Phone Number */}
        <View className="mb-6">
          <InputField
            label="Phone Number"
            placeholder="+58 414-123-4567"
            value={form.phone}
            onChangeText={(value) => handleInputChange("phone", value)}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
          />
        </View>

        {/* Date of Birth */}
        <View className="mb-6">
          <InputField
            label="Date of Birth"
            placeholder="1990-05-15"
            value={form.dateOfBirth}
            onChangeText={(value) => handleInputChange("dateOfBirth", value)}
            keyboardType="numeric"
          />
          <Text className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD</Text>
        </View>

        {/* Gender Selection */}
        <View className="mb-8">
          <Text className="text-base font-Jakarta-Bold text-gray-800 mb-4">
            👤 Gender
          </Text>

          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => handleGenderSelect("male")}
              className={`flex-1 p-4 mr-2 rounded-lg border-2 ${
                form.gender === "male"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              }`}
            >
              <Text className="text-center font-Jakarta-Medium text-gray-800">
                Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleGenderSelect("female")}
              className={`flex-1 p-4 mx-2 rounded-lg border-2 ${
                form.gender === "female"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              }`}
            >
              <Text className="text-center font-Jakarta-Medium text-gray-800">
                Female
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleGenderSelect("other")}
              className={`flex-1 p-4 ml-2 rounded-lg border-2 ${
                form.gender === "other"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              }`}
            >
              <Text className="text-center font-Jakarta-Medium text-gray-800">
                Other
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Button */}
        <View className="mb-8">
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            disabled={!form.phone || !form.dateOfBirth || !form.gender}
            className="w-full"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
