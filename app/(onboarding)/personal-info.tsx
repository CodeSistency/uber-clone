import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import * as Haptics from "expo-haptics";
// Simple date picker fallback
const SimpleDatePicker = ({ onChange, value }: { onChange: (date: string) => void; value?: string }) => {
  const [inputValue, setInputValue] = useState(value || "");

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (text.match(/^\d{4}-\d{2}-\d{2}$/)) {
      onChange(text);
    }
  };

  return (
    <View className="mt-2">
      <InputField
        label=""
        placeholder="YYYY-MM-DD"
        value={inputValue}
        onChangeText={handleInputChange}
        keyboardType="numeric"
      />
      <Text className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD</Text>
    </View>
  );
};

// Use simple date picker instead of native DateTimePicker to avoid compatibility issues
const DateTimePickerComponent = null;
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
    isLoading,
  } = useOnboardingStore();

  const [form, setForm] = useState({
    phone: userData.phone || "",
    dateOfBirth: userData.dateOfBirth || "",
    gender: userData.gender || "",
  });

  const [dobDate, setDobDate] = useState<Date | undefined>(
    form.dateOfBirth ? new Date(form.dateOfBirth) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    console.log(`[PersonalInfo] Input change - ${field}:`, value);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatPhone = (raw: string): string => {
    const cleaned = raw.replace(/[^+\d]/g, "");
    if (cleaned.startsWith("+58")) {
      const digits = cleaned.replace(/\D/g, "").slice(2);
      const a = digits.slice(0, 3);
      const b = digits.slice(3, 6);
      const c = digits.slice(6, 10);
      let out = "+58";
      if (a) out += ` ${a}`;
      if (b) out += `-${b}`;
      if (c) out += `-${c}`;
      return out;
    }
    return cleaned;
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const onChangeDate = (_: any, selected?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (selected) {
      setDobDate(selected);
      const iso = selected.toISOString().slice(0, 10);
      setForm((prev) => ({ ...prev, dateOfBirth: iso }));
    }
  };

  const onSimpleDateChange = (date: string) => {
    setForm((prev) => ({ ...prev, dateOfBirth: date }));
  };

  const handleGenderSelect = (gender: "male" | "female" | "other") => {
    console.log("[PersonalInfo] Selected gender:", gender);
    setForm((prev) => ({ ...prev, gender }));
    Haptics.selectionAsync();
  };

  const handleContinue = async () => {
    // Validate form
    if (!form.phone || !form.dateOfBirth || !form.gender) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Validate phone format (basic international +58 mask visible, regex flexible)
    const phoneRegex = /^\+?\d[\d\s-]{7,}$/;
    if (!phoneRegex.test(form.phone)) {
      Alert.alert(
        "Error",
        "Please enter a valid Venezuelan phone number (+58 XXX XXX XXXX)",
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        requiresAuth: true,
        body: JSON.stringify({
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
        }),
      });

      console.log("[PersonalInfo] API response:", response);

      const isSuccess = (response && (response.success === true || response.statusCode === 200 || response.statusCode === 201)) || (!('success' in (response || {})) && !('statusCode' in (response || {})));

      if (isSuccess) {
        console.log("[PersonalInfo] Personal info saved successfully");
        nextStep();
        // Navigate to onboarding index to redirect based on updated step
        router.replace('/(onboarding)');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error(
          response.message || "Failed to save personal information",
        );
      }
    } catch (error: any) {
      console.error("[PersonalInfo] Error saving personal info:", error);

      // Handle authentication errors specially
      if (error.message?.includes("Authentication expired") ||
          error.message?.includes("Token inválido") ||
          error.statusCode === 401) {
        setError("Your session has expired. Please log in again.");
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/sign-in")
            }
          ]
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      setError(error.message || "Failed to save personal information");
      Alert.alert(
        "Error",
        error.message || "Failed to save personal information",
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        totalSteps={4}
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
            onChangeText={(value) => handleInputChange("phone", formatPhone(value))}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
          />
          <Text className={`text-xs mt-1 ${/^\+?\d[\d\s-]{7,}$/.test(form.phone) ? 'text-green-600' : 'text-red-500'}`}>
            {/^\+?\d[\d\s-]{7,}$/.test(form.phone) ? 'Phone looks good' : 'Enter a valid phone number'}
          </Text>
        </View>

        {/* Date of Birth */}
        <View className="mb-6">
          <Text className="text-base font-Jakarta-Bold text-gray-800 mb-2">
            Date of Birth
          </Text>
          <TouchableOpacity
            className="rounded-full bg-neutral-100 border border-neutral-100 px-4 py-4"
            onPress={openDatePicker}
            accessibilityRole="button"
            accessibilityLabel="Select date of birth"
          >
            <Text className="font-Jakarta-Medium text-[15px] text-gray-800">
              {form.dateOfBirth || "Select your birth date"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <SimpleDatePicker
              onChange={onSimpleDateChange}
              value={form.dateOfBirth}
            />
          )}
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
            disabled={!/^\+?\d[\d\s-]{7,}$/.test(form.phone) || !form.phone || !form.dateOfBirth || !form.gender}
            loading={isLoading}
            className="w-full"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
