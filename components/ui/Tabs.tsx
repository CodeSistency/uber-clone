import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ViewProps } from "react-native";

type TabsVariant = "underline" | "pill" | "segmented";

export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps extends ViewProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  variant?: TabsVariant;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  value,
  onChange,
  variant = "underline",
  className = "",
  ...props
}) => {
  const renderItem = (item: TabItem) => {
    const isActive = item.key === value;
    const base = "px-4 py-2";
    if (variant === "pill") {
      return (
        <TouchableOpacity
          key={item.key}
          disabled={item.disabled}
          onPress={() => onChange(item.key)}
          className={`${base} rounded-full ${isActive ? "bg-brand-secondary" : "bg-transparent"}`}
        >
          <Text
            className={`font-JakartaBold ${isActive ? "text-black" : "text-black dark:text-white"}`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    }
    if (variant === "segmented") {
      return (
        <TouchableOpacity
          key={item.key}
          disabled={item.disabled}
          onPress={() => onChange(item.key)}
          className={`${base} flex-1 items-center ${isActive ? "bg-black dark:bg-brand-primaryDark" : "bg-transparent"}`}
        >
          <Text
            className={`font-JakartaBold ${isActive ? "text-white" : "text-black dark:text-white"}`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    }
    // underline
    return (
      <TouchableOpacity
        key={item.key}
        disabled={item.disabled}
        onPress={() => onChange(item.key)}
        className={`${base}`}
      >
        <Text
          className={`font-JakartaBold ${isActive ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-300"}`}
        >
          {item.label}
        </Text>
        <View
          className={`h-0.5 mt-1 ${isActive ? "bg-brand-secondary" : "bg-transparent"}`}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View
      className={`flex-row items-center ${variant === "segmented" ? "bg-gray-100 dark:bg-brand-primary rounded-full p-1" : ""} ${className}`}
      {...props}
    >
      {items.map(renderItem)}
    </View>
  );
};

export default Tabs;
