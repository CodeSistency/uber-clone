import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

// Dummy wallet data
const DUMMY_WALLET = {
  balance: 25.50,
  currency: 'USD'
};

const DUMMY_TRANSACTIONS = [
  {
    id: 'TXN_001',
    type: 'credit',
    amount: 50.00,
    description: 'Wallet top-up',
    date: '2024-01-15',
    time: '14:30'
  },
  {
    id: 'TXN_002',
    type: 'debit',
    amount: 18.50,
    description: 'Ride payment - Downtown to Uptown',
    date: '2024-01-15',
    time: '13:45'
  },
  {
    id: 'TXN_003',
    type: 'debit',
    amount: 22.75,
    description: 'Food delivery - Mario\'s Pizza',
    date: '2024-01-14',
    time: '19:20'
  },
  {
    id: 'TXN_004',
    type: 'credit',
    amount: 25.00,
    description: 'Referral bonus',
    date: '2024-01-14',
    time: '12:00'
  },
  {
    id: 'TXN_005',
    type: 'debit',
    amount: 15.25,
    description: 'Ride payment - Midtown to Downtown',
    date: '2024-01-13',
    time: '11:15'
  }
];

const Wallet = () => {
  const [wallet] = useState(DUMMY_WALLET);
  const [transactions] = useState(DUMMY_TRANSACTIONS);

  const handleAddFunds = () => {
    Alert.alert('Add Funds', 'Add funds functionality would open payment screen');
  };

  const handleWithdraw = () => {
    Alert.alert('Withdraw Funds', 'Withdraw functionality would open bank details screen');
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? '💰' : '💳';
  };

  const getAmountColor = (type: string) => {
    return type === 'credit' ? 'text-success-500' : 'text-danger-500';
  };

  const getAmountPrefix = (type: string) => {
    return type === 'credit' ? '+' : '-';
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Wallet</Text>
        <Text className="text-secondary-600 mt-1">
          Manage your funds and payment history
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Balance Card */}
        <View className="bg-primary-500 rounded-lg p-6 mb-6">
          <Text className="text-white text-secondary-600 mb-2">Current Balance</Text>
          <Text className="text-white text-4xl font-JakartaExtraBold mb-4">
            ${wallet.balance.toFixed(2)}
          </Text>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={handleAddFunds}
              className="flex-1 bg-white rounded-full py-3 items-center"
            >
              <Text className="text-primary-500 font-JakartaBold">Add Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleWithdraw}
              className="flex-1 bg-white/20 rounded-full py-3 items-center border border-white/30"
            >
              <Text className="text-white font-JakartaBold">Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Quick Actions</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity className="flex-1 bg-general-500 rounded-lg p-4 items-center">
              <Text className="text-2xl mb-2">💳</Text>
              <Text className="font-JakartaBold">Add Card</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-general-500 rounded-lg p-4 items-center">
              <Text className="text-2xl mb-2">🏦</Text>
              <Text className="font-JakartaBold">Bank Account</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-general-500 rounded-lg p-4 items-center">
              <Text className="text-2xl mb-2">🎁</Text>
              <Text className="font-JakartaBold">Promo Codes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History */}
        <View className="bg-white rounded-lg p-4 mb-8">
          <Text className="text-lg font-JakartaBold mb-3">Recent Transactions</Text>

          {transactions.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-4xl mb-3">💳</Text>
              <Text className="text-secondary-600 text-center">
                No transactions yet
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <View key={transaction.id} className="flex-row items-center py-3 border-b border-general-500 last:border-b-0">
                <Text className="text-2xl mr-3">{getTransactionIcon(transaction.type)}</Text>
                <View className="flex-1">
                  <Text className="font-JakartaBold">{transaction.description}</Text>
                  <Text className="text-secondary-600 text-sm">
                    {transaction.date} • {transaction.time}
                  </Text>
                </View>
                <Text className={`font-JakartaExtraBold text-lg ${getAmountColor(transaction.type)}`}>
                  {getAmountPrefix(transaction.type)}${transaction.amount.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Wallet Stats */}
        <View className="bg-white rounded-lg p-4 mb-8">
          <Text className="text-lg font-JakartaBold mb-3">This Month</Text>

          <View className="grid grid-cols-2 gap-4">
            <View className="items-center p-4 bg-success-50 rounded-lg">
              <Text className="text-2xl font-JakartaExtraBold text-success-500">
                $285.25
              </Text>
              <Text className="text-sm text-secondary-600">Money In</Text>
            </View>

            <View className="items-center p-4 bg-danger-50 rounded-lg">
              <Text className="text-2xl font-JakartaExtraBold text-danger-500">
                $142.50
              </Text>
              <Text className="text-sm text-secondary-600">Money Out</Text>
            </View>
          </View>

          <View className="mt-4 p-3 bg-general-500 rounded-lg">
            <Text className="font-JakartaBold text-center text-primary-500">
              Net: +$142.75 this month
            </Text>
          </View>
        </View>

        {/* Security Notice */}
        <View className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-8">
          <View className="flex-row items-center mb-2">
            <Text className="text-2xl mr-2">🔒</Text>
            <Text className="font-JakartaBold text-warning-700">Secure & Protected</Text>
          </View>
          <Text className="text-warning-700 text-sm">
            Your wallet is protected by bank-level security. All transactions are encrypted and monitored.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Wallet;
