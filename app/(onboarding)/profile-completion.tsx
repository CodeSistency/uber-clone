import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { TextField, Button, Glass } from "@/components/ui";
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
    isLoading,
  } = useOnboardingStore();

  const [form, setForm] = useState({
    address: userData.address || "",
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

      // Validate emergency contact data if partially filled
      if (
        form.emergencyContactName ||
        form.emergencyContactPhone ||
        form.emergencyContactRelationship
      ) {
        if (
          !form.emergencyContactName ||
          !form.emergencyContactPhone ||
          !form.emergencyContactRelationship
        ) {
          Alert.alert(
            "Error",
            "Please complete all emergency contact fields or leave them all empty",
          );
          return;
        }
      }

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

      // TODO: Backend doesn't support preferences in complete endpoint yet
      // Preferences are stored locally in userData but not sent to backend
      console.log("[ProfileCompletion] Preferences stored locally:", {
        preferredVehicleType: userData.preferredVehicleType,
        preferredServiceLevel: userData.preferredServiceLevel,
        preferredLanguage: userData.preferredLanguage,
        timezone: userData.timezone,
        currency: userData.currency,
      });

      // API call to complete onboarding (only profile data)
      const response = await fetchAPI("onboarding/complete", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          address: form.address || undefined,
          profileImage: undefined, // Would be handled by image upload
          emergencyContact,
        }),
      });

      console.log("[ProfileCompletion] Complete response:", response);

      const isSuccess =
        (response &&
          (response.success === true ||
            response.statusCode === 200 ||
            response.statusCode === 201)) ||
        (!("success" in (response || {})) &&
          !("statusCode" in (response || {})));

      if (isSuccess) {
        console.log("[ProfileCompletion] Onboarding completed successfully");
        completeOnboarding();
        router.replace("/(onboarding)/completion-success" as any);
      } else {
        throw new Error(response.message || "Failed to complete setup");
      }
    } catch (error: any) {
      console.error("[ProfileCompletion] Error completing setup:", error);

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
        totalSteps={4}
      />

      <ScrollView className="flex-1 px-5">
        {/* Title */}
        <View className="mb-8">
          <Text className="text-2xl font-Jakarta-Bold text-center text-gray-800 mb-2">
            🎉 You're Almost Done!
          </Text>
          <Text className="text-base font-Jakarta-Medium text-center text-gray-600">
            Complete your profile to start enjoying Uber
          </Text>
        </View>

        {/* Home Address */}
        <View className="mb-6">
          <TextField
            label="Home Address"
            placeholder="Calle 123, Centro, Caracas"
            value={form.address}
            onChangeText={(value) => handleInputChange("address", value)}
          />
          <Text className="text-xs text-gray-500 mt-1">Optional</Text>
        </View>

        {/* Profile Picture */}
        <View className="mb-6">
          <Text className="text-base font-Jakarta-Bold text-gray-800 mb-4">
            📸 Profile Picture (Optional)
          </Text>

          <View className="flex-row justify-center space-x-4">
            <Glass className="p-4 mr-2">
              <Text className="text-center font-Jakarta-Medium text-black dark:text-white">
                📷 Take Photo
              </Text>
            </Glass>
            <Glass className="p-4">
              <Text className="text-center font-Jakarta-Medium text-black dark:text-white">
                🖼️ Choose from Gallery
              </Text>
            </Glass>
          </View>
        </View>

        {/* Emergency Contact */}
        <View className="mb-8">
          <Text className="text-base font-Jakarta-Bold text-gray-800 mb-2">
            🚨 Emergency Contact
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            Optional - Leave all fields empty to skip
          </Text>

          <TextField
            label="Contact Name"
            placeholder="Maria Perez"
            value={form.emergencyContactName}
            onChangeText={(value) =>
              handleInputChange("emergencyContactName", value)
            }
            className="mb-4"
          />

          <TextField
            label="Contact Phone"
            placeholder="+58 414-123-4568"
            value={form.emergencyContactPhone}
            onChangeText={(value) =>
              handleInputChange("emergencyContactPhone", value)
            }
            keyboardType="phone-pad"
            className="mb-4"
          />

          <TextField
            label="Relationship"
            placeholder="Sister, Brother, Friend..."
            value={form.emergencyContactRelationship}
            onChangeText={(value) =>
              handleInputChange("emergencyContactRelationship", value)
            }
          />
        </View>

        {/* Complete Setup Button */}
        <View className="mb-6">
          <CustomButton
            title="🚀 Complete Setup & Start Riding"
            onPress={handleCompleteSetup}
            loading={isLoading}
            className="w-full"
          />
        </View>

        {/* Final Step Note */}
        <View className="items-center mb-4">
          <Text className="text-sm text-center text-primary font-Jakarta-Bold mb-1">
            🎯 Final Step
          </Text>
          <Text className="text-xs text-center text-gray-500">
            Your Uber experience awaits!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
