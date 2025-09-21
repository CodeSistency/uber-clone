import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  className = "",
}) => {
  return (
    <View className={`space-y-2 ${className}`}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            disabled={opt.disabled}
            onPress={() => onChange(opt.value)}
            className="flex-row items-center"
          >
            <View
              className={`w-5 h-5 rounded-full mr-2 border ${active ? "border-brand-secondary" : "border-gray-400 dark:border-gray-600"} items-center justify-center`}
            >
              {active && (
                <View className="w-2.5 h-2.5 rounded-full bg-brand-secondary" />
              )}
            </View>
            <Text className="text-black dark:text-white font-JakartaMedium">
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default RadioGroup;
