import React from "react";
import { View, Text } from "react-native";

interface ProgressBarProps {
  progress: number;
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  currentStep,
  totalSteps,
  className = "",
}) => {
  console.log(
    "[ProgressBar] Rendering with progress:",
    progress,
    "step:",
    currentStep,
    "of",
    totalSteps,
  );

  return (
    <View className={`px-5 py-2 ${className}`}>
      {/* Progress Bar */}
      <View className="w-full h-2 bg-gray-200 rounded-full mb-2">
        <View
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Progress Text */}
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-gray-600 font-Jakarta-Medium">
          Step {currentStep + 1} of {totalSteps}
        </Text>
        <Text className="text-sm text-primary font-Jakarta-Bold">
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
};

export default ProgressBar;
