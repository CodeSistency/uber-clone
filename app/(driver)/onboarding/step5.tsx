import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, Checkbox } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/driverOnboarding";
import { useUI } from "@/components/UIWrapper";

const OnboardingStep5 = () => {
  const {
    onboardingData,
    updateStepData,
    completeStep,
    goToStep,
  } = useDriverOnboardingStore();

  const { showError } = useUI();

  const [agreements, setAgreements] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    safetyAccepted: false,
    backgroundCheckConsent: false,
    marketingConsent: false,
    dataSharingConsent: false,
  });

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  useEffect(() => {
    // Load existing data
    if (onboardingData) {
      setAgreements({
        termsAccepted: onboardingData.termsAccepted || false,
        privacyAccepted: onboardingData.privacyAccepted || false,
        safetyAccepted: onboardingData.safetyAccepted || false,
        backgroundCheckConsent: onboardingData.backgroundCheckConsent || false,
        marketingConsent: onboardingData.marketingConsent || false,
        dataSharingConsent: onboardingData.dataSharingConsent || false,
      });
    }
  }, [onboardingData]);

  const updateAgreement = (key: keyof typeof agreements, value: boolean) => {
    setAgreements(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validateAgreements = () => {
    const requiredAgreements = [
      'termsAccepted',
      'privacyAccepted',
      'safetyAccepted',
      'backgroundCheckConsent'
    ] as const;

    for (const agreement of requiredAgreements) {
      if (!agreements[agreement]) {
        showError("Required Agreement", `Please accept the ${getAgreementName(agreement)}`);
        return false;
      }
    }

    return true;
  };

  const getAgreementName = (key: keyof typeof agreements): string => {
    switch (key) {
      case 'termsAccepted': return 'Terms of Service';
      case 'privacyAccepted': return 'Privacy Policy';
      case 'safetyAccepted': return 'Safety Guidelines';
      case 'backgroundCheckConsent': return 'Background Check Consent';
      case 'marketingConsent': return 'Marketing Communications';
      case 'dataSharingConsent': return 'Data Sharing Consent';
      default: return 'Agreement';
    }
  };

  const handleNext = async () => {
    if (!validateAgreements()) return;

    try {
      await updateStepData(5, agreements);
      await completeStep(5);
      goToStep(6);
    } catch (error: any) {
      showError("Error", error.message || "Failed to save agreements");
    }
  };

  const handlePrevious = () => {
    goToStep(4);
  };

  const showAgreementModal = (type: 'terms' | 'privacy' | 'safety') => {
    const content = getAgreementContent(type);
    Alert.alert(
      getAgreementTitle(type),
      content,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            switch (type) {
              case 'terms':
                updateAgreement('termsAccepted', true);
                break;
              case 'privacy':
                updateAgreement('privacyAccepted', true);
                break;
              case 'safety':
                updateAgreement('safetyAccepted', true);
                break;
            }
          }
        }
      ]
    );
  };

  const getAgreementTitle = (type: 'terms' | 'privacy' | 'safety'): string => {
    switch (type) {
      case 'terms': return 'Terms of Service';
      case 'privacy': return 'Privacy Policy';
      case 'safety': return 'Safety Guidelines';
    }
  };

  const getAgreementContent = (type: 'terms' | 'privacy' | 'safety'): string => {
    switch (type) {
      case 'terms':
        return `By becoming a driver, you agree to provide safe, reliable transportation services. You must maintain your vehicle, follow all traffic laws, and treat passengers with respect. Violation of these terms may result in account suspension or termination.`;
      case 'privacy':
        return `We collect and use your personal information to provide our services, verify your identity, and ensure safety. This includes location data during rides, payment information, and background check results. Your data is protected and never sold to third parties.`;
      case 'safety':
        return `Driver safety is our top priority. Always wear your seatbelt, never use your phone while driving, maintain safe following distances, and never drive under the influence. Report any safety concerns immediately. Passengers' safety depends on your responsible driving.`;
    }
  };

  const allRequiredAccepted = agreements.termsAccepted &&
                             agreements.privacyAccepted &&
                             agreements.safetyAccepted &&
                             agreements.backgroundCheckConsent;

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Terms & Agreements</Text>
        <Text className="text-secondary-600 mt-1">
          Please review and accept our terms to continue
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
                    step < 5 ? "bg-green-500" :
                    step === 5 ? "bg-primary-500" :
                    "bg-secondary-300"
                  }`}
                >
                  <Text className={`text-xs font-JakartaBold ${
                    step <= 5 ? "text-white" : "text-secondary-600"
                  }`}>
                    {step}
                  </Text>
                </View>
                {step < 6 && (
                  <View className={`w-1 h-6 ${
                    step < 5 ? "bg-green-500" : "bg-secondary-300"
                  }`} />
                )}
              </View>
            ))}
          </View>

          {/* Required Agreements */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">Required Agreements</Text>

            <View className="space-y-4">
              {/* Terms of Service */}
              <View className="flex-row items-start">
                <Checkbox
                  checked={agreements.termsAccepted}
                  onChange={(checked) => updateAgreement('termsAccepted', checked)}
                  className="mt-1"
                />
                <View className="flex-1 ml-3">
                  <TouchableOpacity onPress={() => showAgreementModal('terms')}>
                    <Text className="text-secondary-700 font-JakartaMedium">
                      I agree to the <Text className="text-primary-600 underline">Terms of Service</Text>
                      <Text className="text-red-500"> *</Text>
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-secondary-500 text-sm mt-1">
                    Service requirements, responsibilities, and code of conduct
                  </Text>
                </View>
              </View>

              {/* Privacy Policy */}
              <View className="flex-row items-start">
                <Checkbox
                  checked={agreements.privacyAccepted}
                  onChange={(checked) => updateAgreement('privacyAccepted', checked)}
                  className="mt-1"
                />
                <View className="flex-1 ml-3">
                  <TouchableOpacity onPress={() => showAgreementModal('privacy')}>
                    <Text className="text-secondary-700 font-JakartaMedium">
                      I agree to the <Text className="text-primary-600 underline">Privacy Policy</Text>
                      <Text className="text-red-500"> *</Text>
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-secondary-500 text-sm mt-1">
                    How we collect, use, and protect your personal information
                  </Text>
                </View>
              </View>

              {/* Safety Guidelines */}
              <View className="flex-row items-start">
                <Checkbox
                  checked={agreements.safetyAccepted}
                  onChange={(checked) => updateAgreement('safetyAccepted', checked)}
                  className="mt-1"
                />
                <View className="flex-1 ml-3">
                  <TouchableOpacity onPress={() => showAgreementModal('safety')}>
                    <Text className="text-secondary-700 font-JakartaMedium">
                      I agree to the <Text className="text-primary-600 underline">Safety Guidelines</Text>
                      <Text className="text-red-500"> *</Text>
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-secondary-500 text-sm mt-1">
                    Driving safety standards and passenger protection policies
                  </Text>
                </View>
              </View>

              {/* Background Check */}
              <View className="flex-row items-start">
                <Checkbox
                  checked={agreements.backgroundCheckConsent}
                  onChange={(checked) => updateAgreement('backgroundCheckConsent', checked)}
                  className="mt-1"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-secondary-700 font-JakartaMedium">
                    I consent to a background check and driving record verification
                    <Text className="text-red-500"> *</Text>
                  </Text>
                  <Text className="text-secondary-500 text-sm mt-1">
                    Criminal history, driving record, and identity verification
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Optional Agreements */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">Optional Communications</Text>

            <View className="space-y-4">
              {/* Marketing Consent */}
              <View className="flex-row items-start">
                <Checkbox
                  checked={agreements.marketingConsent}
                  onChange={(checked) => updateAgreement('marketingConsent', checked)}
                  className="mt-1"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-secondary-700 font-JakartaMedium">
                    I agree to receive marketing communications and promotional offers
                  </Text>
                  <Text className="text-secondary-500 text-sm mt-1">
                    Special offers, updates, and driver opportunities via email and SMS
                  </Text>
                </View>
              </View>

              {/* Data Sharing */}
              <View className="flex-row items-start">
                <Checkbox
                  checked={agreements.dataSharingConsent}
                  onChange={(checked) => updateAgreement('dataSharingConsent', checked)}
                  className="mt-1"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-secondary-700 font-JakartaMedium">
                    I agree to share anonymous driving data for research and improvements
                  </Text>
                  <Text className="text-secondary-500 text-sm mt-1">
                    Help improve our platform by sharing anonymized trip data and feedback
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Important Notices */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">Important Notices</Text>

            <View className="space-y-4">
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Text className="text-blue-800 font-JakartaBold mb-1">
                  📋 Verification Process
                </Text>
                <Text className="text-blue-700 text-sm">
                  Your application will be reviewed within 1-2 business days. You'll receive an email notification once approved to start driving.
                </Text>
              </View>

              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <Text className="text-yellow-800 font-JakartaBold mb-1">
                  ⚖️ Legal Obligations
                </Text>
                <Text className="text-yellow-700 text-sm">
                  As a driver, you're considered an independent contractor. You must comply with all local laws, maintain current insurance, and follow platform guidelines.
                </Text>
              </View>

              <View className="bg-red-50 border border-red-200 rounded-lg p-4">
                <Text className="text-red-800 font-JakartaBold mb-1">
                  🚫 Account Termination
                </Text>
                <Text className="text-red-700 text-sm">
                  Accounts may be suspended or terminated for violations of terms, safety issues, passenger complaints, or fraudulent activity.
                </Text>
              </View>
            </View>
          </Card>

          {/* Progress Indicator */}
          <Card className="mb-6">
            <View className="items-center">
              <Text className="text-lg font-JakartaBold mb-2">Agreement Status</Text>

              <View className={`px-4 py-2 rounded-full ${
                allRequiredAccepted ? "bg-green-100" : "bg-yellow-100"
              }`}>
                <Text className={`text-sm font-JakartaBold ${
                  allRequiredAccepted ? "text-green-700" : "text-yellow-700"
                }`}>
                  {allRequiredAccepted ? "✓ All Required Agreements Accepted" : "⚠ Please Accept All Required Agreements"}
                </Text>
              </View>

              <View className="flex-row mt-4 space-x-2">
                {Object.entries(agreements).map(([key, accepted]) => {
                  const isRequired = ['termsAccepted', 'privacyAccepted', 'safetyAccepted', 'backgroundCheckConsent'].includes(key);
                  return (
                    <View
                      key={key}
                      className={`w-3 h-3 rounded-full ${
                        accepted
                          ? "bg-green-500"
                          : isRequired
                          ? "bg-red-300"
                          : "bg-secondary-300"
                      }`}
                    />
                  );
                })}
              </View>
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
              title={allRequiredAccepted ? "Next" : "Please Accept All Terms"}
              onPress={handleNext}
              className="flex-1"
              variant={allRequiredAccepted ? "primary" : "secondary"}
              disabled={!allRequiredAccepted}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingStep5;
