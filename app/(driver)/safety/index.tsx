import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  safetyService,
  EmergencyContact,
  EmergencyAlert,
  ShareTripData,
  IncidentReport,
} from "@/app/services/safetyService";
import { useUI } from "@/components/UIWrapper";
import { useSafetyStore } from "@/store";

// Dummy data for development
const dummyEmergencyContacts: EmergencyContact[] = [
  {
    id: "1",
    name: "Maria Rodriguez",
    phone: "+1 (555) 123-4567",
    relationship: "Spouse",
    isPrimary: true,
    isVerified: true,
  },
  {
    id: "2",
    name: "Carlos Rodriguez",
    phone: "+1 (555) 987-6543",
    relationship: "Brother",
    isPrimary: false,
    isVerified: true,
  },
];

const dummyActiveAlerts: EmergencyAlert[] = [];

const dummyShareTripData: ShareTripData | null = null;

const dummyIncidentReports: IncidentReport[] = [
  {
    id: "1",
    type: "safety_concern",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: "123 Main St, New York, NY",
    },
    description: "Passenger was acting suspiciously during the ride",
    severity: "medium",
    status: "investigating",
    reportedBy: "driver_123",
    rideId: "ride_456",
    passengerId: "passenger_789",
    evidence: {
      photos: [],
      videos: [],
      audio: [],
    },
    followUpRequired: true,
    followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
];

