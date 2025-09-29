import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, TextField } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/driverOnboarding";
import { useUI } from "@/components/UIWrapper";

interface DocumentData {
  number: string;
  expiryDate: string;
  uploaded: boolean;
  fileName?: string;
}

const OnboardingStep3 = () => {
  const {
    onboardingData,
    updateStepData,
    completeStep,
    goToStep,
  } = useDriverOnboardingStore();

  const { showError } = useUI();

  const [documents, setDocuments] = useState({
    license: { number: "", expiryDate: "", uploaded: false } as DocumentData,
    insurance: { number: "", expiryDate: "", uploaded: false } as DocumentData,
    registration: { number: "", expiryDate: "", uploaded: false } as DocumentData,
  });

  useEffect(() => {
    // Load existing data
    if (onboardingData) {
      setDocuments({
        license: {
          number: onboardingData.licenseNumber || "",
          expiryDate: onboardingData.licenseExpiry || "",
          uploaded: false, // Would check actual upload status
        },
        insurance: {
          number: onboardingData.insuranceNumber || "",
          expiryDate: onboardingData.insuranceExpiry || "",
          uploaded: false,
        },
        registration: {
          number: onboardingData.registrationNumber || "",
          expiryDate: onboardingData.registrationExpiry || "",
          uploaded: false,
        },
      });
    }
  }, [onboardingData]);

  const handleDocumentUpload = (type: keyof typeof documents) => {
    // For now, simulate upload
    Alert.alert(
      "Document Upload",
      `Upload functionality for ${getDocumentName(type)} will be implemented soon.\n\nFor now, please enter the document details manually.`,
      [{ text: "OK" }]
    );
  };

  const updateDocument = (type: keyof typeof documents, field: keyof DocumentData, value: any) => {
    setDocuments(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const getDocumentName = (type: keyof typeof documents): string => {
    switch (type) {
      case 'license': return "Driver's License";
      case 'insurance': return 'Vehicle Insurance';
      case 'registration': return 'Vehicle Registration';
      default: return 'Document';
    }
  };

  const getDocumentIcon = (type: keyof typeof documents): string => {
    switch (type) {
      case 'license': return '🪪';
      case 'insurance': return '📋';
      case 'registration': return '📄';
      default: return '📄';
    }
  };

  const validateDocuments = () => {
    const requiredFields = ['license', 'insurance', 'registration'] as const;

    for (const type of requiredFields) {
      const doc = documents[type];

      if (!doc.number.trim()) {
        showError("Validation Error", `${getDocumentName(type)} number is required`);
        return false;
      }

      if (!doc.expiryDate) {
        showError("Validation Error", `${getDocumentName(type)} expiry date is required`);
        return false;
      }

      // Check if expiry date is in the future
      const expiryDate = new Date(doc.expiryDate);
      const today = new Date();
      if (expiryDate <= today) {
        showError("Validation Error", `${getDocumentName(type)} has expired or expires today`);
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateDocuments()) return;

    try {
      const documentData = {
        licenseNumber: documents.license.number,
        licenseExpiry: documents.license.expiryDate,
        insuranceNumber: documents.insurance.number,
        insuranceExpiry: documents.insurance.expiryDate,
        registrationNumber: documents.registration.number,
        registrationExpiry: documents.registration.expiryDate,
      };

      await updateStepData(3, documentData);
      await completeStep(3);
      goToStep(4);
    } catch (error: any) {
      showError("Error", error.message || "Failed to save document information");
    }
  };

  const handlePrevious = () => {
    goToStep(2);
  };

  const renderDocumentCard = (type: keyof typeof documents) => {
    const doc = documents[type];
    const isComplete = doc.number.trim() && doc.expiryDate;

    return (
      <Card key={type} className="mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">{getDocumentIcon(type)}</Text>
            <View>
              <Text className="text-lg font-JakartaBold">{getDocumentName(type)}</Text>
              <Text className="text-secondary-600 text-sm">Required</Text>
            </View>
          </View>

          <View className={`px-3 py-1 rounded-full ${
            isComplete ? "bg-green-100" : "bg-yellow-100"
          }`}>
            <Text className={`text-xs font-JakartaBold ${
              isComplete ? "text-green-700" : "text-yellow-700"
            }`}>
              {isComplete ? "✓ Complete" : "⚠ Pending"}
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <TextField
            label="Document Number"
            placeholder={`Enter ${getDocumentName(type).toLowerCase()} number`}
            value={doc.number}
            onChangeText={(text) => updateDocument(type, 'number', text.toUpperCase())}
          />

          <TextField
            label="Expiry Date"
            placeholder="YYYY-MM-DD"
            value={doc.expiryDate}
            onChangeText={(text) => updateDocument(type, 'expiryDate', text)}
            keyboardType="numeric"
          />

          {/* Upload Section */}
          <View className="bg-secondary-50 border-2 border-dashed border-secondary-300 rounded-lg p-4">
            <View className="items-center mb-3">
              <Text className="text-3xl mb-2">📎</Text>
              <Text className="text-secondary-700 font-JakartaMedium text-center">
                Upload {getDocumentName(type)}
              </Text>
              <Text className="text-secondary-500 text-sm text-center mt-1">
                PDF, JPG, or PNG (max 5MB)
              </Text>
            </View>

            <Button
              title={doc.uploaded ? "✓ Uploaded" : "Upload Document"}
              onPress={() => handleDocumentUpload(type)}
              className="w-full"
              variant={doc.uploaded ? "success" : "outline"}
              disabled={doc.uploaded}
            />
          </View>

          {/* Verification Notice */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Text className="text-blue-800 font-JakartaBold mb-1">
              🔍 Verification Required
            </Text>
            <Text className="text-blue-700 text-sm">
              This document will be verified by our team. Processing typically takes 1-2 business days.
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Document Verification</Text>
        <Text className="text-secondary-600 mt-1">
          Upload required documents for verification
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
                    step < 3 ? "bg-green-500" :
                    step === 3 ? "bg-primary-500" :
                    "bg-secondary-300"
                  }`}
                >
                  <Text className={`text-xs font-JakartaBold ${
                    step <= 3 ? "text-white" : "text-secondary-600"
                  }`}>
                    {step}
                  </Text>
                </View>
                {step < 6 && (
                  <View className={`w-1 h-6 ${
                    step < 3 ? "bg-green-500" : "bg-secondary-300"
                  }`} />
                )}
              </View>
            ))}
          </View>

          {/* Instructions */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-3">Required Documents</Text>

            <View className="space-y-2 mb-4">
              <View className="flex-row items-center">
                <Text className="text-green-600 mr-2">✓</Text>
                <Text className="text-secondary-700">Valid Driver's License</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-green-600 mr-2">✓</Text>
                <Text className="text-secondary-700">Current Vehicle Insurance</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-green-600 mr-2">✓</Text>
                <Text className="text-secondary-700">Vehicle Registration</Text>
              </View>
            </View>

            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <Text className="text-yellow-800 font-JakartaBold mb-1">
                📋 Document Requirements
              </Text>
              <Text className="text-yellow-700 text-sm">
                All documents must be current (not expired) and clearly legible. Digital copies are accepted for initial verification.
              </Text>
            </View>
          </Card>

          {/* Document Cards */}
          {renderDocumentCard('license')}
          {renderDocumentCard('insurance')}
          {renderDocumentCard('registration')}

          {/* Help Section */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-3">Need Help?</Text>

            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => Alert.alert("Document Guide", "Detailed guide for document requirements will be shown here.")}
                className="flex-row items-center justify-between py-3 border-b border-secondary-200"
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-3">📚</Text>
                  <View>
                    <Text className="font-JakartaMedium">Document Guide</Text>
                    <Text className="text-secondary-600 text-sm">Learn what documents are accepted</Text>
                  </View>
                </View>
                <Text className="text-secondary-400">→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert("Contact Support", "Support contact functionality will be implemented.")}
                className="flex-row items-center justify-between py-3"
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-3">🆘</Text>
                  <View>
                    <Text className="font-JakartaMedium">Contact Support</Text>
                    <Text className="text-secondary-600 text-sm">Get help with document upload</Text>
                  </View>
                </View>
                <Text className="text-secondary-400">→</Text>
              </TouchableOpacity>
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

export default OnboardingStep3;
