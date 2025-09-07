import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ value, min = 0, max = Number.MAX_SAFE_INTEGER, step = 1, onChange, className = '' }) => {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <View className={`flex-row items-center rounded-full bg-white dark:bg-brand-primary border border-neutral-200 dark:border-brand-primaryDark ${className}`}>
      <TouchableOpacity onPress={dec} className="px-3 py-2">
        <Text className="text-black dark:text-white text-xl">−</Text>
      </TouchableOpacity>
      <Text className="px-4 font-JakartaBold text-black dark:text-white">{value}</Text>
      <TouchableOpacity onPress={inc} className="px-3 py-2">
        <Text className="text-black dark:text-white text-xl">＋</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Stepper;


