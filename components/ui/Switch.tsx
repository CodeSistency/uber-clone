import React from "react";
import { TouchableOpacity, View } from "react-native";

export interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  className = "",
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="switch"
      onPress={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full ${checked ? "bg-brand-secondary" : "bg-gray-300 dark:bg-gray-700"} p-1 ${className}`}
      activeOpacity={0.8}
    >
      <View
        className={`w-5 h-5 rounded-full bg-white ${checked ? "ml-6" : "ml-0"}`}
      />
    </TouchableOpacity>
  );
};

export default Switch;
