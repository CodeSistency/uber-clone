import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

export interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  className = "",
}) => (
  <TouchableOpacity
    onPress={() => onChange(!checked)}
    className={`flex-row items-center ${className}`}
  >
    <View
      className={`w-5 h-5 rounded-md mr-2 border ${checked ? "bg-brand-secondary border-brand-secondary" : "border-gray-400 dark:border-gray-600"}`}
    />
    {!!label && (
      <Text className="text-black dark:text-white font-JakartaMedium">
        {label}
      </Text>
    )}
  </TouchableOpacity>
);

export default Checkbox;
