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

  const safeTotal =
    totalSteps > 0 && Number.isFinite(totalSteps) ? totalSteps : 1;
  const safeStep =
    Number.isFinite(currentStep) && currentStep >= 0 ? currentStep : 0;
  const safeProgress =
    Number.isFinite(progress) && progress >= 0
      ? Math.min(100, Math.max(0, progress))
      : Math.round(((safeStep + 1) / safeTotal) * 100);

  return (
    <View className={`px-5 py-2 ${className}`}>
      {/* Progress Bar */}
      <View className="w-full h-2 bg-gray-200 rounded-full mb-2">
        <View
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${safeProgress}%` }}
        />
      </View>

      {/* Progress Text */}
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-gray-600 font-Jakarta-Medium">
          Step {String(safeStep + 1)} of {String(safeTotal)}
        </Text>
        <Text className="text-sm text-primary font-Jakarta-Bold">
          {String(Math.round(safeProgress))}%
        </Text>
      </View>
    </View>
  );
};

export default ProgressBar;
