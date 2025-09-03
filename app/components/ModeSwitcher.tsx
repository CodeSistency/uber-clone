import { router } from "expo-router";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";

import { userModeStorage } from "../lib/storage";

interface ModeSwitcherProps {
  currentMode?: "customer" | "driver" | "business";
  variant?: "drawer" | "fab" | "modal";
  onClose?: () => void;
  onModeChange?: (mode: "customer" | "driver" | "business") => void;
}

const ModeSwitcher = ({
  currentMode = "customer",
  variant = "drawer",
  onClose,
  onModeChange,
}: ModeSwitcherProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isDriverRegistered, setIsDriverRegistered] = useState(false);
  const [isBusinessRegistered, setIsBusinessRegistered] = useState(false);

  // Load registration status using storage utility
  React.useEffect(() => {
    const loadRegistrationStatus = async () => {
      try {
        const [isDriverReg, isBusinessReg] = await Promise.all([
          userModeStorage.isDriverRegistered(),
          userModeStorage.isBusinessRegistered(),
        ]);
        setIsDriverRegistered(isDriverReg);
        setIsBusinessRegistered(isBusinessReg);
      } catch (error) {
        console.error("Error loading registration status:", error);
      }
    };
    loadRegistrationStatus();
  }, []);

  const modes = [
    {
      id: "customer",
      name: variant === "modal" ? "Continue as Customer" : "Customer Mode",
      icon: "🚗",
      description:
        variant === "modal"
          ? "Book rides and order food"
          : "Book rides and order food",
      route: "/(root)/(tabs)/home",
      available: true,
    },
    {
      id: "driver",
      name: variant === "modal" ? "Switch to Driver Mode" : "Driver Mode",
      icon: "👨‍💼",
      description:
        variant === "modal"
          ? "Accept rides and deliveries"
          : "Accept rides and deliveries",
      route: "/(driver)/dashboard",
      available: isDriverRegistered,
    },
    {
      id: "business",
      name: variant === "modal" ? "Switch to Business Mode" : "Business Mode",
      icon: "🏪",
      description:
        variant === "modal" ? "Manage your business" : "Manage your business",
      route: "/(business)/dashboard",
      available: isBusinessRegistered,
    },
  ];

  const handleModeSwitch = (modeId: string) => {
    const selectedMode = modes.find((mode) => mode.id === modeId);

    if (!selectedMode) return;

    if (!selectedMode.available) {
      // Show registration modal for unavailable modes
      Alert.alert(
        `${selectedMode.name} Not Available`,
        `You haven't registered for ${selectedMode.name.toLowerCase()}. Would you like to register now?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Register",
            onPress: () => {
              if (modeId === "driver") {
                router.replace("/(auth)/driver-register");
              } else if (modeId === "business") {
                router.replace("/(auth)/business-register");
              }
            },
          },
        ],
      );
      return;
    }

    // Save current mode using storage utility
    userModeStorage
      .setMode(modeId as "customer" | "driver" | "business")
      .catch((error) => {
        console.error("Error saving user mode:", error);
      });

    // Notify parent component about mode change
    if (onModeChange) {
      onModeChange(modeId as "customer" | "driver" | "business");
    }

    // Switch to the selected mode
    router.replace(selectedMode.route as any);

    if (onClose) {
      onClose();
    }

    if (variant === "modal") {
      setShowModal(false);
    }
  };

  const renderModeButton = (mode: (typeof modes)[0], index: number) => {
    const isActive = mode.id === currentMode;

    if (variant === "drawer") {
      return (
        <TouchableOpacity
          key={mode.id}
          onPress={() => handleModeSwitch(mode.id)}
          className={`flex-row items-center p-4 rounded-lg mb-2 ${
            isActive ? "bg-primary-500" : "bg-transparent"
          }`}
        >
          <Text className="text-2xl mr-3">{mode.icon}</Text>
          <View className="flex-1">
            <Text
              className={`font-JakartaBold ${isActive ? "text-white" : "text-secondary-700"}`}
            >
              {mode.name}
            </Text>
            {!mode.available && (
              <Text
                className={`text-sm ${isActive ? "text-white/80" : "text-secondary-600"}`}
              >
                Tap to register
              </Text>
            )}
          </View>
          {isActive && <Text className="text-white font-JakartaBold">✓</Text>}
        </TouchableOpacity>
      );
    }

    if (variant === "fab") {
      return (
        <TouchableOpacity
          key={mode.id}
          onPress={() => handleModeSwitch(mode.id)}
          className={`flex-row items-center p-3 rounded-lg mb-2 ${
            isActive ? "bg-primary-500" : "bg-general-500"
          }`}
        >
          <Text className="text-xl mr-2">{mode.icon}</Text>
          <Text
            className={`font-JakartaBold ${isActive ? "text-white" : "text-secondary-700"}`}
          >
            {mode.name}
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  if (variant === "drawer") {
    return (
      <View className="p-4">
        <Text className="text-lg font-JakartaBold mb-4 text-secondary-700">
          Account Modes
        </Text>
        {modes.map(renderModeButton)}
      </View>
    );
  }

  if (variant === "fab") {
    return (
      <View className="absolute bottom-6 right-6 z-50">
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-primary-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
        >
          <Text className="text-white text-xl">🔄</Text>
        </TouchableOpacity>

        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-JakartaBold">Switch Mode</Text>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Text className="text-2xl">✕</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-secondary-600 mb-6 text-center">
                Choose how you want to use the app
              </Text>

              {modes.map(renderModeButton)}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return null;
};

// Welcome Modal Component for first-time users
export const WelcomeModal = ({
  onModeSelected,
}: {
  onModeSelected: (mode: string) => void;
}) => {
  const modes = [
    {
      id: "customer",
      name: "Continue as Customer",
      icon: "🚗",
      description: "Book rides and order food",
      benefits: ["Easy ride booking", "Food delivery", "Safe & reliable"],
    },
    {
      id: "driver",
      name: "Become a Driver/Courier",
      icon: "👨‍💼",
      description: "Earn money by accepting rides and deliveries",
      benefits: ["Flexible schedule", "Competitive earnings", "Driver support"],
    },
    {
      id: "business",
      name: "Register a Business",
      icon: "🏪",
      description: "Manage your restaurant or store",
      benefits: [
        "Reach more customers",
        "Easy order management",
        "Analytics & insights",
      ],
    },
  ];

  return (
    <View className="flex-1 bg-black/50 justify-center items-center p-6">
      <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
        {/* Header */}
        <View className="items-center mb-6">
          <Text className="text-3xl font-JakartaExtraBold text-primary-500 mb-2">
            Welcome! 🎉
          </Text>
          <Text className="text-secondary-600 text-center font-JakartaMedium">
            Choose how you want to use our Super App
          </Text>
        </View>

        {/* Mode Options */}
        <View className="space-y-4 mb-6">
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              onPress={() => onModeSelected(mode.id)}
              className="bg-general-500 rounded-xl p-4 border-2 border-transparent active:border-primary-500"
            >
              <View className="flex-row items-center mb-3">
                <Text className="text-3xl mr-3">{mode.icon}</Text>
                <View className="flex-1">
                  <Text className="font-JakartaBold text-secondary-700 text-lg">
                    {mode.name}
                  </Text>
                  <Text className="text-secondary-600 font-JakartaMedium text-sm">
                    {mode.description}
                  </Text>
                </View>
              </View>

              {/* Benefits */}
              <View className="flex-row flex-wrap gap-1">
                {mode.benefits.map((benefit, index) => (
                  <View
                    key={index}
                    className="bg-primary-500/10 rounded-full px-3 py-1"
                  >
                    <Text className="text-primary-500 text-xs font-JakartaMedium">
                      ✓ {benefit}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <Text className="text-secondary-500 text-xs text-center font-JakartaMedium">
          You can change your mode later from the menu
        </Text>
      </View>
    </View>
  );
};

export default ModeSwitcher;
