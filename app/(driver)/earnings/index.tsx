import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  earningsService,
  EarningsSummary,
  TripEarning,
  Promotion,
  Challenge,
} from "@/app/services/earningsService";
import { useUI } from "@/components/UIWrapper";
import { useEarningsStore } from "@/store";

// Dummy data for development
const dummyEarningsSummary: EarningsSummary = {
  today: {
    rides: 12,
    earnings: 144.5,
    hours: 8.5,
    averagePerRide: 12.04,
  },
  week: {
    rides: 67,
    earnings: 892.3,
    hours: 45.2,
    averagePerRide: 13.32,
  },
  month: {
    rides: 234,
    earnings: 3245.8,
    hours: 156.7,
    averagePerRide: 13.87,
  },
  total: {
    rides: 1234,
    earnings: 18765.4,
    hours: 987.3,
    averagePerRide: 15.21,
  },
};

const dummyTripHistory: TripEarning[] = [
  {
    id: "1",
    date: new Date(),
    passengerName: "John Doe",
    pickupLocation: "123 Main St",
    dropoffLocation: "456 Oak Ave",
    fare: 12.5,
    tip: 3.0,
    bonus: 0,
    total: 15.5,
    duration: 18,
    distance: 4.2,
    serviceType: "UberX",
    rating: 5,
  },
  {
    id: "2",
    date: new Date(Date.now() - 3600000),
    passengerName: "Jane Smith",
    pickupLocation: "789 Pine St",
    dropoffLocation: "321 Elm St",
    fare: 8.75,
    tip: 2.25,
    bonus: 5.0,
    total: 16.0,
    duration: 12,
    distance: 2.8,
    serviceType: "UberX",
    rating: 4,
  },
];

const dummyPromotions: Promotion[] = [
  {
    id: "1",
    name: "Weekend Warrior",
    description: "Complete 20 rides this weekend",
    type: "bonus",
    value: 50,
    target: 20,
    progress: 12,
    startDate: new Date(),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    isActive: true,
    requirements: ["Complete 20 rides", "Drive during weekend hours"],
    reward: "$50 bonus",
  },
  {
    id: "2",
    name: "Downtown Surge",
    description: "2.5x earnings in downtown area",
    type: "multiplier",
    value: 2.5,
    target: 0,
    progress: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 6 * 60 * 60 * 1000),
    isActive: true,
    requirements: ["Drive in downtown area", "During peak hours"],
    reward: "2.5x multiplier",
  },
];

const dummyChallenges: Challenge[] = [
  {
    id: "1",
    name: "Ride Streak",
    description: "Complete 5 rides in a row",
    target: 5,
    progress: 3,
    reward: 25,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    isActive: true,
    category: "rides",
  },
];

