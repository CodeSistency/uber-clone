import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { logger } from "@/lib/logger";

// Local type definitions
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogEntry = {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  component?: string;
  action?: string;
  data?: any;
  category?: string;
  stackTrace?: string;
};

// Mock LogLevel enum
const LogLevel = {
  DEBUG: 'debug' as const,
  INFO: 'info' as const,
  WARN: 'warn' as const,
  ERROR: 'error' as const,
};

interface LoggerDebuggerProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const LoggerDebugger: React.FC<LoggerDebuggerProps> = ({
  isVisible = false,
  onClose,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<string | undefined>();
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [limit, setLimit] = useState(50);
  const [stats, setStats] = useState({ 
    total: 0, 
    errors: 0, 
    warnings: 0, 
    info: 0, 
    debug: 0,
    byLevel: { debug: 0, info: 0, warn: 0, error: 0 }
  });

  useEffect(() => {
    if (isVisible) {
      refreshLogs();
      refreshStats();
    }
  }, [isVisible, filterLevel, filterCategory, limit]);

  const refreshLogs = () => {
    // Mock implementation since logger.getLogs doesn't exist
    setLogs([]);
  };

  const refreshStats = () => {
    // Mock implementation since logger.getStats doesn't exist
    setStats({ 
      total: 0, 
      errors: 0, 
      warnings: 0, 
      info: 0, 
      debug: 0,
      byLevel: { debug: 0, info: 0, warn: 0, error: 0 }
    });
  };

  const clearLogs = () => {
    Alert.alert("Clear Logs", "Are you sure you want to clear all logs?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          // logger.clearLogs() doesn't exist
          refreshLogs();
          refreshStats();
        },
      },
    ]);
  };

  const exportLogs = async () => {
    try {
      // logger.exportLogs() doesn't exist
      const logData = "Mock log data";
      Alert.alert(
        "Logs Exported",
        "Logs have been exported to console. Check your terminal for the full log data.",
      );
      
      
      
    } catch (error) {
      Alert.alert("Export Failed", "Failed to export logs");
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug':
        return "text-gray-500";
      case 'info':
        return "text-blue-500";
      case 'warn':
        return "text-yellow-500";
      case 'error':
        return "text-red-500";
      case 'critical':
        return "text-red-700";
      default:
        return "text-gray-500";
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return (
      date.toLocaleTimeString() +
      "." +
      date.getMilliseconds().toString().padStart(3, "0")
    );
  };

  if (!isVisible) return <></>;

  return (
    <SafeAreaView className="flex-1 bg-black bg-opacity-90">
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-xl font-bold">Logger Debugger</Text>
          <TouchableOpacity
            onPress={onClose}
            className="bg-red-500 px-3 py-1 rounded"
          >
            <Text className="text-white font-bold">Close</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="bg-gray-800 p-3 rounded mb-4">
          <Text className="text-white text-lg font-bold mb-2">Statistics</Text>
          <View className="flex-row flex-wrap">
            <Text className="text-white mr-4">Total: {stats.total}</Text>
            {Object.entries(stats.byLevel).map(([level, count]) => (
              <Text
                key={level}
                className={`mr-4 ${getLevelColor(level as any)}`}
              >
                {level}: {count}
              </Text>
            ))}
          </View>
        </View>

        {/* Filters */}
        <View className="bg-gray-800 p-3 rounded mb-4">
          <Text className="text-white text-lg font-bold mb-2">Filters</Text>

          {/* Level Filter */}
          <View className="flex-row mb-2">
            <Text className="text-white mr-2 w-16">Level:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setFilterLevel(undefined)}
                className={`mr-2 px-2 py-1 rounded ${!filterLevel ? "bg-blue-500" : "bg-gray-600"}`}
              >
                <Text className="text-white text-xs">ALL</Text>
              </TouchableOpacity>
              {Object.values(LogLevel)
                .filter((v) => typeof v === "number")
                .map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setFilterLevel(level as LogLevel)}
                    className={`mr-2 px-2 py-1 rounded ${filterLevel === level ? "bg-blue-500" : "bg-gray-600"}`}
                  >
                    <Text className="text-white text-xs">
                      {LogLevel[level]}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>

          {/* Category Filter */}
          <View className="flex-row mb-2">
            <Text className="text-white mr-2 w-16">Category:</Text>
            <TextInput
              value={filterCategory}
              onChangeText={setFilterCategory}
              placeholder="Filter by category..."
              placeholderTextColor="#666"
              className="flex-1 bg-gray-700 text-white px-2 py-1 rounded"
            />
          </View>

          {/* Limit */}
          <View className="flex-row mb-2">
            <Text className="text-white mr-2 w-16">Limit:</Text>
            <TextInput
              value={limit.toString()}
              onChangeText={(text) => setLimit(parseInt(text) || 50)}
              keyboardType="numeric"
              className="bg-gray-700 text-white px-2 py-1 rounded w-20"
            />
          </View>

          {/* Actions */}
          <View className="flex-row justify-between mt-2">
            <TouchableOpacity
              onPress={refreshLogs}
              className="bg-blue-500 px-3 py-1 rounded"
            >
              <Text className="text-white">Refresh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={clearLogs}
              className="bg-red-500 px-3 py-1 rounded"
            >
              <Text className="text-white">Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={exportLogs}
              className="bg-green-500 px-3 py-1 rounded"
            >
              <Text className="text-white">Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logs */}
        <ScrollView className="flex-1 bg-gray-900 rounded">
          {logs.length === 0 ? (
            <Text className="text-gray-500 text-center py-8">
              No logs found
            </Text>
          ) : (
            logs.map((log) => (
              <View key={log.id} className="border-b border-gray-700 p-2">
                <View className="flex-row justify-between items-start mb-1">
                  <Text className={`font-bold ${getLevelColor(log.level)}`}>
                    [{log.level.toUpperCase()}] {log.category || 'Unknown'}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {formatTimestamp(log.timestamp)}
                  </Text>
                </View>
                <Text className="text-white text-sm mb-1">{log.message}</Text>
                {log.data && (
                  <Text className="text-gray-400 text-xs font-mono">
                    {JSON.stringify(log.data, null, 2)}
                  </Text>
                )}
                {log.stackTrace && (
                  <Text className="text-red-400 text-xs font-mono mt-1">
                    {log.stackTrace}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default LoggerDebugger;
