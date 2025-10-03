import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button, Card, TextField, RadioButton } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/driverOnboarding";
import { useUI } from "@/components/UIWrapper";

const DriverOnboarding = () => {
  const {
    onboardingData,
    currentStep,
    isLoading,
    error,
    initializeOnboarding,
    updateStepData,
    completeStep,
    goToStep,
    submitOnboarding,
  } = useDriverOnboardingStore();

  const { showError, showSuccess } = useUI();

  const [currentViewData, setCurrentViewData] = useState<any>({});

  useEffect(() => {
    // Initialize onboarding on mount
    initializeOnboarding();
  }, [initializeOnboarding]);

  useEffect(() => {
    if (error) {
      showError("Onboarding Error", error);
    }
  }, [error, showError]);

  useEffect(() => {
    // Load current step data
    if (onboardingData) {
      setCurrentViewData(onboardingData);
    }
  }, [onboardingData, currentStep]);

  const handleNext = async () => {
    try {
      // Validate current step
      const validation = validateCurrentStep(currentStep, currentViewData);
      if (!validation.isValid) {
        showError("Validation Error", validation.errors.join("\n"));
        return;
      }

      // Update step data
      await updateStepData(currentStep, currentViewData);

      // Complete current step
      await completeStep(currentStep);

      // Go to next step or submit if it's the last step
      if (currentStep < 6) {
        goToStep(currentStep + 1);
      } else {
        await handleSubmit();
      }
    } catch (error: any) {
      showError("Error", error.message || "Failed to save step data");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitOnboarding();
      showSuccess("Onboarding Completed!", "Welcome to the driver platform!");

      // Navigate to driver dashboard
      setTimeout(() => {
        router.replace("/(root)/driver-unified-flow-demo");
      }, 2000);
    } catch (error: any) {
      showError(
        "Submission Failed",
        error.message || "Failed to complete onboarding",
      );
    }
  };

  const validateCurrentStep = (step: number, data: any) => {
    const errors: string[] = [];

    switch (step) {
      case 1: // Prerequisites
        if (!data.age || data.age < 18) {
          errors.push("You must be at least 18 years old");
        }
        if (!data.experience?.trim()) {
          errors.push("Please specify your driving experience");
        }
        if (!data.vehicleType?.trim()) {
          errors.push("Please select a vehicle type");
        }
        break;

      case 2: // Personal Info
        if (!data.address?.trim()) {
          errors.push("Address is required");
        }
        break;

      case 3: // Documents
        if (!data.licenseNumber?.trim()) {
          errors.push("Driver's license number is required");
        }
        if (!data.licenseExpiry) {
          errors.push("License expiry date is required");
        }
        if (!data.insuranceNumber?.trim()) {
          errors.push("Insurance policy number is required");
        }
        if (!data.insuranceExpiry) {
          errors.push("Insurance expiry date is required");
        }
        if (!data.registrationNumber?.trim()) {
          errors.push("Vehicle registration number is required");
        }
        if (!data.registrationExpiry) {
          errors.push("Registration expiry date is required");
        }
        break;

      case 4: // Vehicle
        if (!data.vehicleMake?.trim()) {
          errors.push("Vehicle make is required");
        }
        if (!data.vehicleModel?.trim()) {
          errors.push("Vehicle model is required");
        }
        if (!data.vehicleYear || data.vehicleYear < 1990) {
          errors.push("Please enter a valid vehicle year");
        }
        if (!data.vehicleColor?.trim()) {
          errors.push("Vehicle color is required");
        }
        if (!data.vehicleSeats || data.vehicleSeats < 1) {
          errors.push("Number of seats must be at least 1");
        }
        break;

      case 5: // Agreements
        if (!data.termsAccepted) {
          errors.push("You must accept the terms and conditions");
        }
        if (!data.privacyAccepted) {
          errors.push("You must accept the privacy policy");
        }
        if (!data.safetyAccepted) {
          errors.push("You must accept the safety guidelines");
        }
        if (!data.backgroundCheckConsent) {
          errors.push("Background check consent is required");
        }
        break;
    }

    return { isValid: errors.length === 0, errors };
  };

  const renderStepIndicator = () => {
    const steps = [
      "Prerequisites",
      "Personal Info",
      "Documents",
      "Vehicle",
      "Agreements",
      "Review",
    ];

    return (
      <View className="flex-row justify-between mb-6 px-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = (onboardingData.completedSteps || []).includes(
            stepNumber,
          );
          const isCurrent = stepNumber === currentStep;

          return (
            <View key={stepNumber} className="items-center flex-1">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center mb-1 ${
                  isCompleted
                    ? "bg-green-500"
                    : isCurrent
                      ? "bg-primary-500"
                      : "bg-secondary-300"
                }`}
              >
                <Text
                  className={`text-xs font-JakartaBold ${
                    isCompleted || isCurrent
                      ? "text-white"
                      : "text-secondary-600"
                  }`}
                >
                  {stepNumber}
                </Text>
              </View>
              <Text
                className={`text-xs text-center font-JakartaMedium ${
                  isCurrent ? "text-primary-600" : "text-secondary-600"
                }`}
                numberOfLines={2}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderStep1 = () => (
    <Card className="mb-6">
      <Text className="text-lg font-JakartaBold mb-4">Prerequisites Check</Text>
      <Text className="text-secondary-600 mb-6">
        Before we begin, please confirm you meet the basic requirements to be a
        driver.
      </Text>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-JakartaMedium mb-2">Your Age</Text>
          <TextField
            placeholder="Enter your age"
            value={currentViewData.age?.toString() || ""}
            onChangeText={(text) => {
              const age = parseInt(text);
              setCurrentViewData((prev: any) => ({
                ...prev,
                age: isNaN(age) ? "" : age,
              }));
            }}
            keyboardType="numeric"
          />
        </View>

        <View>
          <Text className="text-sm font-JakartaMedium mb-2">
            Driving Experience
          </Text>
          <View className="space-y-2">
            {[
              "Less than 1 year",
              "1-3 years",
              "3-5 years",
              "5-10 years",
              "More than 10 years",
            ].map((experience) => (
              <RadioButton
                key={experience}
                label={experience}
                selected={currentViewData.experience === experience}
                onPress={() =>
                  setCurrentViewData((prev: any) => ({ ...prev, experience }))
                }
              />
            ))}
          </View>
        </View>

        <View>
          <Text className="text-sm font-JakartaMedium mb-2">Vehicle Type</Text>
          <View className="space-y-2">
            {["Sedan", "SUV", "Hatchback", "Pickup Truck", "Van", "Other"].map(
              (type) => (
                <RadioButton
                  key={type}
                  label={type}
                  selected={currentViewData.vehicleType === type}
                  onPress={() =>
                    setCurrentViewData((prev: any) => ({
                      ...prev,
                      vehicleType: type,
                    }))
                  }
                />
              ),
            )}
          </View>
        </View>

        <View>
          <Text className="text-sm font-JakartaMedium mb-2">
            Available Hours per Week
          </Text>
          <View className="space-y-2">
            {[
              "Part-time (10-20 hours)",
              "Full-time (30-40 hours)",
              "Flexible",
              "Weekends only",
            ].map((hours) => (
              <RadioButton
                key={hours}
                label={hours}
                selected={currentViewData.availableHours === hours}
                onPress={() =>
                  setCurrentViewData((prev: any) => ({
                    ...prev,
                    availableHours: hours,
                  }))
                }
              />
            ))}
          </View>
        </View>
      </View>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return <Text>Step 2: Personal Information</Text>;
      case 3:
        return <Text>Step 3: Documents</Text>;
      case 4:
        return <Text>Step 4: Vehicle</Text>;
      case 5:
        return <Text>Step 5: Agreements</Text>;
      case 6:
        return <Text>Step 6: Review & Submit</Text>;
      default:
        return <Text>Unknown step</Text>;
    }
  };

  if (isLoading && !onboardingData) {
    return (
      <SafeAreaView className="flex-1 bg-general-500 justify-center items-center">
        <Text className="text-lg">Initializing onboarding...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Driver Onboarding</Text>
        <Text className="text-secondary-600 mt-1">Step {currentStep} of 6</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {renderStepIndicator()}
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <View className="flex-row space-x-4">
            {currentStep > 1 && (
              <Button
                title="Previous"
                onPress={handlePrevious}
                className="flex-1"
                variant="outline"
                disabled={isLoading}
              />
            )}
            <Button
              title={currentStep === 6 ? "Complete Onboarding" : "Next"}
              onPress={handleNext}
              className="flex-1"
              variant="primary"
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverOnboarding;
