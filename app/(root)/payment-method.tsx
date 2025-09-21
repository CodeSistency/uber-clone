import { router } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

import CustomButton from "@/components/CustomButton";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";

const PaymentMethod = () => {
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(
    "card_1",
  ); // Default to first card

  const tripTotal = 4.75; // Mock data - in real app this would come from ride data

  const handleContinue = () => {
    if (selectedMethodId) {
      // Navigate to payment confirmation with selected method
      router.push({
        pathname: "/(root)/payment-confirmation",
        params: {
          methodId: selectedMethodId,
          amount: tripTotal.toString(),
        },
      } as any);
    }
  };

  return (
    <RideLayout title="Payment Methods" snapPoints={["85%"]}>
      <View className="flex-1">
        {/* Trip Summary */}
        <View className="bg-gray-50 dark:bg-brand-primary rounded-lg p-4 mx-5 mb-6">
          <Text className="font-JakartaSemiBold mb-2 text-black dark:text-white">
            Trip Summary
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-black dark:text-white">
              Downtown Mall
            </Text>
            <Text className="text-sm font-JakartaMedium text-black dark:text-white">
              5.2 miles
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-black dark:text-white">
              Comfort Service
            </Text>
            <Text className="text-sm font-JakartaMedium text-black dark:text-white">
              18 min
            </Text>
          </View>
          <View className="flex-row justify-between border-t border-gray-300 dark:border-brand-primaryDark pt-2 mt-2">
            <Text className="font-JakartaBold text-black dark:text-white">
              Total
            </Text>
            <Text className="font-JakartaBold text-black dark:text-white">
              ${tripTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment Method Selector */}
        <PaymentMethodSelector
          selectedMethodId={selectedMethodId}
          onSelectMethod={setSelectedMethodId}
        />

        {/* Add New Card Option */}
        {selectedMethodId === "add_new" && (
          <View className="mx-5 p-4 bg-blue-50 dark:bg-brand-primary rounded-lg mb-4">
            <Text className="text-sm font-JakartaSemiBold text-blue-800 dark:text-white mb-2">
              Add New Payment Method
            </Text>
            <Text className="text-xs text-blue-600 dark:text-gray-300 mb-3">
              This would open a form to add a new credit/debit card or link a
              digital wallet.
            </Text>
            <TouchableOpacity className="bg-brand-secondary rounded-lg py-2 px-4">
              <Text className="text-black text-center font-JakartaMedium">
                Add Card
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Continue Button */}
        <View className="mx-5 mt-4">
          <CustomButton
            title="Continue to Payment"
            onPress={handleContinue}
            disabled={!selectedMethodId}
          />
        </View>
      </View>
    </RideLayout>
  );
};

export default PaymentMethod;
