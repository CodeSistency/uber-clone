import React from "react";
import { TouchableOpacity, View } from "react-native";

export interface SwitchProps {
  checked?: boolean;
  value?: boolean;
  onChange?: (value: boolean) => void;
  onValueChange?: (value: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  value,
  onChange,
  onValueChange,
  className = "",
}) => {
  const isChecked = checked ?? value ?? false;
  const handleChange = onValueChange || onChange;
  return (
    <TouchableOpacity
      accessibilityRole="switch"
      onPress={() => handleChange?.(!isChecked)}
      className={`w-12 h-7 rounded-full ${isChecked ? "bg-brand-secondary" : "bg-gray-300 dark:bg-gray-700"} p-1 ${className}`}
      activeOpacity={0.8}
    >
      <View
        className={`w-5 h-5 rounded-full bg-white ${isChecked ? "ml-6" : "ml-0"}`}
      />
    </TouchableOpacity>
  );
};

export default Switch;
