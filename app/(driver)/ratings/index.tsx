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
  ratingsService,
  Rating,
  RatingSummary,
  PerformanceMetrics,
  Feedback,
} from "@/app/services/ratingsService";
import { useUI } from "@/components/UIWrapper";
import { useRatingsStore } from "@/store";

// Dummy data for development
const dummyRatingSummary: RatingSummary = {
  overallRating: 4.8,
  totalRatings: 1247,
  ratingDistribution: {
    five: 892,
    four: 234,
    three: 89,
    two: 23,
    one: 9,
  },
  categoryAverages: {
    driving: 4.9,
    cleanliness: 4.7,
    communication: 4.6,
    punctuality: 4.8,
    safety: 4.9,
  },
  recentTrend: "up",
  lastRatingDate: new Date(),
  averageRatingLastWeek: 4.7,
  averageRatingLastMonth: 4.6,
};

const dummyRecentRatings: Rating[] = [
  {
    id: "1",
    rideId: "ride_123",
    passengerId: "passenger_456",
    passengerName: "John Doe",
    rating: 5,
    comment: "Excellent driver! Very professional and friendly.",
    timestamp: new Date(),
    categories: {
      driving: 5,
      cleanliness: 5,
      communication: 5,
      punctuality: 5,
      safety: 5,
    },
    tags: ["professional", "friendly", "clean"],
    isPublic: true,
  },
  {
    id: "2",
    rideId: "ride_124",
    passengerId: "passenger_789",
    passengerName: "Jane Smith",
    rating: 4,
    comment: "Good ride, arrived on time.",
    timestamp: new Date(Date.now() - 3600000),
    categories: {
      driving: 4,
      cleanliness: 4,
      communication: 4,
      punctuality: 5,
      safety: 4,
    },
    tags: ["punctual"],
    isPublic: true,
  },
];

const dummyPerformanceMetrics: PerformanceMetrics = {
  acceptanceRate: 95.2,
  cancellationRate: 2.1,
  completionRate: 98.7,
  onTimeRate: 94.5,
  responseTime: 12.3,
  customerSatisfaction: 4.8,
  safetyScore: 4.9,
  cleanlinessScore: 4.7,
  communicationScore: 4.6,
  drivingScore: 4.9,
  punctualityScore: 4.8,
};

const dummyFeedback: Feedback[] = [
  {
    id: "1",
    rideId: "ride_125",
    passengerId: "passenger_101",
    passengerName: "Mike Johnson",
    type: "compliment",
    category: "service",
    message: "Great conversation during the ride!",
    timestamp: new Date(Date.now() - 7200000),
    status: "new",
    priority: "low",
  },
];

