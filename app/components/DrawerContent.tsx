import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUI } from "@/components/UIWrapper";
import { logoutUser } from "@/lib/auth";
import ModuleSwitcherWithSplash from "@/components/ModuleSwitcherWithSplash";


interface DrawerContentProps {
  currentMode?: "customer" | "driver" | "business";
  visible?: boolean;
  onClose?: () => void;
  onModeChange?: (mode: "customer" | "driver" | "business") => void;
}

const DrawerContent = ({
  currentMode = "customer",
  visible = false,
  onClose,
  onModeChange,
}: DrawerContentProps) => {
  const { theme, toggleTheme, setTheme } = useUI();
  console.log(
    "DrawerContent rendered, visible:",
    visible,
    "currentMode:",
    currentMode,
  );

  const handleNavigation = (route: string) => {
    console.log("Navigating to:", route);
    router.push(route as any);
  };

  const handleLogout = async () => {
    try {
      // Close the drawer first
      onClose?.();

      // Show confirmation dialog
      Alert.alert("Logout", "Are you sure you want to logout?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("[Drawer] Logging out user...");

              // Logout user with internal authentication
              const result = await logoutUser();

              if (result.success) {
                console.log(
                  "[Drawer] Logout successful, redirecting to welcome",
                );
                // Navigate to welcome screen
                router.replace("/(auth)/welcome");
              } else {
                console.error("[Drawer] Logout failed:", result.message);
                Alert.alert("Error", "Failed to logout. Please try again.");
              }
            } catch (error) {
              console.error("[Drawer] Error during logout:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]);
    } catch (error) {
      console.error("[Drawer] Error in logout handler:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const menuItems = [
    {
      title: "Profile",
      icon: "👤",
      route: "/(root)/(tabs)/profile",
    },
    {
      title: "Disponibles (Conductor)",
      icon: "📋",
      route: "/(driver)/available",
    },
    {
      title: "Componentes",
      icon: "🧩",
      route: "/(root)/componentes",
    },
    {
      title: "Servicios",
      icon: "🧭",
      route: "/(root)/services-hub",
    },
    {
      title: "Map Flows Demo",
      icon: "🗺️",
      route: "/(root)/map-flows-demo",
    },
    {
      title: "Test Drawer Demo",
      icon: "🪟",
      route: "/(root)/testDrawer",
    },
    {
      title: "Flujo Unificado Demo",
      icon: "🔄",
      route: "/(root)/unified-flow-demo",
    },
    {
      title: "Flujo Conductor Demo",
      icon: "🚕",
      route: "/(root)/driver-unified-flow-demo",
    },
    {
      title: "Conductor",
      icon: "🚗",
      route: "/(driver)/dashboard",
    },
    {
      title: "Wallet",
      icon: "💳",
      route: "/(wallet)",
    },
    {
      title: "Emergency Contacts",
      icon: "🚨",
      route: "/(emergency)",
    },
    {
      title: "Settings",
      icon: "⚙️",
      route: "/settings",
    },
    {
      title: "Help & Support",
      icon: "❓",
      route: "/support",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View
          className={`flex-1 w-80 bg-brand-primary ${theme === "dark" ? "bg-brand-primaryDark" : ""}`}
        >
          <SafeAreaView className="flex-1">
            {/* Header with Close Button */}
            <View
              className={`flex-row items-center justify-between p-6 border-b border-general-500 border-opacity-40 ${theme === "dark" ? "border-opacity-20" : ""}`}
            >
              <View>
                <Text
                  className={`text-2xl font-JakartaExtraBold text-black ${theme === "dark" ? "text-white" : ""}`}
                >
                  UberClone
                </Text>
                <Text
                  className={`mt-1 text-secondary-600 ${theme === "dark" ? "text-gray-300" : ""}`}
                >
                  Super App
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 items-center justify-center"
              >
                <Text
                  className={`text-2xl text-black ${theme === "dark" ? "text-white" : ""}`}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
              {/* Mode Switcher */}
              <ModuleSwitcherWithSplash
                currentModule={currentMode}
                onModuleChange={onModeChange}
                onClose={onClose}
              />

              {/* Menu Items */}
              <View className="px-4 pb-6">
                <Text
                  className={`text-lg font-JakartaBold mb-4 text-secondary-700 ${theme === "dark" ? "text-gray-200" : ""}`}
                >
                  Menu
                </Text>

                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      handleNavigation(item.route);
                      onClose?.();
                    }}
                    className="flex-row items-center p-3 rounded-lg mb-2"
                  >
                    <Text className="text-xl mr-3">{item.icon}</Text>
                    <Text
                      className={`font-JakartaMedium text-secondary-700 ${theme === "dark" ? "text-gray-200" : ""}`}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Theme Toggle */}
                <View
                  className={`mt-4 p-3 rounded-lg bg-brand-secondary/20 ${theme === "dark" ? "bg-brand-secondary/20" : ""}`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`font-JakartaBold text-black ${theme === "dark" ? "text-white" : ""}`}
                    >
                      Appearance
                    </Text>
                    <TouchableOpacity
                      onPress={toggleTheme}
                      className="px-3 py-1 rounded-full bg-brand-secondary"
                    >
                      <Text className="font-JakartaBold text-black">
                        {theme === "dark" ? "Dark" : "Light"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text
                    className={`mt-1 text-xs text-gray-600 ${theme === "dark" ? "text-gray-300" : ""}`}
                  >
                    Tap to toggle theme
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View
              className={`p-6 border-t border-general-500 border-opacity-40 ${theme === "dark" ? "border-opacity-20" : ""}`}
            >
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center"
              >
                <Text className="text-xl mr-3">🚪</Text>
                <Text className="font-JakartaBold text-danger-500">Logout</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

// Hamburger Menu Button Component
export const HamburgerMenu = ({ onPress }: { onPress: () => void }) => {
  console.log("HamburgerMenu rendered");
  return (
    <TouchableOpacity
      onPress={() => {
        console.log("HamburgerMenu pressed");
        onPress();
      }}
      className="w-14 h-14 items-center justify-center rounded-full bg-primary-500 shadow-lg shadow-black/20 border-2 border-white"
      activeOpacity={0.7}
    >
      <View className="flex-col space-y-1">
        <View className="w-7 h-1 bg-white rounded-full" />
        <View className="w-7 h-1 bg-white rounded-full" />
        <View className="w-7 h-1 bg-white rounded-full" />
      </View>
    </TouchableOpacity>
  );
};

export default DrawerContent;
