import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

import CustomButton from "@/components/CustomButton";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";

const PaymentConfirmation = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Mock data - in real app this would come from route params and API
  const paymentData = {
    methodId: 'card_1',
    amount: 4.75,
    methodTitle: '**** 4567',
    methodDetails: 'Visa',
    transactionId: 'TXN_' + Date.now()
  };

  const handlePaymentConfirm = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);

      // Navigate to rating after 2 seconds
      setTimeout(() => {
        router.replace('/(root)/rating-screen' as any);
      }, 2000);
    }, 2000);
  };

  const handleViewReceipt = () => {
    // In real app, this would open receipt modal or navigate to receipt screen
    console.log('View receipt clicked');
  };

  if (isComplete) {
    return (
      <RideLayout title="Payment Confirmed" snapPoints={["85%"]}>
        <View className="flex-1 items-center justify-center p-6">
          {/* Success Animation */}
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">✅</Text>
          </View>

          <Text className="text-2xl font-JakartaBold text-center mb-4">
            Payment Successful!
          </Text>

          <View className="bg-white rounded-lg p-6 w-full shadow-sm mb-6">
            <Text className="font-JakartaSemiBold mb-2">Payment Details</Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm">Amount</Text>
              <Text className="text-sm font-JakartaMedium">${paymentData.amount.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm">Method</Text>
              <Text className="text-sm font-JakartaMedium">{paymentData.methodTitle} • {paymentData.methodDetails}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm">Transaction ID</Text>
              <Text className="text-sm font-JakartaMedium">{paymentData.transactionId}</Text>
            </View>
          </View>

          <Text className="text-sm text-gray-600 text-center mb-6">
            Receipt sent to: john@email.com
          </Text>

          <View className="w-full space-y-3">
            <CustomButton
              title="View Receipt"
              onPress={handleViewReceipt}
              bgVariant="outline"
              className="mb-3"
            />

            <CustomButton
              title="Continue to Rating"
              onPress={() => router.replace('/(root)/rating-screen' as any)}
            />
          </View>
        </View>
      </RideLayout>
    );
  }

  return (
    <RideLayout title="Confirm Payment" snapPoints={["85%"]}>
      <View className="flex-1 p-6">
        {/* Payment Summary */}
        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="font-JakartaSemiBold mb-3">Confirm Payment</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-sm">Trip Total</Text>
            <Text className="text-sm font-JakartaMedium">${paymentData.amount.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-sm">Processing Fee</Text>
            <Text className="text-sm font-JakartaMedium">$0.00</Text>
          </View>

          <View className="flex-row justify-between border-t border-gray-300 pt-2">
            <Text className="font-JakartaBold">Total to Pay</Text>
            <Text className="font-JakartaBold text-primary">${paymentData.amount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="font-JakartaSemiBold mb-3">Payment Method</Text>
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">💳</Text>
            <View className="flex-1">
              <Text className="font-JakartaMedium">{paymentData.methodTitle}</Text>
              <Text className="text-sm text-gray-600">{paymentData.methodDetails}</Text>
            </View>
          </View>
        </View>

        {/* Processing State */}
        {isProcessing && (
          <View className="bg-blue-50 rounded-lg p-4 mb-6">
            <View className="flex-row items-center">
              <View className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
              <Text className="text-blue-800 font-JakartaMedium">Processing payment...</Text>
            </View>
          </View>
        )}

        {/* Confirm Button */}
        {!isProcessing && (
          <CustomButton
            title="Confirm & Pay"
            onPress={handlePaymentConfirm}
            className="mt-auto"
          />
        )}

        {/* Security Note */}
        <Text className="text-xs text-gray-500 text-center mt-4">
          Your payment information is encrypted and secure
        </Text>
      </View>
    </RideLayout>
  );
};

export default PaymentConfirmation;
