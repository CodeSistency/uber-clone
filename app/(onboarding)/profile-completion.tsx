import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

import { ProfileIllustration } from "@/components/onboarding/illustrations";
import {
  OnboardingScaffold,
  EmergencyContactModal,
} from "@/components/onboarding/OnboardingScaffold";
import { Card, TextField, Button } from "@/components/ui";
import { fetchAPI } from "@/lib/fetch";
import { useOnboardingStore } from "@/store";

export default function ProfileCompletion() {
  const {
    currentStep,
    userData,
    updateUserData,
    completeOnboarding,
    setLoading,
    setError,
    isLoading,
  } = useOnboardingStore();

  const [address, setAddress] = useState(userData.address || "");
  const [emergencyContact, setEmergencyContact] = useState(
    userData.emergencyContact || null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      updateUserData({
        address: address || undefined,
        emergencyContact: emergencyContact || undefined,
      });

      await fetchAPI("onboarding/complete", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          address: address || undefined,
          emergencyContact: emergencyContact || undefined,
        }),
      });

      completeOnboarding();
      router.replace("/(onboarding)/completion-success" as any);
    } catch (error: any) {
      setError(error.message || "No pudimos completar tu perfil");
      Alert.alert("Error", error.message || "No pudimos completar tu perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmergencyContact = () => {
    setEmergencyContact(null);
  };

  if (currentStep !== 3) {
    return null;
  }

  return (
    <OnboardingScaffold
      illustration={ProfileIllustration}
      title="Estás listo para comenzar"
      subtitle="Agrega información final opcional para mejorar tu experiencia"
      onContinue={handleSave}
      onBack={() => router.replace("./phone-verification")}
      showBackButton
      continueButtonText="Finalizar configuración"
      isLoading={isLoading}
    >
      <View className="space-y-6">
        <Card
          header={
            <Text className="text-lg font-Jakarta-Bold text-gray-900 dark:text-white">
              Dirección principal (opcional)
            </Text>
          }
        >
          <TextField
            placeholder="Ej. Calle 123, Centro, Caracas"
            value={address}
            onChangeText={setAddress}
          />
        </Card>

        <Card
          header={
            <Text className="text-lg font-Jakarta-Bold text-gray-900 dark:text-white">
              Contacto de emergencia (opcional)
            </Text>
          }
          footer={
            <View className="flex-row justify-end space-x-3">
              {emergencyContact ? (
                <Button
                  title="Eliminar"
                  variant="ghost"
                  onPress={() => setEmergencyContact(null)}
                />
              ) : null}
              <Button
                title={emergencyContact ? "Editar" : "Agregar"}
                onPress={() => setModalOpen(true)}
              />
            </View>
          }
        >
          {emergencyContact ? (
            <View className="space-y-2">
              <Text className="text-base text-gray-800 dark:text-gray-200">
                {emergencyContact.name}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                {emergencyContact.phone}
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                {emergencyContact.relationship}
              </Text>
            </View>
          ) : (
            <Text className="text-sm text-gray-500 dark:text-gray-300">
              Agrega un contacto de confianza para situaciones de emergencia.
            </Text>
          )}
        </Card>

        <Card
          header={
            <Text className="text-lg font-Jakarta-Bold text-gray-900 dark:text-white">
              ¡Todo listo!
            </Text>
          }
        >
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            Con esta información estarás listo para disfrutar de la experiencia
            completa de Uber. Puedes actualizar tus datos en cualquier momento
            desde tu perfil.
          </Text>
        </Card>
      </View>

      <EmergencyContactModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(contact) => setEmergencyContact(contact)}
        onRemove={handleRemoveEmergencyContact}
        initialContact={emergencyContact}
      />
    </OnboardingScaffold>
  );
}
