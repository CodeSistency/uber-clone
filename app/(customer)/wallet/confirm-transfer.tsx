import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useWalletStore, useWalletBalance } from '@/store/wallet';
import UserCard from './components/UserCard';
import { WALLET_CONSTANTS } from '@/types/wallet';

export default function ConfirmTransferScreen() {
  const { transferFunds } = useWalletStore();
  const balance = useWalletBalance();
  const params = useLocalSearchParams();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    avatar: ''
  });

  const email = params.email as string;
  const amount = parseFloat(params.amount as string);
  const note = params.note as string;

  // Calculate fees and total
  const transferFee = amount * 0.05; // 5% fee
  const totalAmount = amount + transferFee;

  useEffect(() => {
    // Simulate getting user info from email
    // In real app, this would be an API call
    const getUserInfo = async () => {
      try {
        // Mock user data based on email
        const mockUser = {
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: email,
          avatar: ''
        };
        setUserInfo(mockUser);
      } catch (error) {
        console.error('Error getting user info:', error);
      }
    };

    if (email) {
      getUserInfo();
    }
  }, [email]);

  const handleSendPayment = async () => {
    try {
      setIsProcessing(true);
      
      const transferData = {
        toUserEmail: email,
        amount: amount,
        description: note || `Transfer to ${userInfo.name}`,
        referenceType: 'USER_TRANSFER' as any
      };

      const result = await transferFunds(transferData);
      
      if (result.success) {
        Alert.alert(
          'Transfer Successful!',
          `$${amount.toFixed(2)} has been sent to ${userInfo.name}`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(customer)/wallet/')
            }
          ]
        );
      } else {
        throw new Error(result.message || 'Transfer failed');
      }
    } catch (error: any) {
      Alert.alert(
        'Transfer Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Transfer',
      'Are you sure you want to cancel this transfer?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => router.back() }
      ]
    );
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
            Confirm Transfer
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Recipient Info */}
          <View className="mb-6">
            <Text className="font-JakartaSemiBold text-gray-700 text-sm mb-3">
              Recipient
            </Text>
            <UserCard
              user={userInfo}
              isVerified={true}
            />
          </View>

          {/* Transfer Details */}
          <View className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <Text className="font-JakartaSemiBold text-gray-700 text-sm mb-4">
              Transfer Details
            </Text>
            
            <View className="space-y-4">
              {/* Amount */}
              <View className="flex-row justify-between items-center">
                <Text className="font-JakartaMedium text-gray-600 text-base">
                  Amount to send
                </Text>
                <Text className="font-JakartaBold text-gray-800 text-lg">
                  ${amount.toFixed(2)}
                </Text>
              </View>

              {/* Note */}
              {note && (
                <View className="flex-row justify-between items-start">
                  <Text className="font-JakartaMedium text-gray-600 text-base">
                    Note
                  </Text>
                  <Text className="font-JakartaMedium text-gray-800 text-base text-right flex-1 ml-4">
                    "{note}"
                  </Text>
                </View>
              )}

              {/* Transfer Fee */}
              <View className="flex-row justify-between items-center border-t border-gray-100 pt-4">
                <Text className="font-JakartaMedium text-gray-600 text-base">
                  Transfer fee (5%)
                </Text>
                <Text className="font-JakartaBold text-warning-600 text-base">
                  ${transferFee.toFixed(2)}
                </Text>
              </View>

              {/* Total */}
              <View className="flex-row justify-between items-center border-t border-gray-200 pt-4">
                <Text className="font-JakartaBold text-gray-800 text-lg">
                  Total
                </Text>
                <Text className="font-JakartaBold text-primary-600 text-xl">
                  ${totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Balance Check */}
          <View className={`rounded-lg p-4 mb-6 ${
            balance >= totalAmount 
              ? 'bg-success-50 border border-success-200' 
              : 'bg-danger-50 border border-danger-200'
          }`}>
            <View className="flex-row items-center justify-between">
              <Text className={`font-JakartaMedium text-sm ${
                balance >= totalAmount ? 'text-success-700' : 'text-danger-700'
              }`}>
                {balance >= totalAmount ? 'Sufficient Balance' : 'Insufficient Balance'}
              </Text>
              <Text className={`font-JakartaBold text-lg ${
                balance >= totalAmount ? 'text-success-700' : 'text-danger-700'
              }`}>
                ${balance.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Terms and Conditions */}
          <View className="bg-gray-100 rounded-lg p-4 mb-6">
            <Text className="font-JakartaSemiBold text-gray-700 text-sm mb-2">
              Terms & Conditions
            </Text>
            <Text className="font-JakartaMedium text-gray-600 text-xs leading-5">
              By proceeding, you agree that this transfer is final and cannot be reversed. 
              The recipient will receive the funds immediately. Transfer fees are non-refundable.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-6 pb-8 bg-white border-t border-gray-200">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleCancel}
            className="flex-1 py-4 rounded-lg border-2 border-gray-300"
          >
            <Text className="font-JakartaBold text-center text-lg text-gray-600">
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSendPayment}
            disabled={isProcessing || balance < totalAmount}
            className={`flex-1 py-4 rounded-lg ${
              balance >= totalAmount && !isProcessing
                ? 'bg-primary-500' 
                : 'bg-gray-300'
            }`}
            style={{ opacity: balance >= totalAmount && !isProcessing ? 1 : 0.6 }}
          >
            <Text className={`font-JakartaBold text-center text-lg ${
              balance >= totalAmount && !isProcessing ? 'text-white' : 'text-gray-500'
            }`}>
              {isProcessing ? 'Processing...' : 'Send Payment'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}





