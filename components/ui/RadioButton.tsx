import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  selected,
  onPress,
  disabled = false,
  className = "",
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center py-2 ${className}`}
    >
      <View
        className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
          selected
            ? "border-primary-500 bg-primary-500"
            : "border-secondary-300"
        } ${disabled ? "opacity-50" : ""}`}
      >
        {selected && (
          <View className="w-2 h-2 rounded-full bg-white" />
        )}
      </View>
      <Text
        className={`flex-1 font-JakartaMedium ${
          selected ? "text-primary-700" : "text-secondary-700"
        } ${disabled ? "opacity-50" : ""}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default RadioButton;
