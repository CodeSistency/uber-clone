import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/common';
import { Card, Button, TextField } from '@/components/ui';
import { useProfileActions } from '@/store/profile';

export default function EmailVerificationScreen() {
  const { newEmail } = useLocalSearchParams();
  const { updateEmailVerification } = useProfileActions();

  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Start resend cooldown
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string) => {
    // Only allow numbers and limit to 6 digits
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setVerificationCode(cleaned);
  };

  const validateCode = () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return false;
    }
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Verification code must be 6 digits');
      return false;
    }
    return true;
  };

  const handleVerify = async () => {
    if (!validateCode()) return;

    try {
      setIsLoading(true);

      // Here you would typically make an API call
      // await profileAPI.verifyEmailChange({
      //   newEmail,
      //   verificationCode,
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update verification status
      updateEmailVerification(true);

      Alert.alert(
        'Email Verified!',
        'Your email address has been successfully updated.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
              router.back(); // Go back to profile screen
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error verifying email:', error);
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      setIsLoading(true);

      // Here you would typically make an API call
      // await profileAPI.resendEmailVerification({ newEmail });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset cooldown
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (error) {
      console.error('Error resending code:', error);
      Alert.alert('Error', 'Failed to resend verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <AppHeader
        title="Verify Email"
        showBackButton={true}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <Card className="p-6">
            {/* Email Icon */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                <Text className="text-3xl">📧</Text>
              </View>
              <Text className="text-xl font-Jakarta-Bold text-gray-800 mb-2">
                Verification Code Sent
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                We've sent a 6-digit code to:
              </Text>
              <Text className="text-sm font-Jakarta-SemiBold text-gray-800 mt-1">
                {newEmail}
              </Text>
            </View>

            {/* Verification Code Input */}
            <View className="mb-6">
              <Text className="text-sm font-Jakarta-SemiBold text-gray-700 mb-2">
                Enter Verification Code
              </Text>
              <TextField
                value={verificationCode}
                onChangeText={handleCodeChange}
                placeholder="1 2 3 4 5 6"
                keyboardType="numeric"
                maxLength={6}
                className="bg-white text-center text-lg tracking-widest"
                style={{ letterSpacing: 8 }}
              />
            </View>

            {/* Resend Code */}
            <View className="mb-6">
              <Text className="text-sm text-gray-600 text-center mb-2">
                Didn't receive the code?
              </Text>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resendCooldown > 0 || isLoading}
                className={`py-3 px-4 rounded-lg ${
                  resendCooldown > 0 || isLoading
                    ? 'bg-gray-100'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <Text
                  className={`text-center font-Jakarta-SemiBold ${
                    resendCooldown > 0 || isLoading
                      ? 'text-gray-400'
                      : 'text-blue-600'
                  }`}
                >
                  {resendCooldown > 0
                    ? `Resend Code (${resendCooldown}s)`
                    : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Verify Button */}
            <Button
              title="Verify Email"
              onPress={handleVerify}
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full"
            />

            {/* Help Text */}
            <View className="mt-6 bg-gray-50 rounded-lg p-4">
              <Text className="text-xs text-gray-600 text-center">
                Check your spam folder if you don't see the email. 
                The verification code will expire in 10 minutes.
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}