const RatingsScreen = () => {
  const { theme } = useUI();
  const {
    overallRating,
    totalRatings,
    ratingBreakdown,
    performanceMetrics,
    supportTickets,
    isLoading,
    error,
  } = useRatingsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [ratingSummary, setRatingSummary] =
    useState<RatingSummary>(dummyRatingSummary);
  const [localRecentRatings, setLocalRecentRatings] =
    useState<Rating[]>(dummyRecentRatings);
  const [metrics, setMetrics] = useState<PerformanceMetrics>(
    dummyPerformanceMetrics,
  );
  const [feedback, setFeedback] = useState<Feedback[]>(dummyFeedback);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In real implementation, fetch from API
    } catch (error) {
      
    } finally {
      setRefreshing(false);
    }
  };

  const renderRatingOverview = () => (
    <View className="mx-4 mb-4">
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <View className="items-center mb-4">
          <Text className="text-5xl font-JakartaBold text-black dark:text-white mb-2">
            {ratingSummary.overallRating}
          </Text>
          <View className="flex-row items-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Text key={star} className="text-2xl text-yellow-500">
                {star <= Math.floor(ratingSummary.overallRating) ? "⭐" : "☆"}
              </Text>
            ))}
          </View>
          <Text className="text-gray-600 dark:text-gray-400 font-JakartaMedium">
            {ratingSummary.totalRatings} ratings
          </Text>
        </View>

        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-JakartaBold text-green-600">
              {ratingSummary.averageRatingLastWeek}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              This Week
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-JakartaBold text-blue-600">
              {ratingSummary.averageRatingLastMonth}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              This Month
            </Text>
          </View>
          <View className="items-center">
            <Text
              className={`text-2xl font-JakartaBold ${
                ratingSummary.recentTrend === "up"
                  ? "text-green-600"
                  : ratingSummary.recentTrend === "down"
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              {ratingSummary.recentTrend === "up"
                ? "↗️"
                : ratingSummary.recentTrend === "down"
                  ? "↘️"
                  : "→"}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Trend
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderRatingDistribution = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">
        Rating Distribution
      </Text>

      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        {[5, 4, 3, 2, 1].map((stars) => {
          const starKey =
            stars === 5
              ? "five"
              : stars === 4
                ? "four"
                : stars === 3
                  ? "three"
                  : stars === 2
                    ? "two"
                    : "one";
          const count =
            ratingSummary.ratingDistribution[
              starKey as keyof typeof ratingSummary.ratingDistribution
            ] ?? 0;
          const percentage = (count / ratingSummary.totalRatings) * 100;

          return (
            <View key={stars} className="flex-row items-center mb-2">
              <View className="flex-row items-center w-16">
                <Text className="text-gray-600 dark:text-gray-400 text-sm mr-1">
                  {stars}
                </Text>
                <Text className="text-yellow-500">⭐</Text>
              </View>
              <View className="flex-1 mx-3">
                <View className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <View
                    className="bg-yellow-500 rounded-full h-2"
                    style={{ width: `${percentage}%` }}
                  />
                </View>
              </View>
              <Text className="text-gray-600 dark:text-gray-400 text-sm w-12 text-right">
                {count}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderCategoryScores = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">
        Category Scores
      </Text>

      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        {Object.entries(ratingSummary.categoryAverages).map(
          ([category, score]) => (
            <View
              key={category}
              className="flex-row items-center justify-between mb-3 last:mb-0"
            >
              <Text className="font-JakartaBold text-black dark:text-white capitalize">
                {category}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-gray-600 dark:text-gray-400 mr-2">
                  {score}
                </Text>
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} className="text-sm text-yellow-500">
                      {star <= Math.floor(score) ? "⭐" : "☆"}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ),
        )}
      </View>
    </View>
  );

  const renderPerformanceMetrics = () => (
    <View className="mx-4 mb-4">
      <Text className="text-lg font-JakartaBold text-black dark:text-white mb-3">
        Performance Metrics
      </Text>

      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <View className="flex-row justify-between mb-3">
          <View className="items-center">
            <Text className="text-2xl font-JakartaBold text-green-600">
              {metrics.acceptanceRate}%
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Acceptance
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-JakartaBold text-blue-600">
              {metrics.completionRate}%
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Completion
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-JakartaBold text-purple-600">
              {metrics.onTimeRate}%
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              On Time
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-JakartaBold text-orange-600">
              {metrics.responseTime}s
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Response
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-JakartaBold text-red-600">
              {metrics.cancellationRate}%
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Cancellation
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-JakartaBold text-indigo-600">
              {metrics.customerSatisfaction}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Satisfaction
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderRecentRatings = () => (
    <View className="mx-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-JakartaBold text-black dark:text-white">
          Recent Ratings
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(driver)/ratings/history" as any)}
        >
          <Text className="text-brand-primary font-JakartaBold">View All</Text>
        </TouchableOpacity>
      </View>

      {localRecentRatings.map((rating) => (
        <View
          key={rating.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-JakartaBold text-black dark:text-white">
              {rating.passengerName}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-gray-600 dark:text-gray-400 mr-1">
                {rating.rating}
              </Text>
              <Text className="text-yellow-500">⭐</Text>
            </View>
          </View>

          {rating.comment && (
            <Text className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              "{rating.comment}"
            </Text>
          )}

          <View className="flex-row flex-wrap mb-2">
            {rating.tags.map((tag, index) => (
              <View
                key={index}
                className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full mr-2 mb-1"
              >
                <Text className="text-blue-800 dark:text-blue-200 font-JakartaBold text-xs">
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          <Text className="text-gray-500 dark:text-gray-500 text-xs">
            {rating.timestamp.toLocaleDateString()}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderFeedback = () => (
    <View className="mx-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-JakartaBold text-black dark:text-white">
          Recent Feedback
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(driver)/ratings/feedback" as any)}
        >
          <Text className="text-brand-primary font-JakartaBold">View All</Text>
        </TouchableOpacity>
      </View>

      {feedback.map((item) => (
        <View
          key={item.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-JakartaBold text-black dark:text-white">
              {item.passengerName}
            </Text>
            <View
              className={`px-2 py-1 rounded-full ${
                item.type === "compliment"
                  ? "bg-green-100 dark:bg-green-900"
                  : item.type === "complaint"
                    ? "bg-red-100 dark:bg-red-900"
                    : "bg-blue-100 dark:bg-blue-900"
              }`}
            >
              <Text
                className={`font-JakartaBold text-xs ${
                  item.type === "compliment"
                    ? "text-green-800 dark:text-green-200"
                    : item.type === "complaint"
                      ? "text-red-800 dark:text-red-200"
                      : "text-blue-800 dark:text-blue-200"
                }`}
              >
                {item.type}
              </Text>
            </View>
          </View>

          <Text className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            {item.message}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-gray-500 dark:text-gray-500 text-xs">
              {item.timestamp.toLocaleDateString()}
            </Text>
            <Text
              className={`font-JakartaBold text-xs ${
                item.status === "resolved"
                  ? "text-green-600"
                  : item.status === "acknowledged"
                    ? "text-yellow-600"
                    : "text-gray-600"
              }`}
            >
              {item.status}
            </Text>
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
          onPress={() => router.push("/(driver)/ratings/analytics" as any)}
          className="flex-1 bg-blue-500 rounded-xl p-4 items-center"
        >
          <Text className="text-white text-2xl mb-1">📊</Text>
          <Text className="text-white font-JakartaBold text-sm">Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(driver)/ratings/goals" as any)}
          className="flex-1 bg-green-500 rounded-xl p-4 items-center"
        >
          <Text className="text-white text-2xl mb-1">🎯</Text>
          <Text className="text-white font-JakartaBold text-sm">Goals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(driver)/ratings/support" as any)}
          className="flex-1 bg-gray-500 rounded-xl p-4 items-center"
        >
          <Text className="text-white text-2xl mb-1">🆘</Text>
          <Text className="text-white font-JakartaBold text-sm">Support</Text>
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
          Ratings & Performance
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(driver)/ratings/settings" as any)}
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
        {renderRatingOverview()}
        {renderRatingDistribution()}
        {renderCategoryScores()}
        {renderPerformanceMetrics()}
        {renderQuickActions()}
        {renderRecentRatings()}
        {renderFeedback()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RatingsScreen;
