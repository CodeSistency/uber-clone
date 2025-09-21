import { useRef, useEffect, useState } from "react";
import { View, Text, Animated } from "react-native";

interface AnimatedEarningsCardProps {
  earnings: number;
  rides: number;
  hours: number;
  averagePerRide: number;
  isVisible: boolean;
  delay?: number;
}

const AnimatedEarningsCard = ({
  earnings,
  rides,
  hours,
  averagePerRide,
  isVisible,
  delay = 0,
}: AnimatedEarningsCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [earningsValue, setEarningsValue] = useState(0);
  const [ridesValue, setRidesValue] = useState(0);
  const [hoursValue, setHoursValue] = useState(0);
  const [avgValue, setAvgValue] = useState(0);

  const earningsAnim = useRef(new Animated.Value(0)).current;
  const ridesAnim = useRef(new Animated.Value(0)).current;
  const hoursAnim = useRef(new Animated.Value(0)).current;
  const avgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Card entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay,
          useNativeDriver: true,
        }),
      ]).start();

      // Number counting animations
      const startCounting = () => {
        // Add listeners to update state values
        earningsAnim.addListener(({ value }) => setEarningsValue(value));
        ridesAnim.addListener(({ value }) => setRidesValue(value));
        hoursAnim.addListener(({ value }) => setHoursValue(value));
        avgAnim.addListener(({ value }) => setAvgValue(value));

        Animated.parallel([
          Animated.timing(earningsAnim, {
            toValue: earnings,
            duration: 1500,
            delay: delay + 200,
            useNativeDriver: false,
          }),
          Animated.timing(ridesAnim, {
            toValue: rides,
            duration: 1200,
            delay: delay + 300,
            useNativeDriver: false,
          }),
          Animated.timing(hoursAnim, {
            toValue: hours,
            duration: 1000,
            delay: delay + 400,
            useNativeDriver: false,
          }),
          Animated.timing(avgAnim, {
            toValue: averagePerRide,
            duration: 1000,
            delay: delay + 500,
            useNativeDriver: false,
          }),
        ]).start();
      };

      setTimeout(startCounting, delay + 200);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    isVisible,
    delay,
    fadeAnim,
    slideAnim,
    scaleAnim,
    earningsAnim,
    ridesAnim,
    hoursAnim,
    avgAnim,
    earnings,
    rides,
    hours,
    averagePerRide,
  ]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <Animated.View
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 mx-4 mb-4 shadow-lg"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <Animated.Text
          className="text-2xl font-JakartaBold text-black dark:text-white"
          style={{
            opacity: earningsAnim.interpolate({
              inputRange: [0, earnings],
              outputRange: [0, 1],
            }),
          }}
        >
          {earningsValue > 0 ? formatCurrency(earningsValue) : "$0.00"}
        </Animated.Text>
        <View className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
          <Text className="text-green-800 dark:text-green-200 font-JakartaBold text-sm">
            +{formatCurrency(earnings * 0.1)}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        <View className="items-center">
          <Animated.Text
            className="text-3xl font-JakartaBold text-black dark:text-white"
            style={{
              opacity: ridesAnim.interpolate({
                inputRange: [0, rides],
                outputRange: [0, 1],
              }),
            }}
          >
            {ridesValue > 0 ? Math.round(ridesValue) : 0}
          </Animated.Text>
          <Text className="text-gray-600 dark:text-gray-400 font-JakartaMedium">
            Rides
          </Text>
        </View>

        <View className="items-center">
          <Animated.Text
            className="text-3xl font-JakartaBold text-black dark:text-white"
            style={{
              opacity: hoursAnim.interpolate({
                inputRange: [0, hours],
                outputRange: [0, 1],
              }),
            }}
          >
            {hoursValue > 0 ? formatTime(hoursValue) : "0h 0m"}
          </Animated.Text>
          <Text className="text-gray-600 dark:text-gray-400 font-JakartaMedium">
            Hours
          </Text>
        </View>

        <View className="items-center">
          <Animated.Text
            className="text-3xl font-JakartaBold text-black dark:text-white"
            style={{
              opacity: avgAnim.interpolate({
                inputRange: [0, averagePerRide],
                outputRange: [0, 1],
              }),
            }}
          >
            {avgValue > 0 ? formatCurrency(avgValue) : "$0.00"}
          </Animated.Text>
          <Text className="text-gray-600 dark:text-gray-400 font-JakartaMedium">
            Avg/Ride
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default AnimatedEarningsCard;
