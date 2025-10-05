import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { WalletCardProps } from '@/types/wallet';
import { useFormattedBalance } from '@/store/wallet';

const WalletCard: React.FC<WalletCardProps> = ({ 
  balance, 
  currency = 'USD', 
  showDetails = true, 
  className = '' 
}) => {
  const formattedBalance = useFormattedBalance();

  return (
    <View className={`bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white/80 font-JakartaMedium text-sm">
          Total Balance
        </Text>
        <View className="w-2 h-2 bg-white/30 rounded-full" />
      </View>

      {/* Balance Display */}
      <View className="mb-4">
        <Text className="text-white font-JakartaExtraBold text-3xl mb-1">
          {formattedBalance}
        </Text>
        {showDetails && (
          <Text className="text-white/70 font-JakartaMedium text-sm">
            Available Balance
          </Text>
        )}
      </View>

      {/* Wave Pattern Decoration */}
      <View className="absolute bottom-0 right-0 w-20 h-20 opacity-10">
        <View className="w-full h-full bg-white rounded-full" />
      </View>
    </View>
  );
};

export default WalletCard;




