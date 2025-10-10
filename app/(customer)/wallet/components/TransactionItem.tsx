import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TransactionItemProps, TransactionType } from '@/types/wallet';

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  showAvatar = true, 
  onPress,
  className = '' 
}) => {
  const isCredit = transaction.transactionType === TransactionType.CREDIT || 
                   transaction.transactionType === TransactionType.TOP_UP ||
                   transaction.transactionType === TransactionType.REFUND;
  
  const isDebit = transaction.transactionType === TransactionType.DEBIT || 
                  transaction.transactionType === TransactionType.TRANSFER ||
                  transaction.transactionType === TransactionType.PAYMENT;

  const amountColor = isCredit ? 'text-success-500' : 'text-danger-500';
  const amountPrefix = isCredit ? '+' : '-';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.TRANSFER:
        return '💸';
      case TransactionType.TOP_UP:
        return '💳';
      case TransactionType.PAYMENT:
        return '🚗';
      case TransactionType.REFUND:
        return '↩️';
      default:
        return '💰';
    }
  };

  const getAvatarColor = (id: number) => {
    const colors = [
      'bg-purple-500',
      'bg-green-500', 
      'bg-blue-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    return colors[id % colors.length];
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex-row items-center p-4 bg-white rounded-lg mb-2 shadow-sm ${className}`}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      {showAvatar && (
        <View className={`w-12 h-12 rounded-full ${getAvatarColor(transaction.id)} items-center justify-center mr-4`}>
          <Text className="text-white text-lg">
            {getTransactionIcon(transaction.transactionType)}
          </Text>
        </View>
      )}

      {/* Transaction Details */}
      <View className="flex-1">
        <Text className="font-JakartaSemiBold text-gray-800 text-base mb-1">
          {transaction.description}
        </Text>
        {transaction.reference && (
          <Text className="font-JakartaMedium text-gray-500 text-sm mb-1">
            {transaction.reference}
          </Text>
        )}
        <Text className="font-JakartaMedium text-gray-400 text-sm">
          {formatDate(transaction.createdAt)}
        </Text>
      </View>

      {/* Amount */}
      <View className="items-end">
        <Text className={`font-JakartaBold text-lg ${amountColor}`}>
          {amountPrefix}${Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <Text className="font-JakartaMedium text-gray-400 text-xs capitalize">
          {transaction.transactionType.replace('_', ' ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionItem;








