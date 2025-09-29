import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button, Card } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/driverOnboarding";
import { useUI } from "@/components/UIWrapper";

const OnboardingReview = () => {
  const {
    onboardingData,
    submitOnboarding,
    goToStep,
  } = useDriverOnboardingStore();

  const { showError, showSuccess } = useUI();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    Alert.alert(
      "Submit Application",
      "Are you sure you want to submit your driver application? Once submitted, you'll need to wait for approval before you can start driving.",
      [
        { text: "Review Again", style: "cancel" },
        {
          text: "Submit Now",
          style: "destructive",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await submitOnboarding();
              showSuccess("Application Submitted!", "Your driver application has been submitted successfully.");
              // Navigation will be handled by the success callback
            } catch (error: any) {
              showError("Submission Failed", error.message || "Failed to submit application");
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const handleEditStep = (step: number) => {
    goToStep(step);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getCompletionStatus = () => {
    if (!onboardingData) return { completed: 0, total: 6 };

    let completed = 0;
    const steps = [
      onboardingData.age && onboardingData.experience && onboardingData.vehicleType, // Step 1
      onboardingData.address, // Step 2
      onboardingData.licenseNumber && onboardingData.insuranceNumber && onboardingData.registrationNumber, // Step 3
      onboardingData.vehicleMake && onboardingData.vehicleModel, // Step 4
      onboardingData.termsAccepted && onboardingData.privacyAccepted && onboardingData.safetyAccepted && onboardingData.backgroundCheckConsent, // Step 5
    ];

    steps.forEach(step => {
      if (step) completed++;
    });

    return { completed, total: 6 };
  };

  const { completed, total } = getCompletionStatus();
  const completionPercentage = Math.round((completed / total) * 100);

  const renderStepSummary = (stepNumber: number, title: string, data: any[], editable: boolean = true) => (
    <Card key={stepNumber} className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
            data.some(item => item) ? "bg-green-500" : "bg-red-500"
          }`}>
            <Text className="text-white text-xs font-JakartaBold">
              {data.some(item => item) ? "✓" : "!"}
            </Text>
          </View>
          <Text className="text-lg font-JakartaBold">{title}</Text>
        </View>
        {editable && (
          <TouchableOpacity
            onPress={() => handleEditStep(stepNumber)}
            className="px-3 py-1 bg-primary-500 rounded-lg"
          >
            <Text className="text-white text-sm font-JakartaMedium">Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="space-y-2">
        {data.map((item, index) => (
          <View key={index} className="flex-row justify-between py-1">
            <Text className="text-secondary-600 text-sm">{item.label}:</Text>
            <Text className={`text-sm font-JakartaMedium ${
              item.value ? "text-secondary-800" : "text-red-600"
            }`}>
              {item.value || "Not provided"}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );

  if (!onboardingData) {
    return (
      <SafeAreaView className="flex-1 bg-general-500 justify-center items-center">
        <Text className="text-lg">Loading application data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Review & Submit</Text>
        <Text className="text-secondary-600 mt-1">
          Please review your application before submitting
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Step Indicator */}
          <View className="flex-row justify-center mb-6">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <View key={step} className="flex-row items-center">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    step < 6 ? "bg-green-500" :
                    step === 6 ? "bg-primary-500" :
                    "bg-secondary-300"
                  }`}
                >
                  <Text className={`text-xs font-JakartaBold ${
                    step <= 6 ? "text-white" : "text-secondary-600"
                  }`}>
                    {step}
                  </Text>
                </View>
                {step < 6 && (
                  <View className={`w-1 h-6 ${
                    step < 6 ? "bg-green-500" : "bg-secondary-300"
                  }`} />
                )}
              </View>
            ))}
          </View>

          {/* Completion Status */}
          <Card className="mb-6">
            <View className="items-center">
              <Text className="text-xl font-JakartaBold mb-2">Application Status</Text>
              <View className="w-full bg-secondary-200 rounded-full h-4 mb-3">
                <View
                  className="bg-primary-500 h-4 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </View>
              <Text className="text-secondary-700 font-JakartaMedium">
                {completed} of {total} steps completed ({completionPercentage}%)
              </Text>
            </View>
          </Card>

          {/* Step Summaries */}
          {renderStepSummary(1, "Prerequisites", [
            { label: "Age", value: onboardingData.age },
            { label: "Experience", value: onboardingData.experience },
            { label: "Vehicle Type", value: onboardingData.vehicleType },
            { label: "Available Hours", value: onboardingData.availableHours },
          ])}

          {renderStepSummary(2, "Personal Information", [
            { label: "Address", value: onboardingData.address },
            { label: "Secondary Phone", value: onboardingData.phoneSecondary },
            { label: "References", value: onboardingData.references?.length ? `${onboardingData.references.length} provided` : "None" },
          ])}

          {renderStepSummary(3, "Documents", [
            { label: "Driver's License", value: onboardingData.licenseNumber },
            { label: "License Expiry", value: formatDate(onboardingData.licenseExpiry) },
            { label: "Insurance Number", value: onboardingData.insuranceNumber },
            { label: "Insurance Expiry", value: formatDate(onboardingData.insuranceExpiry) },
            { label: "Registration Number", value: onboardingData.registrationNumber },
            { label: "Registration Expiry", value: formatDate(onboardingData.registrationExpiry) },
          ])}

          {renderStepSummary(4, "Vehicle Information", [
            { label: "Make", value: onboardingData.vehicleMake },
            { label: "Model", value: onboardingData.vehicleModel },
            { label: "Year", value: onboardingData.vehicleYear },
            { label: "Color", value: onboardingData.vehicleColor },
            { label: "Passenger Capacity", value: onboardingData.vehicleSeats },
            { label: "Features", value: onboardingData.vehicleFeatures?.length ? `${onboardingData.vehicleFeatures.length} selected` : "None" },
          ])}

          {renderStepSummary(5, "Agreements & Consents", [
            { label: "Terms of Service", value: onboardingData.termsAccepted ? "Accepted" : "Not accepted" },
            { label: "Privacy Policy", value: onboardingData.privacyAccepted ? "Accepted" : "Not accepted" },
            { label: "Safety Guidelines", value: onboardingData.safetyAccepted ? "Accepted" : "Not accepted" },
            { label: "Background Check", value: onboardingData.backgroundCheckConsent ? "Consented" : "Not consented" },
            { label: "Marketing", value: onboardingData.marketingConsent ? "Opted in" : "Opted out" },
            { label: "Data Sharing", value: onboardingData.dataSharingConsent ? "Consented" : "Not consented" },
          ], false)}

          {/* Important Notices */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">Before You Submit</Text>

            <View className="space-y-4">
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Text className="text-blue-800 font-JakartaBold mb-1">
                  ⏱️ Review Process
                </Text>
                <Text className="text-blue-700 text-sm">
                  Your application will be reviewed within 1-2 business days. You'll receive an email notification with the results.
                </Text>
              </View>

              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <Text className="text-yellow-800 font-JakartaBold mb-1">
                  📋 Required Documents
                </Text>
                <Text className="text-yellow-700 text-sm">
                  Make sure all your documents are uploaded and clearly legible. Any missing or unclear documents may delay your approval.
                </Text>
              </View>

              <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Text className="text-green-800 font-JakartaBold mb-1">
                  🚗 Getting Started
                </Text>
                <Text className="text-green-700 text-sm">
                  Once approved, you'll receive instructions on how to download the driver app and start accepting rides.
                </Text>
              </View>
            </View>
          </Card>

          {/* Submit Warning */}
          <Card className="mb-6">
            <View className="items-center">
              <Text className="text-lg font-JakartaBold mb-2 text-center">
                Ready to Submit Your Application?
              </Text>
              <Text className="text-secondary-600 text-center mb-4">
                By submitting, you confirm that all information provided is accurate and complete.
              </Text>

              {completionPercentage < 100 && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 w-full">
                  <Text className="text-red-800 font-JakartaBold mb-1">
                    ⚠️ Incomplete Application
                  </Text>
                  <Text className="text-red-700 text-sm">
                    Please complete all required steps before submitting your application.
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Navigation Buttons */}
          <View className="flex-row space-x-4">
            <Button
              title="Previous"
              onPress={() => goToStep(5)}
              className="flex-1"
              variant="outline"
              disabled={isSubmitting}
            />
            <Button
              title={isSubmitting ? "Submitting..." : "Submit Application"}
              onPress={handleSubmit}
              className="flex-1"
              variant={completionPercentage === 100 ? "success" : "secondary"}
              disabled={completionPercentage < 100 || isSubmitting}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingReview;
