import React, { useMemo } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { Transaction, TransactionType } from '@/types/wallet';
import TransactionItem from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onTransactionPress?: (transaction: Transaction) => void;
  showGrouping?: boolean;
  className?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onRefresh,
  refreshing = false,
  onTransactionPress,
  showGrouping = true,
  className = ''
}) => {
  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    if (!showGrouping) {
      return [{ date: 'All', transactions }];
    }

    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const dateKey = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, transactions]) => ({ date, transactions }));
  }, [transactions, showGrouping]);

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={() => onTransactionPress?.(item)}
      showAvatar={true}
    />
  );

  const renderGroup = ({ item }: { item: { date: string; transactions: Transaction[] } }) => (
    <View className="mb-4">
      <Text className="font-JakartaSemiBold text-gray-600 text-sm mb-3 px-4">
        {item.date}
      </Text>
      {item.transactions.map((transaction, index) => (
        <TransactionItem
          key={`${transaction.id}-${index}`}
          transaction={transaction}
          onPress={() => onTransactionPress?.(transaction)}
          showAvatar={true}
          className="mx-4"
        />
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-6xl mb-4">💳</Text>
      <Text className="font-JakartaSemiBold text-gray-600 text-lg mb-2">
        No Transactions Yet
      </Text>
      <Text className="font-JakartaMedium text-gray-400 text-sm text-center px-8">
        Your transaction history will appear here once you start using your wallet.
      </Text>
    </View>
  );

  if (showGrouping) {
    return (
      <View className={`flex-1 ${className}`}>
        <FlatList
          data={groupedTransactions}
          renderItem={renderGroup}
          keyExtractor={(item, index) => `${item.date}-${index}`}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#0286FF']}
                tintColor="#0286FF"
              />
            ) : undefined
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${className}`}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0286FF']}
              tintColor="#0286FF"
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={renderEmptyState}
        getItemLayout={(data, index) => ({
          length: 80, // Approximate item height
          offset: 80 * index,
          index,
        })}
      />
    </View>
  );
};

export default TransactionList;




