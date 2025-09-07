import React from 'react';
import { View, TextInput, Text, TextInputProps, Image } from 'react-native';

type FieldVariant = 'default' | 'filled' | 'outline' | 'underline';
type FieldSize = 'sm' | 'md' | 'lg';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  LeftIcon?: any;
  RightIcon?: any;
  variant?: FieldVariant;
  size?: FieldSize;
  containerClassName?: string;
  inputClassName?: string;
}

const sizeMap: Record<FieldSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
};
const variantMap: Record<FieldVariant, string> = {
  default: 'bg-white dark:bg-brand-primary rounded-full border border-neutral-200 dark:border-brand-primaryDark',
  filled: 'bg-neutral-100 dark:bg-brand-primary rounded-full',
  outline: 'bg-transparent rounded-full border-2 border-brand-secondary',
  underline: 'bg-transparent border-b border-neutral-300 dark:border-brand-primaryDark rounded-none',
};

export const TextField: React.FC<TextFieldProps> = ({
  label,
  helperText,
  errorText,
  LeftIcon,
  RightIcon,
  variant = 'default',
  size = 'md',
  containerClassName = '',
  inputClassName = '',
  ...props
}) => {
  const hasError = !!errorText;
  return (
    <View className={`w-full ${containerClassName}`}>
      {!!label && (
        <Text className="text-sm font-JakartaSemiBold mb-2 text-black dark:text-white">{label}</Text>
      )}
      <View className={`flex-row items-center ${variantMap[variant]} ${hasError ? 'border-red-500' : ''}`}>
        {!!LeftIcon && <Image source={LeftIcon} className="w-5 h-5 ml-3" />}
        <TextInput
          className={`flex-1 font-JakartaMedium ${sizeMap[size]} text-black dark:text-white ${inputClassName}`}
          placeholderTextColor={hasError ? '#ef4444' : '#6b7280'}
          {...props}
        />
        {!!RightIcon && <Image source={RightIcon} className="w-5 h-5 mr-3" />}
      </View>
      {!!helperText && !hasError && (
        <Text className="text-xs mt-1 text-gray-500 dark:text-gray-300">{helperText}</Text>
      )}
      {!!hasError && (
        <Text className="text-xs mt-1 text-red-500">{errorText}</Text>
      )}
    </View>
  );
};

export default TextField;


