import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ActionButtonProps } from '@/types/wallet';

const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon: Icon, 
  label, 
  variant = 'primary',
  onPress,
  disabled = false,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-primary-500',
          text: 'text-white',
          icon: 'text-white'
        };
      case 'secondary':
        return {
          container: 'bg-secondary-200',
          text: 'text-gray-700',
          icon: 'text-gray-600'
        };
      case 'success':
        return {
          container: 'bg-success-500',
          text: 'text-white',
          icon: 'text-white'
        };
      case 'warning':
        return {
          container: 'bg-warning-500',
          text: 'text-white',
          icon: 'text-white'
        };
      default:
        return {
          container: 'bg-primary-500',
          text: 'text-white',
          icon: 'text-white'
        };
    }
  };

  const styles = getVariantStyles();
  const opacity = disabled ? 0.5 : 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`items-center ${className}`}
      activeOpacity={0.7}
      style={{ opacity }}
    >
      {/* Icon Container */}
      <View className={`w-16 h-16 rounded-full ${styles.container} items-center justify-center mb-2 shadow-lg`}>
        <Icon size={24} color={styles.icon.includes('white') ? '#FFFFFF' : '#374151'} />
      </View>
      
      {/* Label */}
      <Text className={`font-JakartaMedium text-sm text-center ${styles.text}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default ActionButton;




