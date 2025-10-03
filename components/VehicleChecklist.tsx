import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

interface VehicleChecklistProps {
  isVisible: boolean;
  onComplete: () => void;
  onClose?: () => void;
}

const VehicleChecklist: React.FC<VehicleChecklistProps> = ({
  isVisible,
  onComplete,
  onClose,
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "clean_interior",
      title: "Clean Interior",
      description: "Ensure the vehicle interior is clean and presentable",
      completed: false,
      required: true,
    },
    {
      id: "fuel_level",
      title: "Fuel Level",
      description: "Check that fuel level is adequate for the trip",
      completed: false,
      required: true,
    },
    {
      id: "lights_working",
      title: "Lights Working",
      description: "Verify headlights, taillights, and turn signals",
      completed: false,
      required: true,
    },
    {
      id: "emergency_kit",
      title: "Emergency Kit",
      description: "Ensure emergency kit is present and stocked",
      completed: false,
      required: true,
    },
    {
      id: "tire_pressure",
      title: "Tire Pressure",
      description: "Check tire pressure and condition",
      completed: false,
      required: false,
    },
    {
      id: "documents",
      title: "Documents",
      description: "Verify insurance and registration are current",
      completed: false,
      required: false,
    },
  ]);

  const [isChecking, setIsChecking] = useState(false);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const requiredItems = checklist.filter((item) => item.required);
  const completedRequired = requiredItems.filter(
    (item) => item.completed,
  ).length;
  const allRequiredCompleted = completedRequired === requiredItems.length;
  const allItemsCompleted =
    checklist.filter((item) => item.completed).length === checklist.length;

  const handleComplete = () => {
    if (!allRequiredCompleted) {
      Alert.alert(
        "Required Items Incomplete",
        "Please complete all required checklist items before proceeding.",
        [{ text: "OK" }],
      );
      return;
    }

    setIsChecking(true);

    // Simulate checking process
    setTimeout(() => {
      setIsChecking(false);
      Alert.alert(
        "Vehicle Check Complete!",
        "All systems checked. You are ready to pick up passengers.",
        [
          {
            text: "Start Driving",
            onPress: onComplete,
          },
        ],
      );
    }, 2000);
  };

  const handleSkipOptional = () => {
    // Mark all optional items as completed
    setChecklist((prev) =>
      prev.map((item) =>
        !item.required ? { ...item, completed: true } : item,
      ),
    );
  };

  if (!isVisible) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-5">
        {/* Header */}
        <View className="items-center mb-6">
          <Text className="text-3xl mb-2">🚗</Text>
          <Text className="text-xl font-JakartaExtraBold mb-2">
            Vehicle Preparation
          </Text>
          <Text className="text-secondary-600 text-center font-JakartaMedium">
            Before starting your ride, please verify your vehicle is ready
          </Text>
        </View>

        {/* Progress */}
        <View className="mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="font-JakartaBold">Progress</Text>
            <Text className="font-JakartaBold">
              {completedRequired}/{requiredItems.length} required
            </Text>
          </View>
          <View className="w-full bg-gray-200 rounded-full h-3">
            <View
              className="bg-primary-500 h-3 rounded-full"
              style={{
                width: `${(completedRequired / requiredItems.length) * 100}%`,
              }}
            />
          </View>
        </View>

        {/* Checklist Items */}
        <View className="space-y-4 mb-6">
          {checklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleItem(item.id)}
              className={`p-4 rounded-lg border-2 ${
                item.completed
                  ? "border-success-500 bg-success-500/5"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                    item.completed
                      ? "border-success-500 bg-success-500"
                      : "border-gray-300"
                  }`}
                >
                  {item.completed && (
                    <Text className="text-white text-sm font-JakartaBold">
                      ✓
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text
                      className={`font-JakartaBold ${
                        item.completed
                          ? "text-success-500"
                          : "text-secondary-700"
                      }`}
                    >
                      {item.title}
                    </Text>
                    {item.required && (
                      <Text className="text-danger-500 ml-2 text-sm">*</Text>
                    )}
                  </View>
                  <Text className="text-secondary-600 font-JakartaMedium text-sm">
                    {item.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Optional Items Notice */}
        <View className="bg-warning-500/10 border border-warning-500/20 rounded-lg p-3 mb-4">
          <Text className="text-warning-700 font-JakartaMedium text-sm">
            * Required items must be completed
          </Text>
          <Text className="text-warning-600 text-sm mt-1">
            Optional items help maintain service quality
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3 mb-6">
          <TouchableOpacity
            onPress={handleComplete}
            disabled={!allRequiredCompleted || isChecking}
            className={`py-4 rounded-lg items-center ${
              allRequiredCompleted && !isChecking
                ? "bg-primary-500"
                : "bg-gray-300"
            }`}
          >
            <Text
              className={`font-JakartaBold text-lg ${
                allRequiredCompleted && !isChecking
                  ? "text-white"
                  : "text-gray-500"
              }`}
            >
              {isChecking ? "Checking..." : "Complete Check"}
            </Text>
          </TouchableOpacity>

          {!allItemsCompleted && (
            <TouchableOpacity
              onPress={handleSkipOptional}
              className="py-3 rounded-lg items-center bg-general-500"
            >
              <Text className="text-secondary-700 font-JakartaBold">
                Skip Optional Items
              </Text>
            </TouchableOpacity>
          )}

          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              className="py-3 rounded-lg items-center"
            >
              <Text className="text-secondary-600 font-JakartaMedium">
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleChecklist;
