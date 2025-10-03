import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button, TextField, Card, MultiStepForm } from "@/components/ui";
import { useDriverProfileStore } from "@/store/driverProfile";
import { useUI } from "@/components/UIWrapper";
import { useDriverNavigation } from "@/hooks/useDriverNavigation";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const DriverProfileEdit = () => {
  const { profile, isLoading, error, fetchProfile, updateProfile } =
    useDriverProfileStore();

  const { showError, showSuccess } = useUI();
  const { hasActiveRide, currentServiceType } = useDriverNavigation();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user has active ride
    if (hasActiveRide) {
      showError(
        "Action Not Available",
        `You cannot edit your profile while on an active ${currentServiceType || "service"}. Please complete your current service first.`,
      );
      router.back();
      return;
    }

    // Fetch profile data
    fetchProfile();
  }, [hasActiveRide, currentServiceType, fetchProfile, showError]);

  useEffect(() => {
    // Populate form with existing data
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (error) {
      showError("Error", error);
    }
  }, [error, showError]);

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      showError("Validation Error", "First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      showError("Validation Error", "Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      showError("Validation Error", "Email is required");
      return false;
    }
    if (!formData.phone.trim()) {
      showError("Validation Error", "Phone number is required");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError("Validation Error", "Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await updateProfile(formData);
      showSuccess(
        "Profile Updated",
        "Your profile has been updated successfully",
      );

      // Navigate back after successful update
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      // Error is already handled in the store
      console.error("Profile update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard your changes?",
      [
        { text: "Keep Editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() },
      ],
    );
  };

  if (isLoading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-general-500 justify-center items-center">
        <Text className="text-lg">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-general-500 justify-center items-center">
        <Text className="text-lg text-danger-500">Failed to load profile</Text>
        <Button title="Retry" onPress={fetchProfile} className="mt-4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Edit Profile</Text>
        <Text className="text-secondary-600 mt-1">
          Update your personal information
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Profile Photo Section */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">Profile Photo</Text>
            <View className="items-center">
              <View className="w-24 h-24 bg-primary-100 rounded-full mb-4 items-center justify-center">
                <Text className="text-3xl">👤</Text>
              </View>
              <Button
                title="Change Photo"
                onPress={() => {
                  Alert.alert(
                    "Coming Soon",
                    "Photo upload functionality will be available soon",
                  );
                }}
                variant="outline"
                className="px-6"
              />
            </View>
          </Card>

          {/* Personal Information Form - Using MultiStepForm */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">
              Personal Information
            </Text>

            <View className="space-y-4">
              <TextField
                label="First Name"
                value={formData.firstName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, firstName: text }))
                }
                placeholder="Enter your first name"
              />

              <TextField
                label="Last Name"
                value={formData.lastName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, lastName: text }))
                }
                placeholder="Enter your last name"
              />

              <TextField
                label="Email Address"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextField
                label="Phone Number"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phone: text }))
                }
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </Card>

          {/* Action Buttons */}
          <View className="flex-row space-x-4">
            <Button
              title="Cancel"
              onPress={handleCancel}
              className="flex-1"
              variant="outline"
              disabled={isSubmitting}
            />
            <Button
              title={isSubmitting ? "Saving..." : "Save Changes"}
              onPress={handleSubmit}
              className="flex-1"
              variant="primary"
              disabled={isSubmitting}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverProfileEdit;
