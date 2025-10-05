import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useWalletStore, useWalletBalance } from '@/store/wallet';
import EmailInput from './components/EmailInput';
import AmountInput from './components/AmountInput';
import { WALLET_CONSTANTS } from '@/types/wallet';

export default function SendMoneyScreen() {
  const { validateTransfer, transferFunds } = useWalletStore();
  const balance = useWalletBalance();
  
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isAmountValid, setIsAmountValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const canContinue = isEmailValid && isAmountValid && !isValidating;

  const handleContinue = async () => {
    if (!canContinue) return;

    try {
      setIsValidating(true);
      
      // Validate transfer before proceeding
      const isValid = await validateTransfer(email, parseFloat(amount));
      
      if (isValid) {
        // Navigate to confirmation screen with data
        router.push({
          pathname: '/(customer)/wallet/confirm-transfer',
          params: {
            email,
            amount,
            note
          }
        });
      } else {
        Alert.alert(
          'Validation Failed',
          'Please check the recipient email and amount.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to validate transfer',
        [{ text: 'OK' }]
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text className="font-JakartaBold text-gray-800 text-xl">
            Send Money
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Email Input */}
          <EmailInput
            value={email}
            onChangeText={setEmail}
            onValidationChange={setIsEmailValid}
            placeholder="Enter recipient's email"
            className="mb-6"
          />

          {/* Amount Input */}
          <AmountInput
            value={amount}
            onChangeText={setAmount}
            onValidationChange={setIsAmountValid}
            placeholder="0.00"
            maxAmount={WALLET_CONSTANTS.MAX_TRANSFER_AMOUNT}
            className="mb-6"
          />

          {/* Note Input */}
          <View className="mb-8">
            <Text className="font-JakartaSemiBold text-gray-700 text-sm mb-2">
              Note (Optional)
            </Text>
            <View className="border-2 border-gray-300 rounded-lg px-4 py-3 bg-white">
              <Text className="text-lg mr-3">📝</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add a message"
                placeholderTextColor="#9CA3AF"
                className="flex-1 font-JakartaMedium text-gray-800 text-base"
                multiline
                numberOfLines={3}
                maxLength={255}
              />
            </View>
            <Text className="text-gray-400 text-xs mt-1 font-JakartaMedium">
              {note.length}/255 characters
            </Text>
          </View>

          {/* Balance Info */}
          <View className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <View className="flex-row items-center justify-between">
              <Text className="font-JakartaMedium text-primary-700 text-sm">
                Available Balance
              </Text>
              <Text className="font-JakartaBold text-primary-700 text-lg">
                ${balance.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Transfer Limits Info */}
          <View className="bg-gray-100 rounded-lg p-4 mb-8">
            <Text className="font-JakartaSemiBold text-gray-700 text-sm mb-2">
              Transfer Limits
            </Text>
            <View className="space-y-1">
              <Text className="font-JakartaMedium text-gray-600 text-xs">
                • Minimum: ${WALLET_CONSTANTS.MIN_TRANSFER_AMOUNT}
              </Text>
              <Text className="font-JakartaMedium text-gray-600 text-xs">
                • Maximum: ${WALLET_CONSTANTS.MAX_TRANSFER_AMOUNT}
              </Text>
              <Text className="font-JakartaMedium text-gray-600 text-xs">
                • Daily limit: ${WALLET_CONSTANTS.MAX_DAILY_LIMIT}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-6 pb-8 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!canContinue}
          className={`py-4 rounded-lg ${
            canContinue 
              ? 'bg-primary-500' 
              : 'bg-gray-300'
          }`}
          style={{ opacity: canContinue ? 1 : 0.6 }}
        >
          <Text className={`font-JakartaBold text-center text-lg ${
            canContinue ? 'text-white' : 'text-gray-500'
          }`}>
            {isValidating ? 'Validating...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
