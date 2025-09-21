import React from 'react';
import { Text, View, ViewProps } from 'react-native';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
type BadgeTone = 'solid' | 'soft' | 'outline';

export interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  tone?: BadgeTone;
  className?: string;
}

const base = 'px-2 py-0.5 rounded-full';
const toneMap: Record<BadgeTone, Record<BadgeVariant, string>> = {
  solid: {
    default: 'bg-black dark:bg-white',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500'
  },
  soft: {
    default: 'bg-gray-200 dark:bg-gray-700',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
    info: 'bg-blue-100'
  },
  outline: {
    default: 'border border-gray-400',
    success: 'border border-green-500',
    warning: 'border border-yellow-500',
    danger: 'border border-red-500',
    info: 'border border-blue-500'
  }
};
const textMap: Record<BadgeVariant, string> = {
  default: 'text-white dark:text-black',
  success: 'text-white',
  warning: 'text-black',
  danger: 'text-white',
  info: 'text-white'
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', tone = 'solid', className = '', ...props }) => {
  return (
    <View className={`${base} ${toneMap[tone][variant]} ${className}`} {...props}>
      <Text className={`text-xs font-JakartaBold ${textMap[variant]}`}>{label}</Text>
    </View>
  );
};

export default Badge;


