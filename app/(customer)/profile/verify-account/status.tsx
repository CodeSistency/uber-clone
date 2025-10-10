import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/common';
import { Card, Button } from '@/components/ui';
import { useVerificationStatus } from '@/store/profile';

export default function VerificationStatusScreen() {
  const verificationStatus = useVerificationStatus();

  const getStatusInfo = () => {
    switch (verificationStatus.verificationStatus) {
      case 'approved':
        return {
          icon: '✅',
          title: 'Account Verified',
          message: 'Your account has been successfully verified. You can now access all features of the application.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'pending':
        return {
          icon: '⏳',
          title: 'Verification Pending',
          message: 'Your documents are being reviewed by our team. You will receive a notification once the review is complete.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'rejected':
        return {
          icon: '❌',
          title: 'Verification Failed',
          message: verificationStatus.rejectionReason || 'Please check the requirements and resubmit your documents.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: '⚠️',
          title: 'Not Verified',
          message: 'Please submit your documents to verify your account.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleResubmit = () => {
    router.push('/(customer)/profile/verify-account');
  };

  const handleBackToProfile = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppHeader
        title="Verification Status"
        showBackButton={true}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <Card className="p-6">
            {/* Status Icon and Title */}
            <View className="items-center mb-6">
              <View className={`w-20 h-20 ${statusInfo.bgColor} rounded-full items-center justify-center mb-4`}>
                <Text className="text-4xl">{statusInfo.icon}</Text>
              </View>
              <Text className={`text-2xl font-Jakarta-Bold ${statusInfo.color} mb-2`}>
                {statusInfo.title}
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                {statusInfo.message}
              </Text>
            </View>

            {/* Verification Details */}
            <View className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-4 mb-6`}>
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-3">
                Verification Details:
              </Text>
              
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Email Verified:</Text>
                  <Text className={`text-sm font-Jakarta-SemiBold ${
                    verificationStatus.emailVerified ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {verificationStatus.emailVerified ? 'Yes' : 'No'}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Phone Verified:</Text>
                  <Text className={`text-sm font-Jakarta-SemiBold ${
                    verificationStatus.phoneVerified ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {verificationStatus.phoneVerified ? 'Yes' : 'No'}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Account Verified:</Text>
                  <Text className={`text-sm font-Jakarta-SemiBold ${
                    verificationStatus.accountVerified ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {verificationStatus.accountVerified ? 'Yes' : 'No'}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Status:</Text>
                  <Text className={`text-sm font-Jakarta-SemiBold ${statusInfo.color}`}>
                    {verificationStatus.verificationStatus.charAt(0).toUpperCase() + 
                     verificationStatus.verificationStatus.slice(1)}
                  </Text>
                </View>
                
                {verificationStatus.verificationDate && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Verified Date:</Text>
                    <Text className="text-sm font-Jakarta-SemiBold text-gray-800">
                      {verificationStatus.verificationDate.toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              {verificationStatus.verificationStatus === 'rejected' && (
                <Button
                  title="Resubmit Documents"
                  onPress={handleResubmit}
                  className="w-full"
                />
              )}
              
              {verificationStatus.verificationStatus === 'pending' && (
                <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Text className="text-sm font-Jakarta-Medium text-blue-800 text-center">
                    Your documents are under review. Please wait for the verification process to complete.
                  </Text>
                </View>
              )}
              
              {verificationStatus.verificationStatus === 'approved' && (
                <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <Text className="text-sm font-Jakarta-Medium text-green-800 text-center">
                    Congratulations! Your account is fully verified and you can access all features.
                  </Text>
                </View>
              )}

              <Button
                title="Back to Profile"
                onPress={handleBackToProfile}
                variant="secondary"
                className="w-full"
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}








