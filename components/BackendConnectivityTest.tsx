import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";

import {
  runBackendConnectivityTest,
  getBackendStatus,
} from "@/lib/backendTest";
import { log } from "@/lib/logger";

interface BackendConnectivityTestProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const BackendConnectivityTest: React.FC<
  BackendConnectivityTestProps
> = ({ isVisible = false, onClose }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  const runTests = async () => {
    setIsTesting(true);
    setTestResults(null);
    setStatus(null);

    try {
      log.info(
        "Starting backend connectivity tests",
        {
          component: "BackendConnectivityTest",
          action: "start_connectivity_tests"
        }
      );

      const results = await runBackendConnectivityTest();
      const healthStatus = getBackendStatus(results);

      setTestResults(results);
      setStatus(healthStatus);

      log.info("Backend tests completed", {
        component: "BackendConnectivityTest",
        action: "tests_completed",
        data: {
          overallStatus: healthStatus.overall,
          apiStatus: healthStatus.api,
          chatStatus: healthStatus.chat,
          wsStatus: healthStatus.websocket,
        }
      });

      // Show summary alert
      Alert.alert(
        "Backend Test Results",
        `Overall: ${healthStatus.overall.toUpperCase()}\n` +
          `API: ${healthStatus.api.toUpperCase()}\n` +
          `Chat: ${healthStatus.chat.toUpperCase()}\n` +
          `WebSocket: ${healthStatus.websocket.toUpperCase()}`,
        [{ text: "OK" }],
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      log.error(
        "Backend tests failed",
        {
          component: "BackendConnectivityTest",
          action: "test_failed",
          data: { error: errorMessage }
        }
      );

      Alert.alert("Test Failed", `Error: ${errorMessage}`);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
        return "text-green-600";
      case "unhealthy":
      case "disconnected":
        return "text-red-600";
      case "degraded":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
        return "✅";
      case "unhealthy":
      case "disconnected":
        return "❌";
      case "degraded":
        return "⚠️";
      default:
        return "❓";
    }
  };

  if (!isVisible) return null;

  return (
    <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
      <View className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800 dark:text-white">
            Backend Connectivity Test
          </Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={runTests}
          disabled={isTesting}
          className={`p-3 rounded-lg mb-4 ${
            isTesting ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          <Text
            className={`text-white text-center font-semibold ${
              isTesting ? "opacity-50" : ""
            }`}
          >
            {isTesting ? "Testing..." : "Run Backend Tests"}
          </Text>
        </TouchableOpacity>

        {status && (
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2">Overall Status:</Text>
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">
                {getStatusIcon(status.overall)}
              </Text>
              <Text
                className={`text-lg font-semibold ${getStatusColor(status.overall)}`}
              >
                {status.overall.toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        {testResults && (
          <ScrollView className="max-h-96">
            <View className="mb-4">
              <Text className="text-lg font-semibold mb-2">API Tests:</Text>
              {testResults.api.map((test: any, index: number) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center py-1"
                >
                  <Text className="flex-1 text-sm">{test.endpoint}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-500 mr-2">
                      {test.responseTime}ms
                    </Text>
                    <Text>{test.success ? "✅" : "❌"}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View className="mb-4">
              <Text className="text-lg font-semibold mb-2">
                Chat API Tests:
              </Text>
              {testResults.chat.map((test: any, index: number) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center py-1"
                >
                  <Text className="flex-1 text-sm">{test.endpoint}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-500 mr-2">
                      {test.responseTime}ms
                    </Text>
                    <Text>{test.success ? "✅" : "❌"}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View className="mb-4">
              <Text className="text-lg font-semibold mb-2">
                WebSocket Test:
              </Text>
              <View className="flex-row justify-between items-center py-1">
                <Text className="flex-1 text-sm">/uber-realtime</Text>
                <View className="flex-row items-center">
                  <Text className="text-xs text-gray-500 mr-2">
                    {testResults.websocket.responseTime}ms
                  </Text>
                  <Text>{testResults.websocket.connected ? "✅" : "❌"}</Text>
                </View>
              </View>
            </View>

            <View className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <Text className="text-xs text-gray-600 dark:text-gray-300">
                Server URL:{" "}
                {process.env.EXPO_PUBLIC_SERVER_URL || "http://localhost:3000"}
                {"\n"}
                WS URL:{" "}
                {process.env.EXPO_PUBLIC_WS_URL || "http://localhost:3000"}
                {"\n"}
                Timestamp: {testResults.timestamp}
              </Text>
            </View>
          </ScrollView>
        )}

        <TouchableOpacity
          onPress={onClose}
          className="mt-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-lg"
        >
          <Text className="text-gray-800 dark:text-white text-center font-semibold">
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BackendConnectivityTest;
