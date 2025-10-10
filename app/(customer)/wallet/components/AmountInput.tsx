import React, { useState, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { AmountInputProps, WALLET_CONSTANTS } from '@/types/wallet';

const AmountInput: React.FC<AmountInputProps> = ({ 
  value, 
  onChangeText, 
  onValidationChange,
  placeholder = "0.00",
  maxAmount = WALLET_CONSTANTS.MAX_TRANSFER_AMOUNT,
  className = '' 
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    validateAmount(value);
  }, [value, maxAmount]);

  const validateAmount = (amount: string) => {
    if (!amount || amount === '') {
      setIsValid(false);
      setError(null);
      onValidationChange?.(false);
      return;
    }

    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount)) {
      setIsValid(false);
      setError('Invalid amount');
      onValidationChange?.(false);
      return;
    }

    if (numericAmount < WALLET_CONSTANTS.MIN_TRANSFER_AMOUNT) {
      setIsValid(false);
      setError(`Minimum amount is $${WALLET_CONSTANTS.MIN_TRANSFER_AMOUNT}`);
      onValidationChange?.(false);
      return;
    }

    if (numericAmount > maxAmount) {
      setIsValid(false);
      setError(`Maximum amount is $${maxAmount}`);
      onValidationChange?.(false);
      return;
    }

    if (!WALLET_CONSTANTS.AMOUNT_REGEX.test(amount)) {
      setIsValid(false);
      setError('Invalid format (e.g., 25.50)');
      onValidationChange?.(false);
      return;
    }

    setIsValid(true);
    setError(null);
    onValidationChange?.(true);
  };

  const formatCurrency = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return cleaned;
  };

  const handleTextChange = (text: string) => {
    const formatted = formatCurrency(text);
    onChangeText(formatted);
  };

  const getBorderColor = () => {
    if (error) return 'border-danger-500';
    if (isValid) return 'border-success-500';
    if (value) return 'border-primary-500';
    return 'border-gray-300';
  };

  const getIconColor = () => {
    if (error) return 'text-danger-500';
    if (isValid) return 'text-success-500';
    return 'text-gray-400';
  };

  return (
    <View className={`${className}`}>
      <Text className="font-JakartaSemiBold text-gray-700 text-sm mb-2">
        Amount
      </Text>
      
      <View className={`relative`}>
        <View className={`flex-row items-center border-2 ${getBorderColor()} rounded-lg px-4 py-3 bg-white`}>
          <Text className="text-lg mr-3">💰</Text>
          
          <Text className="text-gray-500 font-JakartaMedium text-lg">
            $
          </Text>
          
          <TextInput
            value={value}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            className="flex-1 font-JakartaMedium text-gray-800 text-lg ml-1"
            keyboardType="numeric"
            autoComplete="off"
            autoCorrect={false}
          />
          
          <View className="ml-2">
            <Text className={`text-lg ${getIconColor()}`}>
              {error ? '❌' : isValid ? '✅' : '💰'}
            </Text>
          </View>
        </View>
        
        {error && (
          <Text className="text-danger-500 text-xs mt-1 font-JakartaMedium">
            {error}
          </Text>
        )}
        
        {isValid && !error && (
          <Text className="text-success-500 text-xs mt-1 font-JakartaMedium">
            Valid amount
          </Text>
        )}
      </View>
    </View>
  );
};

export default AmountInput;








