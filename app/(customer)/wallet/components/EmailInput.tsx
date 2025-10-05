import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { EmailInputProps, WALLET_CONSTANTS } from '@/types/wallet';
import { walletService } from '@/services/walletService';

const EmailInput: React.FC<EmailInputProps> = ({ 
  value, 
  onChangeText, 
  onValidationChange,
  placeholder = "Enter recipient's email",
  className = '' 
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce validation
  const debouncedValidation = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (email: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (email && WALLET_CONSTANTS.EMAIL_REGEX.test(email)) {
            setIsValidating(true);
            setError(null);
            
            try {
              // Validate with backend
              const result = await walletService.validateTransfer(email, 1); // Use minimal amount for validation
              setIsValid(result.valid);
              setError(result.valid ? null : result.message);
            } catch (err: any) {
              setIsValid(false);
              setError(err.message || 'Error validating email');
            } finally {
              setIsValidating(false);
            }
          } else if (email) {
            setIsValid(false);
            setError('Invalid email format');
          } else {
            setIsValid(false);
            setError(null);
          }
          
          onValidationChange?.(isValid);
        }, 500);
      };
    })(),
    [onValidationChange]
  );

  useEffect(() => {
    debouncedValidation(value);
  }, [value, debouncedValidation]);

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
        Recipient Email
      </Text>
      
      <View className={`relative`}>
        <View className={`flex-row items-center border-2 ${getBorderColor()} rounded-lg px-4 py-3 bg-white`}>
          <Text className="text-lg mr-3">📧</Text>
          
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            className="flex-1 font-JakartaMedium text-gray-800 text-base"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />
          
          <View className="ml-2">
            {isValidating ? (
              <ActivityIndicator size="small" color="#0286FF" />
            ) : (
              <Text className={`text-lg ${getIconColor()}`}>
                {error ? '❌' : isValid ? '✅' : '📧'}
              </Text>
            )}
          </View>
        </View>
        
        {error && (
          <Text className="text-danger-500 text-xs mt-1 font-JakartaMedium">
            {error}
          </Text>
        )}
        
        {isValid && !error && (
          <Text className="text-success-500 text-xs mt-1 font-JakartaMedium">
            User verified
          </Text>
        )}
      </View>
    </View>
  );
};

export default EmailInput;




