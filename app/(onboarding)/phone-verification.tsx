import { router } from "expo-router";
import React from "react";
import { Alert, Text, View } from "react-native";

import { PhoneIllustration } from "@/components/onboarding/illustrations";
import { OnboardingScaffold } from "@/components/onboarding/OnboardingScaffold";
import { Card } from "@/components/ui";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

const DIAL_CODES: Record<string, string> = {
  VE: "+58",
  CO: "+57",
  MX: "+52",
  AR: "+54",
  PE: "+51",
  CL: "+56",
  EC: "+593",
  BO: "+591",
};

export default function PhoneVerification() {
  const {
    currentStep,
    userData,
    setLoading,
    setError,
    isLoading,
    updateUserData,
  } = useOnboardingStore();

  const dialCode = userData.country ? DIAL_CODES[userData.country] || "" : "";
  const phone = userData.phone || "";

  const handleSendVerification = async () => {
    try {
      setLoading(true);
      setError(null);

      const fullPhone = `${dialCode}${phone}`.trim();

      await fetchAPI("onboarding/verify-phone", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({ phone: fullPhone }),
      });

      updateUserData({ phoneVerified: true });
      const { completeStep } = useOnboardingStore.getState();
      completeStep("phone-verification", { phoneVerified: true });
      router.replace("./profile-completion");
    } catch (error: any) {
      setError(error.message || "No pudimos enviar el código");
      Alert.alert("Error", error.message || "No pudimos enviar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const { completeStep } = useOnboardingStore.getState();
    completeStep("phone-verification", { phoneVerified: false });
    router.replace("./profile-completion");
  };

  if (currentStep !== 2) {
    return null;
  }

  return (
    <OnboardingScaffold
      illustration={PhoneIllustration}
      illustrationProps={{
        variant: userData.phoneVerified ? "verified" : undefined,
      }}
      title="Verifica tu número"
      subtitle="Te enviaremos un código para confirmar que podemos contactarte"
      onContinue={handleSendVerification}
      onBack={() => router.replace("./travel-preferences")}
      onSkip={handleSkip}
      showBackButton
      continueButtonText="Enviar código"
      skipButtonText="Lo haré después"
      isLoading={isLoading}
      isContinueDisabled={!phone}
    >
      <View className="space-y-6">
        <Card
          header={
            <Text className="text-lg font-Jakarta-Bold text-gray-900 dark:text-white">
              Número registrado
            </Text>
          }
        >
          <Text className="text-2xl font-Jakarta-Bold text-gray-900 dark:text-white">
            {dialCode} {phone || "Sin número"}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-300 mt-2">
            Asegúrate de que el número sea correcto antes de enviar el código.
          </Text>
        </Card>

        <Card
          header={
            <Text className="text-lg font-Jakarta-Bold text-gray-900 dark:text-white">
              ¿Qué sucede luego?
            </Text>
          }
        >
          <View className="space-y-3">
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              1. Te enviamos un código por SMS.
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              2. Lo ingresas para confirmar tu número.
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              3. Podrás usar este número para avisos importantes.
            </Text>
          </View>
        </Card>
      </View>
    </OnboardingScaffold>
  );
}
