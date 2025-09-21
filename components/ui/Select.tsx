import React, { useState } from "react";
import { Modal, TouchableOpacity, View, Text, FlatList } from "react-native";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  value: string | null;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className={`rounded-full px-4 py-3 bg-white dark:bg-brand-primary border border-neutral-200 dark:border-brand-primaryDark ${className}`}
      >
        <Text
          className={`font-JakartaMedium ${selected ? "text-black dark:text-white" : "text-gray-500"}`}
        >
          {selected?.label || placeholder}
        </Text>
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
        <View className="absolute left-4 right-4 bottom-8 bg-white dark:bg-brand-primary rounded-2xl p-3 max-h-96">
          <FlatList
            data={options}
            keyExtractor={(i) => i.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className="px-3 py-3 rounded-lg"
              >
                <Text className="text-black dark:text-white font-JakartaMedium">
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
};

export default Select;
