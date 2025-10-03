import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button, Card } from "@/components/ui";
import { useEmergencyStore } from "@/store/emergency";
import { useUI } from "@/components/UIWrapper";
import { useDriverNavigation } from "@/hooks/useDriverNavigation";

const DriverEmergency = () => {
  const {
    emergencyContacts,
    emergencyHistory,
    isEmergencyActive,
    activeEmergency,
    isLoading,
    error,
    fetchEmergencyContacts,
    fetchEmergencyHistory,
    triggerEmergency,
    resolveEmergency,
    addEmergencyContact,
    updateEmergencyContact,
    removeEmergencyContact,
  } = useEmergencyStore();

  const { showError, showSuccess } = useUI();
  const { hasActiveRide, currentServiceType } = useDriverNavigation();

  const [emergencyType, setEmergencyType] = useState<
    "sos" | "accident" | "medical" | "other"
  >("sos");

  useEffect(() => {
    // Fetch emergency data when component mounts
    loadEmergencyData();
  }, []);

  useEffect(() => {
    if (error) {
      showError("Error", error);
    }
  }, [error, showError]);

  const loadEmergencyData = async () => {
    try {
      await Promise.all([fetchEmergencyContacts(), fetchEmergencyHistory()]);
    } catch (error) {
      console.error("Error loading emergency data:", error);
    }
  };

  const handleEmergencyTrigger = () => {
    if (isEmergencyActive) {
      Alert.alert(
        "Emergency Already Active",
        "There's already an active emergency. Would you like to update it or resolve the current one?",
        [
          { text: "Resolve Current", onPress: handleResolveEmergency },
          { text: "Update", onPress: () => showEmergencyTypeSelection() },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }

    showEmergencyTypeSelection();
  };

  const showEmergencyTypeSelection = () => {
    Alert.alert(
      "Select Emergency Type",
      "What type of emergency are you experiencing?",
      [
        {
          text: "🚨 SOS - General Emergency",
          onPress: () => confirmEmergencyTrigger("sos", "General Emergency"),
        },
        {
          text: "🚗 Accident",
          onPress: () =>
            confirmEmergencyTrigger("accident", "Vehicle Accident"),
        },
        {
          text: "🏥 Medical Emergency",
          onPress: () =>
            confirmEmergencyTrigger("medical", "Medical Emergency"),
        },
        {
          text: "❓ Other",
          onPress: () => confirmEmergencyTrigger("other", "Other Emergency"),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const confirmEmergencyTrigger = (
    type: "sos" | "accident" | "medical" | "other",
    description: string,
  ) => {
    Alert.alert(
      "🚨 EMERGENCY ALERT",
      `This will trigger a ${description} alert and notify emergency services immediately.\n\nAre you sure this is a real emergency?`,
      [
        {
          text: "Yes, Trigger Emergency",
          style: "destructive",
          onPress: () => executeEmergencyTrigger(type),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const executeEmergencyTrigger = async (
    type: "sos" | "accident" | "medical" | "other",
  ) => {
    try {
      await triggerEmergency({
        type,
        description: getEmergencyDescription(type),
        location: {
          latitude: 0, // Would get from GPS
          longitude: 0, // Would get from GPS
          address: "Current location", // Would get from GPS
        },
      });

      showSuccess(
        "Emergency Alert Sent",
        "Emergency services have been notified. Help is on the way.",
      );
    } catch (error) {
      console.error("Emergency trigger failed:", error);
      showError(
        "Emergency Failed",
        "Unable to send emergency alert. Please call emergency services directly.",
      );
    }
  };

  const getEmergencyDescription = (type: string) => {
    switch (type) {
      case "sos":
        return "General emergency assistance requested";
      case "accident":
        return "Vehicle accident occurred";
      case "medical":
        return "Medical emergency";
      case "other":
        return "Other emergency situation";
      default:
        return "Emergency assistance requested";
    }
  };

  const handleResolveEmergency = async () => {
    if (!activeEmergency) return;

    try {
      await resolveEmergency(activeEmergency.id);
      showSuccess("Emergency Resolved", "Emergency alert has been resolved.");
    } catch (error) {
      console.error("Emergency resolution failed:", error);
      showError(
        "Resolution Failed",
        "Unable to resolve emergency. Please contact support.",
      );
    }
  };

  const handleCallEmergencyServices = () => {
    Alert.alert(
      "Call Emergency Services",
      "Would you like to call emergency services directly?",
      [
        {
          text: "Call 911",
          onPress: () => {
            // Would implement actual phone call
            Alert.alert(
              "Calling 911",
              "Emergency services would be called now.",
            );
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const handleAddEmergencyContact = () => {
    router.push("/(driver)/emergency/contacts/add" as any);
  };

  const getEmergencyIcon = (type: string) => {
    switch (type) {
      case "sos":
        return "🚨";
      case "accident":
        return "🚗";
      case "medical":
        return "🏥";
      case "other":
        return "❓";
      default:
        return "🚨";
    }
  };

  const getEmergencyColor = (type: string) => {
    switch (type) {
      case "sos":
        return "text-danger-600";
      case "accident":
        return "text-warning-600";
      case "medical":
        return "text-success-600";
      case "other":
        return "text-secondary-600";
      default:
        return "text-danger-600";
    }
  };

  if (isLoading && emergencyContacts.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-general-500 justify-center items-center">
        <Text className="text-lg">Loading emergency system...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Emergency</Text>
        <Text className="text-secondary-600 mt-1">
          Safety first - emergency assistance at your fingertips
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Emergency Status */}
          {isEmergencyActive && activeEmergency && (
            <Card className="mb-6 bg-danger-50 border-danger-300">
              <View className="flex-row items-center mb-3">
                <Text className="text-2xl mr-3">🚨</Text>
                <View className="flex-1">
                  <Text className="font-JakartaBold text-danger-700 text-lg">
                    EMERGENCY ACTIVE
                  </Text>
                  <Text className="text-danger-600">
                    {getEmergencyDescription(activeEmergency.type)}
                  </Text>
                </View>
              </View>

              <View className="bg-danger-100 rounded-lg p-3 mb-4">
                <Text className="text-danger-800 font-JakartaBold mb-1">
                  Help is on the way
                </Text>
                <Text className="text-danger-700 text-sm">
                  Emergency services have been notified. Stay calm and follow
                  instructions.
                </Text>
              </View>

              <View className="flex-row space-x-3">
                <Button
                  title="Resolve Emergency"
                  onPress={handleResolveEmergency}
                  className="flex-1"
                  variant="success"
                />
                <Button
                  title="Call 911"
                  onPress={handleCallEmergencyServices}
                  className="flex-1"
                  variant="danger"
                />
              </View>
            </Card>
          )}

          {/* Emergency Button */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4 text-center">
              Emergency Assistance
            </Text>

            <TouchableOpacity
              onPress={handleEmergencyTrigger}
              disabled={isEmergencyActive}
              className={`p-8 rounded-2xl items-center justify-center mb-4 ${
                isEmergencyActive ? "bg-secondary-200" : "bg-danger-500"
              }`}
            >
              <Text
                className={`text-6xl mb-2 ${isEmergencyActive ? "text-secondary-400" : "text-white"}`}
              >
                🚨
              </Text>
              <Text
                className={`font-JakartaExtraBold text-xl text-center ${
                  isEmergencyActive ? "text-secondary-400" : "text-white"
                }`}
              >
                {isEmergencyActive ? "EMERGENCY ACTIVE" : "TAP FOR EMERGENCY"}
              </Text>
              <Text
                className={`text-sm text-center mt-1 ${
                  isEmergencyActive ? "text-secondary-400" : "text-white/80"
                }`}
              >
                {isEmergencyActive
                  ? "Emergency services notified"
                  : "Alerts emergency services immediately"}
              </Text>
            </TouchableOpacity>

            {!isEmergencyActive && (
              <View className="flex-row space-x-3">
                <Button
                  title="Call 911"
                  onPress={handleCallEmergencyServices}
                  className="flex-1"
                  variant="danger"
                />
                <Button
                  title="Report Issue"
                  onPress={() =>
                    router.push("/(driver)/emergency/report" as any)
                  }
                  className="flex-1"
                  variant="secondary"
                />
              </View>
            )}
          </Card>

          {/* Emergency Contacts */}
          <Card className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-JakartaBold">
                Emergency Contacts
              </Text>
              <Button
                title="Add Contact"
                onPress={handleAddEmergencyContact}
                variant="outline"
                className="px-3 py-1"
              />
            </View>

            {emergencyContacts && emergencyContacts.length > 0 ? (
              <View className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <View
                    key={contact.id || index}
                    className="flex-row items-center justify-between py-3 border-b border-secondary-200 last:border-b-0"
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">👤</Text>
                      <View>
                        <Text className="font-JakartaMedium">
                          {contact.name}
                        </Text>
                        <Text className="text-secondary-600 text-sm">
                          {contact.phone}
                        </Text>
                        {contact.relationship && (
                          <Text className="text-secondary-500 text-xs">
                            {contact.relationship}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        // Would implement call functionality
                        Alert.alert(
                          "Call Contact",
                          `Call ${contact.name} at ${contact.phone}?`,
                        );
                      }}
                      className="bg-primary-500 px-4 py-2 rounded-full"
                    >
                      <Text className="text-white font-JakartaBold text-sm">
                        CALL
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View className="py-8 items-center">
                <Text className="text-4xl mb-3">📞</Text>
                <Text className="text-secondary-600 text-center mb-3">
                  No emergency contacts added
                </Text>
                <Button
                  title="Add Emergency Contact"
                  onPress={handleAddEmergencyContact}
                  variant="primary"
                />
              </View>
            )}
          </Card>

          {/* Emergency History */}
          <Card className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-JakartaBold">
                Emergency History
              </Text>
              <Button
                title="View All"
                onPress={() =>
                  router.push("/(driver)/emergency/history" as any)
                }
                variant="outline"
                className="px-3 py-1"
              />
            </View>

            {emergencyHistory && emergencyHistory.length > 0 ? (
              <View className="space-y-3">
                {emergencyHistory.slice(0, 3).map((emergency, index) => (
                  <View
                    key={emergency.id || index}
                    className="flex-row items-center py-3 border-b border-secondary-200 last:border-b-0"
                  >
                    <Text className="text-2xl mr-3">
                      {getEmergencyIcon(emergency.type)}
                    </Text>
                    <View className="flex-1">
                      <Text className="font-JakartaMedium text-sm">
                        {new Date(emergency.timestamp).toLocaleDateString()}
                      </Text>
                      <Text
                        className={`font-JakartaBold ${getEmergencyColor(emergency.type)}`}
                      >
                        {getEmergencyDescription(emergency.type)}
                      </Text>
                      <Text className="text-secondary-600 text-xs">
                        Status: {emergency.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="py-8 items-center">
                <Text className="text-secondary-600">No emergency history</Text>
              </View>
            )}
          </Card>

          {/* Safety Tips */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">Safety Tips</Text>

            <View className="space-y-3">
              <View className="flex-row items-start">
                <Text className="text-lg mr-3">📍</Text>
                <View className="flex-1">
                  <Text className="font-JakartaMedium mb-1">
                    Share Location
                  </Text>
                  <Text className="text-secondary-600 text-sm">
                    Keep location sharing enabled for faster emergency response.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <Text className="text-lg mr-3">📱</Text>
                <View className="flex-1">
                  <Text className="font-JakartaMedium mb-1">Stay Calm</Text>
                  <Text className="text-secondary-600 text-sm">
                    In an emergency, stay calm and provide clear information to
                    responders.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <Text className="text-lg mr-3">🔋</Text>
                <View className="flex-1">
                  <Text className="font-JakartaMedium mb-1">Battery Level</Text>
                  <Text className="text-secondary-600 text-sm">
                    Keep your phone charged. Emergency alerts work even with low
                    battery.
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Emergency Resources */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">
              Emergency Resources
            </Text>

            <View className="space-y-3">
              <TouchableOpacity
                onPress={() =>
                  router.push("/(driver)/emergency/resources" as any)
                }
                className="flex-row items-center justify-between py-3 border-b border-secondary-200"
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-3">📚</Text>
                  <View>
                    <Text className="font-JakartaMedium">
                      Safety Guidelines
                    </Text>
                    <Text className="text-secondary-600 text-sm">
                      Emergency preparedness guide
                    </Text>
                  </View>
                </View>
                <Text className="text-secondary-400">→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(driver)/support" as any)}
                className="flex-row items-center justify-between py-3"
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-3">🆘</Text>
                  <View>
                    <Text className="font-JakartaMedium">24/7 Support</Text>
                    <Text className="text-secondary-600 text-sm">
                      Get help anytime
                    </Text>
                  </View>
                </View>
                <Text className="text-secondary-400">→</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverEmergency;