const SafetyScreen = () => {
  const { theme } = useUI();
  const { isLoading, error } = useSafetyStore();

  const [refreshing, setRefreshing] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>(
    dummyEmergencyContacts,
  );
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(dummyActiveAlerts);
  const [shareData, setShareData] = useState<ShareTripData | null>(
    dummyShareTripData,
  );
  const [incidents, setIncidents] =
    useState<IncidentReport[]>(dummyIncidentReports);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In real implementation, fetch from API
    } catch (error) {
      
    } finally {
      setRefreshing(false);
    }
  };

  const handleEmergencyAlert = (
    type: "sos" | "accident" | "medical" | "other",
  ) => {
    Alert.alert(
      "Emergency Alert",
      `Are you sure you want to trigger a ${type.toUpperCase()} emergency alert?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: () => {
            // In real implementation, trigger emergency alert
            
            Alert.alert(
              "Alert Sent",
              "Emergency services have been notified and your contacts will be alerted.",
            );
          },
        },
      ],
    );
  };

  const handleShareTrip = () => {
    if (shareData) {
      Alert.alert(
        "Stop Trip Sharing",
        "Are you sure you want to stop sharing your trip location?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Stop Sharing",
            style: "destructive",
            onPress: () => {
              setShareData(null);
              Alert.alert(
                "Trip Sharing Stopped",
                "Your location is no longer being shared.",
              );
            },
          },
        ],
      );
    } else {
      router.push("/(driver)/safety/share-trip" as any);
    }
  };

  const renderEmergencyButton = () => (
    <View className="mx-4 mb-4">
      <TouchableOpacity
        onPress={() => handleEmergencyAlert("sos")}
        className="bg-red-500 rounded-2xl p-6 items-center shadow-lg"
      >
        <Text className="text-white text-4xl mb-2">🆘</Text>
        <Text className="text-white font-JakartaBold text-xl">
          Emergency SOS
        </Text>
        <Text className="text-white text-sm text-center mt-1">
          Press in case of emergency
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuickActions = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">
        Quick Actions
      </Text>

      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={() => handleEmergencyAlert("accident")}
          className="flex-1 bg-orange-500 rounded-xl p-4 items-center"
        >
          <Text className="text-white text-2xl mb-1">🚗</Text>
          <Text className="text-white font-JakartaBold text-sm">
            Report Accident
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleEmergencyAlert("medical")}
          className="flex-1 bg-blue-500 rounded-xl p-4 items-center"
        >
          <Text className="text-white text-2xl mb-1">🏥</Text>
          <Text className="text-white font-JakartaBold text-sm">
            Medical Emergency
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(driver)/safety/incident-report" as any)}
          className="flex-1 bg-gray-500 rounded-xl p-4 items-center"
        >
          <Text className="text-white text-2xl mb-1">📋</Text>
          <Text className="text-white font-JakartaBold text-sm">
            Report Incident
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmergencyContacts = () => (
    <View className="mx-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-JakartaBold text-black dark:text-white">
          Emergency Contacts
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(driver)/safety/contacts" as any)}
        >
          <Text className="text-brand-primary font-JakartaBold">Manage</Text>
        </TouchableOpacity>
      </View>

      {contacts.map((contact) => (
        <View
          key={contact.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="font-JakartaBold text-black dark:text-white">
                  {contact.name}
                </Text>
                {contact.isPrimary && (
                  <View className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full ml-2">
                    <Text className="text-green-800 dark:text-green-200 font-JakartaBold text-xs">
                      Primary
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                {contact.phone}
              </Text>
              <Text className="text-gray-500 dark:text-gray-500 text-xs">
                {contact.relationship}
              </Text>
            </View>

            <View className="items-center">
              <TouchableOpacity className="bg-green-500 rounded-full p-2 mb-1">
                <Text className="text-white text-lg">📞</Text>
              </TouchableOpacity>
              <Text className="text-xs text-gray-500 dark:text-gray-500">
                Call
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderTripSharing = () => (
    <View className="mx-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-JakartaBold text-black dark:text-white">
          Trip Sharing
        </Text>
        <TouchableOpacity onPress={handleShareTrip}>
          <Text className="text-brand-primary font-JakartaBold">
            {shareData ? "Stop Sharing" : "Start Sharing"}
          </Text>
        </TouchableOpacity>
      </View>

      {shareData ? (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <View className="flex-row items-center mb-2">
            <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <Text className="font-JakartaBold text-black dark:text-white">
              Trip Sharing Active
            </Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-400 text-sm mb-1">
            Sharing with {shareData.contactsShared.length} contacts
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-sm">
            Expires: {shareData.expiresAt.toLocaleTimeString()}
          </Text>
        </View>
      ) : (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            Share your trip location with emergency contacts
          </Text>
        </View>
      )}
    </View>
  );

  const renderActiveAlerts = () => {
    if (alerts.length === 0) return null;

    return (
      <View className="mx-4 mb-4">
        <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">
          Active Alerts
        </Text>

        {alerts.map((alert) => (
          <View
            key={alert.id}
            className="bg-red-100 dark:bg-red-900 rounded-xl p-4 mb-3 shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-JakartaBold text-red-800 dark:text-red-200">
                {alert.type.toUpperCase()} Alert
              </Text>
              <Text className="text-red-600 dark:text-red-400 text-sm">
                {alert.timestamp.toLocaleTimeString()}
              </Text>
            </View>
            <Text className="text-red-700 dark:text-red-300 text-sm mb-2">
              Location: {alert.location.address}
            </Text>
            <Text className="text-red-700 dark:text-red-300 text-sm">
              Status: {alert.status}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderIncidentReports = () => (
    <View className="mx-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-JakartaBold text-black dark:text-white">
          Recent Reports
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(driver)/safety/incidents" as any)}
        >
          <Text className="text-brand-primary font-JakartaBold">View All</Text>
        </TouchableOpacity>
      </View>

      {incidents.map((incident) => (
        <View
          key={incident.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-JakartaBold text-black dark:text-white capitalize">
              {incident.type.replace("_", " ")}
            </Text>
            <View
              className={`px-2 py-1 rounded-full ${
                incident.severity === "high" || incident.severity === "critical"
                  ? "bg-red-100 dark:bg-red-900"
                  : incident.severity === "medium"
                    ? "bg-yellow-100 dark:bg-yellow-900"
                    : "bg-green-100 dark:bg-green-900"
              }`}
            >
              <Text
                className={`font-JakartaBold text-xs ${
                  incident.severity === "high" ||
                  incident.severity === "critical"
                    ? "text-red-800 dark:text-red-200"
                    : incident.severity === "medium"
                      ? "text-yellow-800 dark:text-yellow-200"
                      : "text-green-800 dark:text-green-200"
                }`}
              >
                {incident.severity}
              </Text>
            </View>
          </View>

          <Text className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            {incident.description}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-gray-500 dark:text-gray-500 text-xs">
              {incident.timestamp.toLocaleDateString()}
            </Text>
            <Text
              className={`font-JakartaBold text-xs ${
                incident.status === "resolved"
                  ? "text-green-600"
                  : incident.status === "investigating"
                    ? "text-yellow-600"
                    : "text-gray-600"
              }`}
            >
              {incident.status}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSafetySettings = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">
        Safety Settings
      </Text>

      <View className="space-y-3">
        <TouchableOpacity
          onPress={() => router.push("/(driver)/safety/settings" as any)}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">⚙️</Text>
            <Text className="font-JakartaBold text-black dark:text-white">
              Safety Preferences
            </Text>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push("/(driver)/safety/emergency-services" as any)
          }
          className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">🚨</Text>
            <Text className="font-JakartaBold text-black dark:text-white">
              Emergency Services
            </Text>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(driver)/safety/safety-check" as any)}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row items-center justify-between shadow-sm"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">✅</Text>
            <Text className="font-JakartaBold text-black dark:text-white">
              Safety Check
            </Text>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-JakartaBold text-black dark:text-white">
          Safety Toolkit
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(driver)/safety/settings" as any)}
        >
          <Text className="text-2xl">⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderEmergencyButton()}
        {renderQuickActions()}
        {renderActiveAlerts()}
        {renderTripSharing()}
        {renderEmergencyContacts()}
        {renderIncidentReports()}
        {renderSafetySettings()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SafetyScreen;
