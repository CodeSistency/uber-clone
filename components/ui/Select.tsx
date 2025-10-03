import React, { useState } from "react";
import { Modal, TouchableOpacity, View, Text, FlatList } from "react-native";

export interface SelectOption {
  label: string;
  value: string;
  subtitle?: string;
}

type SelectVariant = "neutral" | "primary";

export interface SelectProps {
  value: string | null;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  variant?: SelectVariant;
}

const optionContainerMap: Record<SelectVariant, string> = {
  neutral: "bg-white dark:bg-brand-primary",
  primary: "bg-brand-secondary",
};

const optionTextMap: Record<SelectVariant, string> = {
  neutral: "text-black dark:text-white",
  primary: "text-black",
};

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select",
  className = "",
  variant = "neutral",
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View accessible accessibilityRole="menu">
      <TouchableOpacity
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
        accessibilityHint="Abre el selector"
        className={`rounded-2xl px-4 py-4 border border-neutral-200 dark:border-brand-primaryDark ${optionContainerMap[variant]} ${className}`}
      >
        <Text
          className={`font-JakartaSemiBold text-base ${
            selected ? optionTextMap[variant] : "text-gray-500"
          }`}
        >
          {selected?.label || placeholder}
        </Text>
        {selected?.subtitle ? (
          <Text className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            {selected.subtitle}
          </Text>
        ) : null}
      </TouchableOpacity>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <View className="absolute left-4 right-4 bottom-8 bg-white dark:bg-brand-primary rounded-3xl p-4 max-h-96 shadow-xl">
          <FlatList
            data={options}
            keyExtractor={(i) => i.value}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  className={`px-4 py-3 rounded-2xl mb-2 ${
                    isSelected ? "bg-brand-secondary/30" : ""
                  }`}
                >
                  <Text
                    className={`text-base font-JakartaSemiBold ${optionTextMap.neutral}`}
                  >
                    {item.label}
                  </Text>
                  {item.subtitle ? (
                    <Text className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                      {item.subtitle}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

export default Select;
