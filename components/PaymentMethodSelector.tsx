import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { icons } from '@/constants';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'cash' | 'wallet';
  details: string;
  icon: any;
  isDefault?: boolean;
}

interface PaymentMethodSelectorProps {
  selectedPaymentMethod: string | null;
  onSelectPaymentMethod: (paymentMethodId: string) => void;
  totalAmount: number;
  className?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card_visa_4567',
    name: 'Visa **** 4567',
    type: 'card',
    details: 'Default card',
    icon: icons.card,
    isDefault: true
  },
  {
    id: 'card_mastercard_8901',
    name: 'Mastercard **** 8901',
    type: 'card',
    details: 'Work card',
    icon: icons.card
  },
  {
    id: 'cash',
    name: 'Cash',
    type: 'cash',
    details: 'Pay driver directly',
    icon: icons.cash
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    type: 'wallet',
    details: 'Touch ID / Face ID',
    icon: icons.apple
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    type: 'wallet',
    details: 'Fingerprint / PIN',
    icon: icons.google
  }
];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedPaymentMethod,
  onSelectPaymentMethod,
  totalAmount,
  className = ''
}) => {
  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => {
    const isSelected = selectedPaymentMethod === item.id;

    return (
      <TouchableOpacity
        onPress={() => onSelectPaymentMethod(item.id)}
        className={`mb-3 p-4 rounded-xl border-2 mx-5 ${
          isSelected
            ? 'border-primary bg-primary-50'
            : 'border-gray-200 bg-white'
        } shadow-sm`}
      >
        <View className="flex-row items-center">
          <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
            item.type === 'card' ? 'bg-blue-100' :
            item.type === 'cash' ? 'bg-green-100' : 'bg-purple-100'
          }`}>
            <Image
              source={item.icon}
              className="w-5 h-5"
              resizeMode="contain"
              style={{
                tintColor: item.type === 'card' ? '#3B82F6' :
                          item.type === 'cash' ? '#10B981' : '#8B5CF6'
              }}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className={`font-JakartaSemiBold text-base mr-2 ${
                isSelected ? 'text-primary' : 'text-gray-800'
              }`}>
                {item.name}
              </Text>
              {item.isDefault && (
                <View className="bg-blue-100 px-2 py-1 rounded-full">
                  <Text className="text-xs text-blue-600 font-JakartaMedium">
                    Default
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-gray-600 mt-1">
              {item.details}
            </Text>
          </View>

          {isSelected && (
            <View className="w-6 h-6 bg-primary rounded-full items-center justify-center">
              <Text className="text-white text-sm font-bold">✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);

  return (
    <View className={`mb-6 ${className}`}>
      <Text className="text-xl font-JakartaBold mb-4 text-center px-5">
        Choose payment method
      </Text>

      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentMethod}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity className="mx-5 mb-4 p-4 border-2 border-dashed border-gray-300 rounded-xl items-center">
        <Text className="text-primary font-JakartaSemiBold">+ Add New Card</Text>
      </TouchableOpacity>

      {selectedPaymentMethod && (
        <View className="mt-4 p-4 bg-primary-50 rounded-lg mx-5">
          <Text className="text-sm font-JakartaSemiBold text-primary mb-2">
            Payment Summary
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-primary-600">Method:</Text>
            <Text className="text-sm font-JakartaMedium text-primary-600">
              {selectedMethod?.name}
            </Text>
          </View>
          <View className="flex-row justify-between border-t border-primary-200 pt-2 mt-2">
            <Text className="text-sm font-JakartaBold text-primary">Total:</Text>
            <Text className="text-sm font-JakartaBold text-primary">
              ${totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default PaymentMethodSelector;
