import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button, Card } from "@/components/ui";
import { useDriverEarningsStore } from "@/store/driverEarnings";
import { useUI } from "@/components/UIWrapper";

const DriverEarningsDashboard = () => {
  const {
    earningsSummary,
    tripHistory,
    promotions,
    challenges,
    isLoading,
    error,
    selectedPeriod,
    fetchEarningsSummary,
    fetchTripHistory,
    fetchPromotions,
    fetchChallenges,
    setSelectedPeriod,
    refreshEarnings,
  } = useDriverEarningsStore();

  const { showError } = useUI();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load initial data
    loadEarningsData();
  }, []);

  useEffect(() => {
    if (error) {
      showError("Error", error);
    }
  }, [error, showError]);

  const loadEarningsData = async () => {
    try {
      await Promise.all([
        fetchEarningsSummary(),
        fetchTripHistory(),
        fetchPromotions(),
        fetchChallenges(),
      ]);
    } catch (error) {
      console.error("Error loading earnings data:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshEarnings();
    } catch (error) {
      console.error("Error refreshing earnings:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePeriodChange = async (
    period: "today" | "week" | "month" | "total",
  ) => {
    setSelectedPeriod(period);
    // Refetch summary with new period
    await fetchEarningsSummary();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "total":
        return "Total";
      default:
        return "This Week";
    }
  };

  if (isLoading && !earningsSummary) {
    return (
      <SafeAreaView className="flex-1 bg-general-500 justify-center items-center">
        <Text className="text-lg">Loading earnings dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Earnings Dashboard</Text>
        <Text className="text-secondary-600 mt-1">
          Track your income and performance
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0286FF"]}
            tintColor="#0286FF"
          />
        }
      >
        <View className="py-6">
          {/* Period Selector */}
          <View className="flex-row mb-6 bg-white rounded-lg p-1">
            {["today", "week", "month", "total"].map((period) => (
              <Button
                key={period}
                title={period.charAt(0).toUpperCase() + period.slice(1)}
                onPress={() => handlePeriodChange(period as any)}
                className={`flex-1 ${selectedPeriod === period ? "bg-primary-500" : "bg-transparent"}`}
                variant={selectedPeriod === period ? "primary" : "outline"}
              />
            ))}
          </View>

          {/* Earnings Summary Cards */}
          {earningsSummary && (
            <View className="space-y-4 mb-6">
              {/* Main Earnings Card */}
              <Card className="bg-gradient-to-r from-success-500 to-success-600 border-0">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-white text-sm font-JakartaMedium">
                      {getPeriodLabel()} Earnings
                    </Text>
                    <Text className="text-white text-2xl font-JakartaExtraBold mt-1">
                      {formatCurrency(earningsSummary.totalEarnings)}
                    </Text>
                  </View>
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                    <Text className="text-white text-xl">💰</Text>
                  </View>
                </View>
              </Card>

              {/* Stats Grid */}
              <View className="flex-row space-x-4">
                <Card className="flex-1">
                  <View className="items-center">
                    <Text className="text-2xl font-JakartaBold text-primary-600">
                      {formatNumber(earningsSummary.totalTrips)}
                    </Text>
                    <Text className="text-xs text-secondary-600 font-JakartaMedium mt-1">
                      Trips
                    </Text>
                  </View>
                </Card>

                <Card className="flex-1">
                  <View className="items-center">
                    <Text className="text-2xl font-JakartaBold text-success-600">
                      {earningsSummary.averageRating?.toFixed(1) || "0.0"}
                    </Text>
                    <Text className="text-xs text-secondary-600 font-JakartaMedium mt-1">
                      Rating
                    </Text>
                  </View>
                </Card>

                <Card className="flex-1">
                  <View className="items-center">
                    <Text className="text-2xl font-JakartaBold text-warning-600">
                      {formatCurrency(earningsSummary.averagePerTrip)}
                    </Text>
                    <Text className="text-xs text-secondary-600 font-JakartaMedium mt-1">
                      Avg/Trip
                    </Text>
                  </View>
                </Card>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <Card className="mb-6">
            <Text className="text-lg font-JakartaBold mb-4">Quick Actions</Text>
            <View className="space-y-3">
              <Button
                title="View Trip History"
                onPress={() => router.push("/(driver)/earnings/trips" as any)}
                className="w-full"
                variant="outline"
              />
              <Button
                title="Payment Methods"
                onPress={() =>
                  router.push("/(driver)/earnings/payments" as any)
                }
                className="w-full"
                variant="outline"
              />
              <Button
                title="Request Instant Pay"
                onPress={() =>
                  router.push("/(driver)/earnings/instant-pay" as any)
                }
                className="w-full"
                variant="success"
              />
            </View>
          </Card>

          {/* Recent Trips */}
          <Card className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-JakartaBold">Recent Trips</Text>
              <Button
                title="View All"
                onPress={() => router.push("/(driver)/earnings/trips" as any)}
                variant="outline"
                className="px-3 py-1"
              />
            </View>

            {tripHistory && tripHistory.length > 0 ? (
              <View className="space-y-3">
                {tripHistory.slice(0, 3).map((trip, index) => (
                  <View
                    key={trip.id || index}
                    className="flex-row items-center justify-between py-3 border-b border-secondary-200 last:border-b-0"
                  >
                    <View className="flex-1">
                      <Text className="font-JakartaMedium text-sm">
                        {new Date(trip.date).toLocaleDateString()}
                      </Text>
                      <Text className="text-secondary-600 text-xs">
                        {trip.distance} • {trip.duration}
                      </Text>
                    </View>
                    <Text className="font-JakartaBold text-success-600">
                      {formatCurrency(trip.earnings)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="py-8 items-center">
                <Text className="text-secondary-600">No trips yet</Text>
              </View>
            )}
          </Card>

          {/* Active Promotions */}
          <Card className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-JakartaBold">
                Active Promotions
              </Text>
              <View className="bg-primary-100 px-2 py-1 rounded-full">
                <Text className="text-primary-700 text-xs font-JakartaBold">
                  {promotions?.length || 0}
                </Text>
              </View>
            </View>

            {promotions && promotions.length > 0 ? (
              <View className="space-y-3">
                {promotions.slice(0, 2).map((promo, index) => (
                  <View
                    key={promo.id || index}
                    className="bg-primary-50 p-3 rounded-lg"
                  >
                    <Text className="font-JakartaBold text-primary-700 text-sm">
                      {promo.title}
                    </Text>
                    <Text className="text-primary-600 text-xs mt-1">
                      {promo.description}
                    </Text>
                    <Text className="text-primary-700 font-JakartaBold text-xs mt-2">
                      Expires: {new Date(promo.expiresAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
                {promotions.length > 2 && (
                  <Button
                    title={`View ${promotions.length - 2} more promotions`}
                    onPress={() =>
                      router.push("/(driver)/earnings/promotions" as any)
                    }
                    variant="outline"
                    className="mt-2"
                  />
                )}
              </View>
            ) : (
              <View className="py-8 items-center">
                <Text className="text-secondary-600">No active promotions</Text>
              </View>
            )}
          </Card>

          {/* Active Challenges */}
          <Card className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-JakartaBold">
                Active Challenges
              </Text>
              <View className="bg-warning-100 px-2 py-1 rounded-full">
                <Text className="text-warning-700 text-xs font-JakartaBold">
                  {challenges?.length || 0}
                </Text>
              </View>
            </View>

            {challenges && challenges.length > 0 ? (
              <View className="space-y-3">
                {challenges.slice(0, 2).map((challenge, index) => (
                  <View
                    key={challenge.id || index}
                    className="bg-warning-50 p-3 rounded-lg"
                  >
                    <Text className="font-JakartaBold text-warning-700 text-sm">
                      {challenge.title}
                    </Text>
                    <Text className="text-warning-600 text-xs mt-1">
                      {challenge.description}
                    </Text>
                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-warning-700 text-xs">
                        Progress: {challenge.currentProgress}/{challenge.target}
                      </Text>
                      <Text className="text-warning-700 font-JakartaBold text-xs">
                        {formatCurrency(challenge.reward)}
                      </Text>
                    </View>
                  </View>
                ))}
                {challenges.length > 2 && (
                  <Button
                    title={`View ${challenges.length - 2} more challenges`}
                    onPress={() =>
                      router.push("/(driver)/earnings/challenges" as any)
                    }
                    variant="outline"
                    className="mt-2"
                  />
                )}
              </View>
            ) : (
              <View className="py-8 items-center">
                <Text className="text-secondary-600">No active challenges</Text>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverEarningsDashboard;
