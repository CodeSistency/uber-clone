import React from 'react';
import { View, Text, ViewProps } from 'react-native';

type CardVariant = 'elevated' | 'outline' | 'filled' | 'glass';

export interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: CardVariant;
  className?: string;
}

const variantMap: Record<CardVariant, string> = {
  elevated: 'bg-white dark:bg-brand-primaryDark shadow-md shadow-black/20',
  outline: 'bg-white dark:bg-brand-primary border border-gray-200 dark:border-brand-primaryDark',
  filled: 'bg-brand-primary dark:bg-brand-primaryDark',
  glass: 'bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10'
};

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerRight,
  footer,
  variant = 'elevated',
  className = '',
  children,
  ...props
}) => {
  return (
    <View className={`rounded-xl p-4 ${variantMap[variant]} ${className}`} {...props}>
      {(title || headerRight) && (
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1 mr-2">
            {!!title && (
              <Text className="font-JakartaBold text-black dark:text-white">{title}</Text>
            )}
            {!!subtitle && (
              <Text className="text-xs text-gray-600 dark:text-gray-300">{subtitle}</Text>
            )}
          </View>
          {headerRight}
        </View>
      )}
      {children}
      {!!footer && <View className="mt-3">{footer}</View>}
    </View>
  );
};

export default Card;


