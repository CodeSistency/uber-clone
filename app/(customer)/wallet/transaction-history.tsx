import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Modal } from 'react-native';
import { router } from 'expo-router';
import { 
  useWalletStore, 
  useWalletTransactions, 
  useWalletLoading 
} from '@/store/wallet';
import TransactionList from './components/TransactionList';
import { TransactionType, TransactionFilters } from '@/types/wallet';

export default function TransactionHistoryScreen() {
  const { fetchTransactions } = useWalletStore();
  const transactions = useWalletTransactions();
  const isLoading = useWalletLoading();
  
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 20,
    type: 'all'
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  useEffect(() => {
    fetchTransactions(filters);
  }, [filters]);

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    fetchTransactions(filters);
  };

  const handleTransactionPress = (transaction: any) => {
    // Handle transaction press - could show details modal
    console.log('Transaction pressed:', transaction);
  };

  const handleTypeFilter = (type: TransactionType | 'all') => {
    setFilters(prev => ({ ...prev, type }));
    setShowTypeFilter(false);
  };

  const handleDateFilter = (dateRange: string) => {
    const today = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;

    switch (dateRange) {
      case 'today':
        startDate = today.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = monthAgo.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
        break;
      case 'all':
        startDate = undefined;
        endDate = undefined;
        break;
    }

    setFilters(prev => ({ 
      ...prev, 
      startDate, 
      endDate 
    }));
    setShowDateFilter(false);
  };

  const getTypeLabel = (type: TransactionType | 'all') => {
    switch (type) {
      case 'all': return 'All Types';
      case TransactionType.CREDIT: return 'Credits';
      case TransactionType.DEBIT: return 'Debits';
      case TransactionType.TRANSFER: return 'Transfers';
      case TransactionType.REFUND: return 'Refunds';
      default: return 'All Types';
    }
  };

  const getDateLabel = () => {
    if (filters.startDate && filters.endDate) {
      if (filters.startDate === filters.endDate) {
        return 'Today';
      }
      return `${filters.startDate} - ${filters.endDate}`;
    }
    return 'All Time';
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleBack} className="mr-4">
              <Text className="text-2xl">←</Text>
            </TouchableOpacity>
            <Text className="font-JakartaBold text-gray-800 text-xl">
              Transaction History
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View className="flex-row mt-4 space-x-3">
          <TouchableOpacity
            onPress={() => setShowDateFilter(true)}
            className="flex-1 bg-gray-100 rounded-lg px-4 py-3 flex-row items-center justify-between"
          >
            <Text className="font-JakartaMedium text-gray-700 text-sm">
              {getDateLabel()}
            </Text>
            <Text className="text-gray-500">📅</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowTypeFilter(true)}
            className="flex-1 bg-gray-100 rounded-lg px-4 py-3 flex-row items-center justify-between"
          >
            <Text className="font-JakartaMedium text-gray-700 text-sm">
              {getTypeLabel(filters.type || 'all')}
            </Text>
            <Text className="text-gray-500">🔽</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction List */}
      <View className="flex-1">
        <TransactionList
          transactions={transactions}
          onRefresh={handleRefresh}
          refreshing={isLoading}
          onTransactionPress={handleTransactionPress}
          showGrouping={true}
        />
      </View>

      {/* Date Filter Modal */}
      <Modal
        visible={showDateFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDateFilter(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl p-6">
            <Text className="font-JakartaBold text-gray-800 text-lg mb-4">
              Select Date Range
            </Text>
            
            {['today', 'week', 'month', 'all'].map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => handleDateFilter(range)}
                className="py-4 border-b border-gray-100"
              >
                <Text className="font-JakartaMedium text-gray-700 text-base capitalize">
                  {range === 'all' ? 'All Time' : range}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              onPress={() => setShowDateFilter(false)}
              className="mt-4 py-3 bg-gray-100 rounded-lg"
            >
              <Text className="font-JakartaBold text-gray-700 text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Type Filter Modal */}
      <Modal
        visible={showTypeFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypeFilter(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl p-6">
            <Text className="font-JakartaBold text-gray-800 text-lg mb-4">
              Filter by Type
            </Text>
            
            {['all', TransactionType.CREDIT, TransactionType.DEBIT, TransactionType.TRANSFER, TransactionType.REFUND].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => handleTypeFilter(type as TransactionType | 'all')}
                className="py-4 border-b border-gray-100"
              >
                <Text className="font-JakartaMedium text-gray-700 text-base">
                  {getTypeLabel(type as TransactionType | 'all')}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              onPress={() => setShowTypeFilter(false)}
              className="mt-4 py-3 bg-gray-100 rounded-lg"
            >
              <Text className="font-JakartaBold text-gray-700 text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}








