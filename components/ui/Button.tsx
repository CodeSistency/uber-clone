import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { VariantProps } from './types';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps, VariantProps<ButtonVariant, ButtonSize> {
  title: string;
  loading?: boolean;
  LeftIcon?: React.ComponentType<any>;
  RightIcon?: React.ComponentType<any>;
}

const base = 'rounded-full flex-row items-center justify-center';
const sizeMap: Record<ButtonSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-5 py-4'
};
const variantMap: Record<ButtonVariant, string> = {
  primary: 'bg-brand-secondary',
  secondary: 'bg-black dark:bg-brand-primaryDark',
  outline: 'bg-transparent border-2 border-brand-secondary',
  ghost: 'bg-transparent',
  danger: 'bg-red-500',
  success: 'bg-green-500',
  glass: 'bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 backdrop-blur-md'
};
const textVariantMap: Record<ButtonVariant, string> = {
  primary: 'text-black',
  secondary: 'text-white',
  outline: 'text-black dark:text-white',
  ghost: 'text-black dark:text-white',
  danger: 'text-white',
  success: 'text-white',
  glass: 'text-black dark:text-white'
};

export const Button: React.FC<ButtonProps> = ({
  title,
  loading,
  LeftIcon,
  RightIcon,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const contentColor = `${textVariantMap[variant]}`;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled || loading}
      className={`${base} ${sizeMap[size]} ${variantMap[variant]} ${disabled ? 'opacity-60' : ''} ${className}`}
      {...props}
    >
      {LeftIcon && <LeftIcon />}
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? 'black' : 'white'} />
      ) : (
        <Text className={`font-JakartaBold text-base ${contentColor}`}>{title}</Text>
      )}
      {RightIcon && <RightIcon />}
    </TouchableOpacity>
  );
};

export default Button;