const EarningsScreen = () => {
  const { theme } = useUI();
  const { dailyEarnings, weeklyEarnings, monthlyEarnings, isLoading, error } =
    useEarningsStore();

  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month" | "total"
  >("today");
  const [refreshing, setRefreshing] = useState(false);
  const [earningsData, setEarningsData] =
    useState<EarningsSummary>(dummyEarningsSummary);
  const [tripHistory, setTripHistory] =
    useState<TripEarning[]>(dummyTripHistory);
  const [promotions, setPromotions] = useState<Promotion[]>(dummyPromotions);
  const [challenges, setChallenges] = useState<Challenge[]>(dummyChallenges);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In real implementation, fetch from API
    } catch (error) {
      console.error("Error refreshing earnings:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getCurrentEarnings = () => {
    switch (selectedPeriod) {
      case "today":
        return {
          rides: dailyEarnings?.totalRides || 0,
          earnings: dailyEarnings?.totalEarnings || 0,
          hours: (dailyEarnings?.totalTime || 0) / 60,
          averagePerRide: dailyEarnings
            ? dailyEarnings.totalEarnings / dailyEarnings.totalRides
            : 0,
        };
      case "week":
        return {
          rides: weeklyEarnings?.totalRides || 0,
          earnings: weeklyEarnings?.totalEarnings || 0,
          hours: (weeklyEarnings?.totalTime || 0) / 60,
          averagePerRide: weeklyEarnings
            ? weeklyEarnings.totalEarnings / weeklyEarnings.totalRides
            : 0,
        };
      case "month":
        return {
          rides: monthlyEarnings?.totalRides || 0,
          earnings: monthlyEarnings?.totalEarnings || 0,
          hours: (monthlyEarnings?.totalTime || 0) / 60,
          averagePerRide: monthlyEarnings
            ? monthlyEarnings.totalEarnings / monthlyEarnings.totalRides
            : 0,
        };
      default:
        return earningsData.total;
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const renderEarningsCard = () => {
    const current = getCurrentEarnings();

    return (
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mx-4 mb-4 shadow-lg">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-JakartaBold text-black dark:text-white">
            {formatCurrency(current.earnings)}
          </Text>
          <View className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
            <Text className="text-green-800 dark:text-green-200 font-JakartaBold text-sm">
              +{formatCurrency(current.earnings * 0.1)}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-3xl font-JakartaBold text-black dark:text-white">
              {current.rides}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 font-JakartaMedium">
              Rides
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-3xl font-JakartaBold text-black dark:text-white">
              {formatTime(current.hours)}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 font-JakartaMedium">
              Hours
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-3xl font-JakartaBold text-black dark:text-white">
              {formatCurrency(current.averagePerRide)}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 font-JakartaMedium">
              Avg/Ride
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPeriodSelector = () => (
    <View className="flex-row mx-4 mb-4 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
      {(["today", "week", "month", "total"] as const).map((period) => (
        <TouchableOpacity
          key={period}
          onPress={() => setSelectedPeriod(period)}
          className={`flex-1 py-2 rounded-lg ${
            selectedPeriod === period
              ? "bg-white dark:bg-gray-600 shadow-sm"
              : "bg-transparent"
          }`}
        >
          <Text
            className={`text-center font-JakartaBold capitalize ${
              selectedPeriod === period
                ? "text-black dark:text-white"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {period}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTripHistory = () => (
    <View className="mx-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-JakartaBold text-black dark:text-white">
          Recent Trips
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(driver)/earnings/history" as any)}
        >
          <Text className="text-brand-primary font-JakartaBold">View All</Text>
        </TouchableOpacity>
      </View>

      {tripHistory.map((trip) => (
        <View
          key={trip.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-JakartaBold text-black dark:text-white">
              {trip.passengerName}
            </Text>
            <Text className="text-lg font-JakartaBold text-green-600">
              {formatCurrency(trip.total)}
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              📍 {trip.pickupLocation}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              📍 {trip.dropoffLocation}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-yellow-500 mr-1">⭐</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                {trip.rating}
              </Text>
            </View>
          </View>

          {trip.bonus > 0 && (
            <View className="mt-2 bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded-full self-start">
              <Text className="text-yellow-800 dark:text-yellow-200 font-JakartaBold text-xs">
                +{formatCurrency(trip.bonus)} bonus
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderPromotions = () => (
    <View className="mx-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-JakartaBold text-black dark:text-white">
          Active Promotions
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(driver)/earnings/promotions" as any)}
        >
          <Text className="text-brand-primary font-JakartaBold">View All</Text>
        </TouchableOpacity>
      </View>

      {promotions.map((promotion) => (
        <View
          key={promotion.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-JakartaBold text-black dark:text-white">
              {promotion.name}
            </Text>
            <View className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
              <Text className="text-green-800 dark:text-green-200 font-JakartaBold text-xs">
                {promotion.reward}
              </Text>
            </View>
          </View>

          <Text className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            {promotion.description}
          </Text>

          <View className="mb-2">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Progress
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                {promotion.progress}/{promotion.target}
              </Text>
            </View>
            <View className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <View
                className="bg-brand-primary rounded-full h-2"
                style={{
                  width: `${(promotion.progress / promotion.target) * 100}%`,
                }}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderChallenges = () => (
    <View className="mx-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-JakartaBold text-black dark:text-white">
          Challenges
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(driver)/earnings/challenges" as any)}
        >
          <Text className="text-brand-primary font-JakartaBold">View All</Text>
        </TouchableOpacity>
      </View>

      {challenges.map((challenge) => (
        <View
          key={challenge.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-JakartaBold text-black dark:text-white">
              {challenge.name}
            </Text>
            <Text className="text-lg font-JakartaBold text-green-600">
              {formatCurrency(challenge.reward)}
            </Text>
          </View>

          <Text className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            {challenge.description}
          </Text>

          <View className="mb-2">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Progress
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                {challenge.progress}/{challenge.target}
              </Text>
            </View>
            <View className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <View
                className="bg-blue-500 rounded-full h-2"
                style={{
                  width: `${(challenge.progress / challenge.target) * 100}%`,
                }}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">
        Quick Actions
      </Text>

      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={() => router.push("/(driver)/earnings/instant-pay" as any)}
          className="flex-1 bg-green-500 rounded-xl p-4 items-center"
        >
          <Text className="text-white text-2xl mb-1">💳</Text>
          <Text className="text-white font-JakartaBold">Instant Pay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(driver)/earnings/analytics" as any)}
          className="flex-1 bg-blue-500 rounded-xl p-4 items-center"
        >
          <Text className="text-white text-2xl mb-1">📊</Text>
          <Text className="text-white font-JakartaBold">Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(driver)/earnings/settings" as any)}
          className="flex-1 bg-gray-500 rounded-xl p-4 items-center"
        >
          <Text className="text-white text-2xl mb-1">⚙️</Text>
          <Text className="text-white font-JakartaBold">Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-JakartaBold text-black dark:text-white">
          Earnings
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(driver)/earnings/settings" as any)}
        >
          <Text className="text-2xl">⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {renderPeriodSelector()}
        {renderEarningsCard()}
        {renderQuickActions()}
        {renderTripHistory()}
        {renderPromotions()}
        {renderChallenges()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EarningsScreen;
