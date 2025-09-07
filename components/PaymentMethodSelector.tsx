import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { icons } from '@/constants';
import { useUI } from '@/components/UIWrapper';

interface PaymentMethod {
  id: string;
  type: 'card' | 'cash' | 'wallet';
  title: string;
  details: string;
  icon: string;
  isDefault?: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethodId: string | null;
  onSelectMethod: (methodId: string) => void;
  className?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card_1',
    type: 'card',
    title: '**** 4567',
    details: 'Visa',
    icon: '💳',
    isDefault: true
  },
  {
    id: 'card_2',
    type: 'card',
    title: '**** 8901',
    details: 'Mastercard',
    icon: '💳'
  },
  {
    id: 'cash',
    type: 'cash',
    title: 'Cash',
    details: 'Pay driver directly',
    icon: '💵'
  },
  {
    id: 'wallet_apple',
    type: 'wallet',
    title: 'Apple Pay',
    details: 'Touch ID required',
    icon: '📱'
  },
  {
    id: 'wallet_google',
    type: 'wallet',
    title: 'Google Pay',
    details: 'Fingerprint required',
    icon: '📱'
  },
  {
    id: 'add_new',
    type: 'card',
    title: 'Add New Card',
    details: 'Link a new payment method',
    icon: '➕'
  }
];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethodId,
  onSelectMethod,
  className = '',
}) => {
  const { theme } = useUI();
  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => {
    const isSelected = selectedMethodId === item.id;
    const isAddNew = item.id === 'add_new';

    return (
      <TouchableOpacity
        onPress={() => onSelectMethod(item.id)}
        className={`mr-4 p-4 rounded-xl border-2 min-w-[140px] ${
          isSelected
            ? 'border-primary bg-primary-50'
            : `border-gray-200 dark:border-gray-600 bg-brand-primary dark:bg-brand-primaryDark`
        } shadow-sm`}
      >
        <View className="items-center mb-3">
          <Text className={`text-2xl ${isSelected ? 'opacity-100' : 'opacity-70'}`}>
            {item.icon}
          </Text>
        </View>

        <Text
          className={`font-JakartaSemiBold text-sm mb-1 text-center ${
            isSelected ? 'text-primary' : `text-gray-800 dark:text-gray-200`
          }`}
        >
          {item.title}
        </Text>

        <Text className={`text-xs text-center mb-2 ${
          isSelected ? 'text-primary-600' : `text-gray-600 dark:text-gray-400`
        }`}>
          {item.details}
        </Text>

        {item.isDefault && (
          <View className="bg-primary rounded-full px-2 py-1 mt-1">
            <Text className="text-white text-xs text-center font-JakartaMedium">
              Default
            </Text>
          </View>
        )}

        {isSelected && !isAddNew && (
          <View className="w-6 h-6 bg-primary rounded-full items-center justify-center mt-2 self-center">
            <Text className="text-white text-sm font-bold">✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className={`mb-6 ${className}`}>
      <Text className="text-xl font-JakartaBold mb-4 text-center">
        Choose payment method
      </Text>

      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentMethod}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />

      {selectedMethodId && selectedMethodId !== 'add_new' && (
        <View className="mt-4 p-4 bg-primary-50 rounded-lg mx-5">
          <Text className="text-sm font-JakartaSemiBold text-primary mb-1">
            Selected Payment Method
          </Text>
          <Text className="text-xs text-primary-600">
            {paymentMethods.find(m => m.id === selectedMethodId)?.title} • {paymentMethods.find(m => m.id === selectedMethodId)?.details}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PaymentMethodSelector;