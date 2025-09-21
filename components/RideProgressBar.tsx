import React from "react";
import { View, Text } from "react-native";

interface RideProgressBarProps {
  progress: number; // 0-100
  status: string;
  estimatedTime?: string;
  className?: string;
}

const RideProgressBar: React.FC<RideProgressBarProps> = ({
  progress,
  status,
  estimatedTime,
  className = "",
}) => {
  const getProgressColor = () => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusColor = () => {
    if (status.toLowerCase().includes("arrived")) return "text-green-600";
    if (status.toLowerCase().includes("arriving")) return "text-blue-600";
    if (status.toLowerCase().includes("progress")) return "text-purple-600";
    return "text-gray-600";
  };

  return (
    <View className={`mb-4 ${className}`}>
      <View className="flex-row justify-between items-center mb-2">
        <Text className={`font-JakartaSemiBold text-sm ${getStatusColor()}`}>
          {status}
        </Text>
        {estimatedTime && (
          <Text className="text-sm text-gray-600">{estimatedTime}</Text>
        )}
      </View>

      <View className="w-full bg-gray-200 rounded-full h-3">
        <View
          className={`h-3 rounded-full ${getProgressColor()}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </View>

      <Text className="text-xs text-gray-500 mt-1 text-right">
        {Math.round(progress)}% complete
      </Text>
    </View>
  );
};

export default RideProgressBar;
