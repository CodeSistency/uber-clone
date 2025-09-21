import React from "react";
import { TextInput, View, Text, TextInputProps } from "react-native";

export interface TextAreaProps extends TextInputProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  rows?: number;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  helperText,
  errorText,
  rows = 4,
  className = "",
  ...props
}) => {
  const hasError = !!errorText;
  return (
    <View className={`w-full ${className}`}>
      {!!label && (
        <Text className="mb-2 text-sm font-JakartaSemiBold text-black dark:text-white">
          {label}
        </Text>
      )}
      <TextInput
        multiline
        numberOfLines={rows}
        className={`w-full rounded-2xl p-3 font-JakartaMedium text-black dark:text-white bg-white dark:bg-brand-primary border ${hasError ? "border-red-500" : "border-neutral-200 dark:border-brand-primaryDark"}`}
        placeholderTextColor={hasError ? "#ef4444" : "#6b7280"}
        {...props}
      />
      {!!helperText && !hasError && (
        <Text className="text-xs mt-1 text-gray-500 dark:text-gray-300">
          {helperText}
        </Text>
      )}
      {!!hasError && (
        <Text className="text-xs mt-1 text-red-500">{errorText}</Text>
      )}
    </View>
  );
};

export default TextArea;
