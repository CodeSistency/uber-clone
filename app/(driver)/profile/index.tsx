import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button, TextField, Card } from "@/components/ui";
import { useDriverProfileStore } from "@/store/driverProfile";
import { useUI } from "@/components/UIWrapper";
import { useDriverNavigation } from "@/hooks/useDriverNavigation";

const DriverProfile = () => {
  const {
    profile,
    documents,
    isLoading,
    error,
    fetchProfile,
    updateProfile
  } = useDriverProfileStore();

  const { showError, showSuccess } = useUI();
  const { hasActiveRide, currentServiceType, navigateToVehicles, navigateToEarnings } = useDriverNavigation();

  useEffect(() => {
    // Fetch profile data on component mount
    fetchProfile();
  }, [fetchProfile]);

  // Fetch vehicles and documents when profile is loaded
  useEffect(() => {
    if (profile) {
      // These will be called by individual views when needed
      // fetchVehicles();
      // fetchDocuments();
    }
  }, [profile]);

  useEffect(() => {
    if (error) {
      showError("Error", error);
    }
  }, [error]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-success-500";
      case "pending":
        return "text-warning-500";
      case "rejected":
        return "text-danger-500";
      case "in_review":
        return "text-blue-500";
      default:
        return "text-secondary-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return "✅";
      case "pending":
        return "⏳";
      case "rejected":
        return "❌";
      case "in_review":
        return "🔄";
      default:
        return "📄";
    }
  };

  const handleEditPersonalInfo = () => {
    if (hasActiveRide) {
      showError(
        "Action Not Available",
        `You cannot edit personal information while on an active ${currentServiceType || "service"}. Please complete your current service first.`
      );
      return;
    }

    Alert.alert(
      "Edit Personal Information",
      "Personal info editing - integrate with form component",
      [{ text: "OK" }]
    );
  };

  const handleUpdateVehicle = () => {
    navigateToVehicles();
  };

  const handleViewEarnings = () => {
    navigateToEarnings();
  };

  const handleUploadDocument = (docType: string) => {
    Alert.alert(
      "Upload Document",
      `Upload ${docType} functionality - integrate with camera/gallery API`,
      [{ text: "OK" }]
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
        <TouchableOpacity
          onPress={() => fetchProfile()}
          className="mt-4 bg-primary-500 px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Profile</Text>
        <Text className="text-secondary-600 mt-1">
          Manage your account and vehicle information
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Profile Header */}
        <View className="bg-white rounded-lg p-4 mb-4 items-center">
          <Image
            source={{ uri: "https://via.placeholder.com/100x100" }}
            className="w-20 h-20 rounded-full mb-3"
          />
          <Text className="text-xl font-JakartaExtraBold mb-1">
            {profile.firstName} {profile.lastName}
          </Text>
          <Text className="text-secondary-600 mb-2">{profile.email}</Text>

          {/* Statistics - Using Badge component for better visual hierarchy */}
          <View className="flex-row justify-between mt-4">
            <View className="items-center flex-1">
              <View className="bg-warning-50 px-3 py-2 rounded-lg mb-1">
                <Text className="text-lg font-JakartaBold text-warning-600">
                  ⭐ {profile.averageRating}
                </Text>
              </View>
              <Text className="text-xs text-secondary-600 font-JakartaMedium">Rating</Text>
            </View>
            <View className="items-center flex-1">
              <View className="bg-primary-50 px-3 py-2 rounded-lg mb-1">
                <Text className="text-lg font-JakartaBold text-primary-600">
                  {profile.totalRides}
                </Text>
              </View>
              <Text className="text-xs text-secondary-600 font-JakartaMedium">Trips</Text>
            </View>
            <View className="items-center flex-1">
              <View className="bg-success-50 px-3 py-2 rounded-lg mb-1">
                <Text className="text-lg font-JakartaBold text-success-600">
                  {new Date(profile.joinedDate).getFullYear()}
                </Text>
              </View>
              <Text className="text-xs text-secondary-600 font-JakartaMedium">Member</Text>
            </View>
          </View>
        </View>

        {/* Personal Information - Using @ui/ components */}
        <Card className="mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-JakartaBold">
              Personal Information
            </Text>
            <Button
              title="Edit"
              onPress={() => router.push("/(driver)/profile/edit" as any)}
              variant="outline"
              className="px-4 py-2"
            />
          </View>

          <View className="space-y-4">
            <TextField
              label="Full Name"
              value={`${profile.firstName} ${profile.lastName}`}
              editable={false}
              containerClassName="bg-general-50"
            />

            <TextField
              label="Email"
              value={profile.email}
              editable={false}
              containerClassName="bg-general-50"
            />

            <TextField
              label="Phone"
              value={profile.phone}
              editable={false}
              containerClassName="bg-general-50"
            />
          </View>
        </Card>

        {/* Quick Actions - Using @ui/ Button component */}
        <Card className="mb-4">
          <Text className="text-lg font-JakartaBold mb-4">Quick Actions</Text>

          <View className="space-y-3">
            <Button
              title="Manage Vehicles"
              onPress={handleUpdateVehicle}
              className="w-full"
              variant="primary"
            />
            <Button
              title="View Earnings"
              onPress={handleViewEarnings}
              className="w-full"
              variant="success"
            />
          </View>
        </Card>

        {/* Documents Status */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">
            Verification Status
          </Text>

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-secondary-600">Documents Verified</Text>
            <Text className="font-JakartaBold">
              {documents.filter(d => d.status === "approved").length}/{documents.length}
            </Text>
          </View>

          <Button
            title="Manage Documents"
            onPress={() => router.push("/(driver)/documents" as any)}
            className="w-full"
            variant="outline"
          />
        </View>

        {/* Account Actions */}
        <View className="bg-white rounded-lg p-4 mb-8">
          <Text className="text-lg font-JakartaBold mb-3">Account Actions</Text>

          <View className="space-y-3">
            <TouchableOpacity className="flex-row items-center justify-between p-3 bg-general-500 rounded-lg">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">🔔</Text>
                <Text className="font-JakartaMedium">Notifications</Text>
              </View>
              <Text className="text-secondary-600">→</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-3 bg-general-500 rounded-lg">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">💳</Text>
                <Text className="font-JakartaMedium">Payment Methods</Text>
              </View>
              <Text className="text-secondary-600">→</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-3 bg-general-500 rounded-lg">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">❓</Text>
                <Text className="font-JakartaMedium">Help & Support</Text>
              </View>
              <Text className="text-secondary-600">→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverProfile;
