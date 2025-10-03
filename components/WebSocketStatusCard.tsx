import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";

import { websocketService } from "@/app/services/websocketService";
import { icons } from "@/constants";

interface WebSocketStatusCardProps {
  showMetrics?: boolean;
  className?: string;
}

const WebSocketStatusCard: React.FC<WebSocketStatusCardProps> = ({
  showMetrics = false,
  className = "",
}) => {
  const [metrics, setMetrics] = useState(websocketService.getMetrics());
  const [health, setHealth] = useState(websocketService.getHealth());
  const [isExpanded, setIsExpanded] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Update metrics every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(websocketService.getMetrics());
      setHealth(websocketService.getHealth());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (!metrics.isConnected) {
      return <Text className="text-red-500">📶❌</Text>;
    }

    switch (health.status) {
      case "excellent":
        return <Text className="text-green-500">✓</Text>;
      case "good":
        return <Text className="text-green-500">📶</Text>;
      case "fair":
        return <Text className="text-yellow-500">⚠️</Text>;
      case "poor":
      case "critical":
        return <Text className="text-red-500">⚠️</Text>;
      default:
        return <Text className="text-gray-500">⏳</Text>;
    }
  };

  const getStatusColor = () => {
    if (!metrics.isConnected) return "#EF4444";

    switch (health.status) {
      case "excellent":
      case "good":
        return "#10B981";
      case "fair":
        return "#F59E0B";
      case "poor":
      case "critical":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatResponseTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const testBasicConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await websocketService.testBasicConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <View
      className={`bg-white dark:bg-brand-primaryDark rounded-xl p-4 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          {getStatusIcon()}
          <Text className="text-lg font-JakartaBold text-gray-800 dark:text-white ml-2">
            WebSocket
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text
            className="text-sm font-JakartaMedium mr-2"
            style={{ color: getStatusColor() }}
          >
            {metrics.isConnected ? "Conectado" : "Desconectado"}
          </Text>
          <TouchableOpacity
            onPress={() => websocketService.forceReconnect()}
            className="p-1 bg-gray-100 dark:bg-gray-700 rounded-full"
          >
            <Text className="text-gray-500">⚡</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Basic Info */}
      <View className="mt-3 flex-row justify-between items-center">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Estado:{" "}
          <Text
            className="font-JakartaMedium"
            style={{ color: getStatusColor() }}
          >
            {health.status === "excellent"
              ? "Excelente"
              : health.status === "good"
                ? "Bueno"
                : health.status === "fair"
                  ? "Regular"
                  : health.status === "poor"
                    ? "Deficiente"
                    : "Crítico"}
          </Text>
        </Text>

        {metrics.isConnected && (
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Uptime: {formatUptime(metrics.uptime)}
          </Text>
        )}
      </View>

      {/* Issues */}
      {health.issues.length > 0 && (
        <View className="mt-2">
          {health.issues.map((issue, index) => (
            <Text
              key={index}
              className="text-xs text-red-600 dark:text-red-400"
            >
              • {issue}
            </Text>
          ))}
        </View>
      )}

      {/* Expanded Metrics */}
      {isExpanded && showMetrics && (
        <ScrollView className="mt-4 max-h-40">
          <View className="space-y-2">
            {/* Connection Metrics */}
            <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <Text className="text-sm font-JakartaBold text-gray-800 dark:text-white mb-2">
                📊 Métricas de Conexión
              </Text>
              <View className="space-y-1">
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  Mensajes enviados: {metrics.messagesSent}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  Mensajes recibidos: {metrics.messagesReceived}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  Desconexiones: {metrics.disconnects}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                  Cola de mensajes: {metrics.queueSize}
                </Text>
              </View>
            </View>

            {/* Performance Metrics */}
            <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <Text className="text-sm font-JakartaBold text-blue-800 dark:text-blue-200 mb-2">
                ⚡ Performance
              </Text>
              <View className="space-y-1">
                <Text className="text-xs text-blue-700 dark:text-blue-300">
                  Response time: {formatResponseTime(metrics.avgResponseTime)}
                </Text>
                <Text className="text-xs text-blue-700 dark:text-blue-300">
                  Health score: {health.score}/100
                </Text>
              </View>
            </View>

            {/* Test Results */}
            {testResult && (
              <View className="mb-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Text className="text-xs font-JakartaBold mb-1">
                  Test Básico de Conexión:
                </Text>
                <Text
                  className={`text-xs ${testResult.success ? "text-green-600" : "text-red-600"}`}
                >
                  {testResult.success ? "✅ Éxito" : "❌ Falló"}
                  {testResult.error && `: ${testResult.error}`}
                </Text>
              </View>
            )}

            {/* Actions */}
            <View className="flex-row space-x-2 mb-2">
              <TouchableOpacity
                onPress={testBasicConnection}
                disabled={isTesting}
                className={`flex-1 rounded-lg p-2 items-center ${
                  isTesting
                    ? "bg-gray-300 dark:bg-gray-600"
                    : "bg-blue-100 dark:bg-blue-900"
                }`}
              >
                <Text
                  className={`text-xs font-JakartaMedium ${
                    isTesting
                      ? "text-gray-500"
                      : "text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {isTesting ? "🔄 Probando..." : "🧪 Test Básico"}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => websocketService.resetMetrics()}
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 items-center"
              >
                <Text className="text-xs font-JakartaMedium text-gray-700 dark:text-gray-300">
                  Reset Metrics
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => websocketService.forceReconnect()}
                className="flex-1 bg-primary rounded-lg p-2 items-center"
              >
                <Text className="text-xs font-JakartaBold text-white">
                  Reconectar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default WebSocketStatusCard;
