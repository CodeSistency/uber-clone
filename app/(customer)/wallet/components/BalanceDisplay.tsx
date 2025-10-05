import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { useWalletBalance, useWalletCurrency } from '@/store/wallet';

interface BalanceDisplayProps {
  showChangeIndicator?: boolean;
  className?: string;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ 
  showChangeIndicator = true,
  className = '' 
}) => {
  const balance = useWalletBalance();
  const currency = useWalletCurrency();
  const [previousBalance, setPreviousBalance] = useState(balance);
  const [animatedValue] = useState(new Animated.Value(balance));

  useEffect(() => {
    // Animate balance change
    Animated.timing(animatedValue, {
      toValue: balance,
      duration: 500,
      useNativeDriver: false,
    }).start();

    setPreviousBalance(balance);
  }, [balance, animatedValue]);

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getChangeIndicator = () => {
    if (!showChangeIndicator || previousBalance === balance) return null;
    
    const isIncrease = balance > previousBalance;
    const changeAmount = Math.abs(balance - previousBalance);
    
    return (
      <View className={`flex-row items-center ml-2 ${
        isIncrease ? 'text-success-500' : 'text-danger-500'
      }`}>
        <Text className={`text-sm font-JakartaMedium ${
          isIncrease ? 'text-success-500' : 'text-danger-500'
        }`}>
          {isIncrease ? '↗' : '↘'} ${changeAmount.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View className={`flex-row items-center ${className}`}>
      <Animated.Text 
        className="text-white font-JakartaExtraBold text-3xl"
        style={{
          transform: [{
            scale: animatedValue.interpolate({
              inputRange: [0, 1000],
              outputRange: [0.8, 1.2],
              extrapolate: 'clamp',
            })
          }]
        }}
      >
        {formatBalance(balance)}
      </Animated.Text>
      {getChangeIndicator()}
    </View>
  );
};

export default BalanceDisplay;




