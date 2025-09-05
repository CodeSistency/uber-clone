import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

export default function ProfileCompletion() {
  console.log("[ProfileCompletion] Rendering profile completion");

  const {
    currentStep,
    progress,
    userData,
    updateUserData,
    completeOnboarding,
    previousStep,
    setLoading,
    setError,
  } = useOnboardingStore();

  const [form, setForm] = useState({
    address: userData.emergencyContact?.name ? "" : "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
  });

  const handleInputChange = (field: string, value: string) => {
    console.log(`[ProfileCompletion] Input change - ${field}:`, value);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompleteSetup = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[ProfileCompletion] Completing profile setup");

      // Prepare emergency contact data
      const emergencyContact = form.emergencyContactName
        ? {
            name: form.emergencyContactName,
            phone: form.emergencyContactPhone,
            relationship: form.emergencyContactRelationship,
          }
        : undefined;

      // Update local state
      updateUserData({
        emergencyContact,
      });

      // API call to complete onboarding
      const response = await fetchAPI("onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: form.address || undefined,
          profileImage: undefined, // Would be handled by image upload
          emergencyContact,
        }),
      });

      console.log("[ProfileCompletion] Complete response:", response);

      if (response.success) {
        console.log("[ProfileCompletion] Onboarding completed successfully");
        completeOnboarding();
        router.replace("/(onboarding)/welcome" as any);
      } else {
        throw new Error(response.message || "Failed to complete setup");
      }
    } catch (error: any) {
      console.error("[ProfileCompletion] Error completing setup:", error);
      setError(error.message || "Failed to complete profile setup");
      Alert.alert("Error", error.message || "Failed to complete profile setup");
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
          Complete Your Profile
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
            Almost there!
          </Text>
          <Text className="text-base font-Jakarta-Medium text-center text-gray-600">
            Add a few details to complete your profile
          </Text>
        </View>

        {/* Home Address */}
        <View className="mb-6">
          <InputField
            label="Home Address (Optional)"
            placeholder="Calle 123, Centro, Caracas"
            value={form.address}
            onChangeText={(value) => handleInputChange("address", value)}
          />
        </View>

        {/* Profile Picture */}
        <View className="mb-6">
          <Text className="text-base font-Jakarta-Bold text-gray-800 mb-4">
            📸 Profile Picture (Optional)
          </Text>

          <View className="flex-row justify-center space-x-4">
            <TouchableOpacity className="bg-gray-100 p-4 rounded-lg">
              <Text className="text-center font-Jakarta-Medium text-gray-700">
                📷 Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-100 p-4 rounded-lg">
              <Text className="text-center font-Jakarta-Medium text-gray-700">
                🖼️ Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Contact */}
        <View className="mb-8">
          <Text className="text-base font-Jakarta-Bold text-gray-800 mb-4">
            🚨 Emergency Contact (Optional)
          </Text>

          <InputField
            label="Contact Name"
            placeholder="Maria Perez"
            value={form.emergencyContactName}
            onChangeText={(value) =>
              handleInputChange("emergencyContactName", value)
            }
            className="mb-4"
          />

          <InputField
            label="Contact Phone"
            placeholder="+58 414-123-4568"
            value={form.emergencyContactPhone}
            onChangeText={(value) =>
              handleInputChange("emergencyContactPhone", value)
            }
            keyboardType="phone-pad"
            className="mb-4"
          />

          <InputField
            label="Relationship"
            placeholder="Sister, Brother, Friend..."
            value={form.emergencyContactRelationship}
            onChangeText={(value) =>
              handleInputChange("emergencyContactRelationship", value)
            }
          />
        </View>

        {/* Complete Setup Button */}
        <View className="mb-8">
          <CustomButton
            title="Complete Setup"
            onPress={handleCompleteSetup}
            className="w-full"
          />
        </View>

        {/* Final Step Note */}
        <Text className="text-sm text-center text-gray-400 mb-4">
          Final Step - You're all set!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
