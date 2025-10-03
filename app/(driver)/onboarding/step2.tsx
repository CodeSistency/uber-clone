import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button, Card, TextField } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/driverOnboarding";
import { useUI } from "@/components/UIWrapper";

const OnboardingStep2 = () => {
  const { onboardingData, updateStepData, completeStep, goToStep } =
    useDriverOnboardingStore();

  const { showError } = useUI();

  const [formData, setFormData] = useState({
    address: "",
    phoneSecondary: "",
  });

  const [references, setReferences] = useState<
    Array<{
      name: string;
      phone: string;
      relationship: string;
    }>
  >([]);

  useEffect(() => {
    // Load existing data
    if (onboardingData) {
      setFormData({
        address: onboardingData.address || "",
        phoneSecondary: onboardingData.phoneSecondary || "",
      });
      setReferences(onboardingData.references || []);
    }
  }, [onboardingData]);

  const addReference = () => {
    if (references.length >= 2) {
      Alert.alert("Limit Reached", "You can add up to 2 references.");
      return;
    }

    setReferences([...references, { name: "", phone: "", relationship: "" }]);
  };

  const updateReference = (index: number, field: string, value: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    setReferences(updated);
  };

  const removeReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.address.trim()) {
      showError("Validation Error", "Address is required");
      return false;
    }

    // Validate references if any are provided
    for (let i = 0; i < references.length; i++) {
      const ref = references[i];
      if (ref.name.trim() || ref.phone.trim() || ref.relationship.trim()) {
        // If any field is filled, all must be filled
        if (!ref.name.trim() || !ref.phone.trim() || !ref.relationship.trim()) {
          showError(
            "Validation Error",
            `Please complete all fields for reference ${i + 1}`,
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    try {
      await updateStepData(2, {
        ...formData,
        references: references.filter(
          (ref) =>
            ref.name.trim() || ref.phone.trim() || ref.relationship.trim(),
        ),
      });
      await completeStep(2);
      goToStep(3);
    } catch (error: any) {
      showError(
        "Error",
        error.message || "Failed to save personal information",
      );
    }
  };

  const handlePrevious = () => {
    goToStep(1);
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Personal Information</Text>
        <Text className="text-secondary-600 mt-1">
          Additional details for your driver profile
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
                    step < 2
                      ? "bg-green-500"
                      : step === 2
                        ? "bg-primary-500"
                        : "bg-secondary-300"
                  }`}
                >
                  <Text
                    className={`text-xs font-JakartaBold ${
                      step <= 2 ? "text-white" : "text-secondary-600"
                    }`}
                  >
                    {step}
                  </Text>
                </View>
                {step < 6 && (
                  <View
                    className={`w-8 h-1 ${
                      step < 2 ? "bg-green-500" : "bg-secondary-300"
                    }`}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Address Information */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">
              Address Information
            </Text>

            <View className="space-y-4">
              <TextField
                label="Full Address"
                placeholder="Street address, city, state, ZIP code"
                value={formData.address}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, address: text }))
                }
                multiline
                numberOfLines={3}
              />

              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Text className="text-blue-800 font-JakartaBold mb-1">
                  📍 Location Verification
                </Text>
                <Text className="text-blue-700 text-sm">
                  This address will be used for service area verification and
                  may be required for insurance purposes.
                </Text>
              </View>
            </View>
          </Card>

          {/* Secondary Phone */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">
              Contact Information
            </Text>

            <View className="space-y-4">
              <TextField
                label="Secondary Phone (Optional)"
                placeholder="Alternative phone number"
                value={formData.phoneSecondary}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phoneSecondary: text }))
                }
                keyboardType="phone-pad"
              />

              <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Text className="text-green-800 font-JakartaBold mb-1">
                  📞 Emergency Contact
                </Text>
                <Text className="text-green-700 text-sm">
                  A secondary phone number helps us reach you in case of
                  service-related emergencies.
                </Text>
              </View>
            </View>
          </Card>

          {/* Personal References */}
          <Card className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-JakartaBold">
                Personal References
              </Text>
              <TouchableOpacity
                onPress={addReference}
                disabled={references.length >= 2}
                className={`px-3 py-1 rounded-lg ${
                  references.length >= 2 ? "bg-secondary-200" : "bg-primary-500"
                }`}
              >
                <Text
                  className={`text-sm font-JakartaBold ${
                    references.length >= 2 ? "text-secondary-600" : "text-white"
                  }`}
                >
                  + Add Reference
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-secondary-600 mb-4">
              Provide 1-2 personal references who can vouch for your character
              and reliability.
            </Text>

            {references.map((reference, index) => (
              <View key={index} className="bg-secondary-50 rounded-lg p-4 mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="font-JakartaBold text-secondary-700">
                    Reference {index + 1}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeReference(index)}
                    className="w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                  >
                    <Text className="text-white text-xs font-JakartaBold">
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="space-y-3">
                  <TextField
                    label="Full Name"
                    placeholder="Reference's full name"
                    value={reference.name}
                    onChangeText={(text) =>
                      updateReference(index, "name", text)
                    }
                  />

                  <TextField
                    label="Phone Number"
                    placeholder="Reference's phone number"
                    value={reference.phone}
                    onChangeText={(text) =>
                      updateReference(index, "phone", text)
                    }
                    keyboardType="phone-pad"
                  />

                  <TextField
                    label="Relationship"
                    placeholder="How do you know this person?"
                    value={reference.relationship}
                    onChangeText={(text) =>
                      updateReference(index, "relationship", text)
                    }
                  />
                </View>
              </View>
            ))}

            {references.length === 0 && (
              <View className="bg-secondary-50 border-2 border-dashed border-secondary-300 rounded-lg p-6 items-center">
                <Text className="text-3xl mb-2">👥</Text>
                <Text className="text-secondary-600 text-center">
                  Personal references help verify your character and reliability
                  as a driver.
                </Text>
                <Button
                  title="Add First Reference"
                  onPress={addReference}
                  className="mt-3"
                  variant="outline"
                />
              </View>
            )}
          </Card>

          {/* Privacy Notice */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-3">
              Privacy & Verification
            </Text>

            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <Text className="text-yellow-800 font-JakartaBold mb-2">
                🔒 Your Information is Secure
              </Text>
              <Text className="text-yellow-700 text-sm">
                Personal information provided here is encrypted and used solely
                for driver verification and emergency contact purposes. We
                comply with all data protection regulations.
              </Text>
            </View>
          </Card>

          {/* Navigation Buttons */}
          <View className="flex-row space-x-4">
            <Button
              title="Previous"
              onPress={handlePrevious}
              className="flex-1"
              variant="outline"
            />
            <Button
              title="Next"
              onPress={handleNext}
              className="flex-1"
              variant="primary"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingStep2;
