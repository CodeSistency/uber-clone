import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { 
  useWalletStore, 
  useWalletBalance, 
  useWalletTransactions, 
  useWalletLoading,
  useWalletError 
} from '@/store/wallet';
import WalletCard from './components/WalletCard';
import ActionButton from './components/ActionButton';
import TransactionList from './components/TransactionList';

// Icons (you can replace these with actual icon components)
const SendIcon = () => <Text className="text-2xl">💸</Text>;
const RequestIcon = () => <Text className="text-2xl">📤</Text>;
const TopUpIcon = () => <Text className="text-2xl">💳</Text>;
const MoreIcon = () => <Text className="text-2xl">⚙️</Text>;

export default function WalletScreen() {
  const { fetchWallet, refreshWallet } = useWalletStore();
  const balance = useWalletBalance();
  const transactions = useWalletTransactions();
  const isLoading = useWalletLoading();
  const error = useWalletError();

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleRefresh = () => {
    refreshWallet();
  };

  const handleSendMoney = () => {
    router.push('/(customer)/wallet/send-money');
  };

  const handleViewAllTransactions = () => {
    router.push('/(customer)/wallet/transaction-history');
  };

  const handleTransactionPress = (transaction: any) => {
    // Handle transaction press if needed
    console.log('Transaction pressed:', transaction);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#0286FF" />
      
      {/* Header */}
      <View className="bg-primary-500 pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white/80 font-JakartaMedium text-sm">
              Welcome back,
            </Text>
            <Text className="text-white font-JakartaBold text-xl">
              John Doe
            </Text>
          </View>
          <TouchableOpacity className="relative">
            <Text className="text-white text-2xl">🔔</Text>
            <View className="absolute -top-1 -right-1 bg-danger-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-JakartaBold">12</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row">
          <View className="bg-white/20 rounded-lg px-4 py-2 mr-2">
            <Text className="text-white font-JakartaSemiBold text-sm">Balance</Text>
          </View>
          <View className="bg-transparent rounded-lg px-4 py-2">
            <Text className="text-white/70 font-JakartaSemiBold text-sm">Wallet</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Wallet Card */}
        <View className="px-6 -mt-4 mb-6">
          <WalletCard 
            balance={balance}
            showDetails={true}
          />
        </View>

        {/* Action Buttons */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between">
            <ActionButton
              icon={SendIcon}
              label="Send to"
              variant="primary"
              onPress={handleSendMoney}
            />
            <ActionButton
              icon={RequestIcon}
              label="Request"
              variant="secondary"
              onPress={() => console.log('Request pressed')}
            />
            <ActionButton
              icon={TopUpIcon}
              label="Top up"
              variant="success"
              onPress={() => console.log('Top up pressed')}
            />
            <ActionButton
              icon={MoreIcon}
              label="More"
              variant="warning"
              onPress={() => console.log('More pressed')}
            />
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-JakartaBold text-gray-800 text-lg">
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={handleViewAllTransactions}>
              <Text className="font-JakartaSemiBold text-primary-500 text-sm">
                View all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Show only recent transactions (first 3) */}
          <TransactionList
            transactions={transactions.slice(0, 3)}
            onTransactionPress={handleTransactionPress}
            showGrouping={false}
            refreshing={isLoading}
            onRefresh={handleRefresh}
          />
        </View>

        {/* Error State */}
        {error && (
          <View className="px-6 mb-6">
            <View className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <Text className="text-danger-600 font-JakartaMedium text-sm">
                {error}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}




