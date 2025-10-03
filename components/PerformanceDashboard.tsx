import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PerformanceData {
  weeklyEarnings: number;
  weeklyTrips: number;
  avgRating: number;
  onlineHours: number;
  bestDay: string;
  peakHours: string[];
  topPerformingHours: string[];
  recommendations: string[];
}

interface PerformanceDashboardProps {
  isVisible: boolean;
  performance: PerformanceData;
  onClose?: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isVisible,
  performance,
  onClose,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">(
    "week",
  );

  if (!isVisible) return null;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatTime = (hours: number) => `${hours.toFixed(1)}h`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-5 border-b border-gray-200">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-JakartaBold">
              Performance Analytics
            </Text>
            {onClose && (
              <TouchableOpacity onPress={onClose}>
                <Text className="text-xl">✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Period Selector */}
          <View className="flex-row bg-general-500 rounded-lg p-1">
            <TouchableOpacity
              onPress={() => setSelectedPeriod("week")}
              className={`flex-1 py-2 rounded-md items-center ${
                selectedPeriod === "week" ? "bg-white shadow-sm" : ""
              }`}
            >
              <Text
                className={`font-JakartaBold ${
                  selectedPeriod === "week"
                    ? "text-primary-500"
                    : "text-secondary-600"
                }`}
              >
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedPeriod("month")}
              className={`flex-1 py-2 rounded-md items-center ${
                selectedPeriod === "month" ? "bg-white shadow-sm" : ""
              }`}
            >
              <Text
                className={`font-JakartaBold ${
                  selectedPeriod === "month"
                    ? "text-primary-500"
                    : "text-secondary-600"
                }`}
              >
                This Month
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Key Metrics */}
        <View className="p-5 border-b border-gray-200">
          <Text className="text-lg font-JakartaBold mb-4">Key Metrics</Text>

          <View className="grid grid-cols-2 gap-4">
            <View className="bg-primary-500/10 rounded-lg p-4">
              <Text className="text-2xl font-JakartaExtraBold text-primary-500 mb-1">
                {formatCurrency(performance.weeklyEarnings)}
              </Text>
              <Text className="text-secondary-600 font-JakartaMedium">
                Total Earnings
              </Text>
            </View>

            <View className="bg-success-500/10 rounded-lg p-4">
              <Text className="text-2xl font-JakartaExtraBold text-success-500 mb-1">
                {performance.weeklyTrips}
              </Text>
              <Text className="text-secondary-600 font-JakartaMedium">
                Total Trips
              </Text>
            </View>

            <View className="bg-warning-500/10 rounded-lg p-4">
              <Text className="text-xl font-JakartaExtraBold text-warning-500 mb-1">
                ⭐ {performance.avgRating}
              </Text>
              <Text className="text-secondary-600 font-JakartaMedium">
                Average Rating
              </Text>
            </View>

            <View className="bg-secondary-500/10 rounded-lg p-4">
              <Text className="text-xl font-JakartaExtraBold text-secondary-700 mb-1">
                {formatTime(performance.onlineHours)}
              </Text>
              <Text className="text-secondary-600 font-JakartaMedium">
                Online Time
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Insights */}
        <View className="p-5 border-b border-gray-200">
          <Text className="text-lg font-JakartaBold mb-4">
            💡 Performance Insights
          </Text>

          <View className="space-y-4">
            <View className="bg-success-500/10 rounded-lg p-4">
              <Text className="font-JakartaBold text-success-700 mb-2">
                🏆 Best Performing Day
              </Text>
              <Text className="text-success-600">
                {performance.bestDay} - Highest earnings and most trips
              </Text>
            </View>

            <View className="bg-primary-500/10 rounded-lg p-4">
              <Text className="font-JakartaBold text-primary-700 mb-2">
                ⏰ Peak Hours
              </Text>
              <Text className="text-primary-600">
                Best performance between {performance.peakHours.join(" and ")}
              </Text>
            </View>

            <View className="bg-warning-500/10 rounded-lg p-4">
              <Text className="font-JakartaBold text-warning-700 mb-2">
                💵 Top Earning Hours
              </Text>
              <Text className="text-warning-600">
                Highest earnings from{" "}
                {performance.topPerformingHours.join(" to ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View className="p-5 border-b border-gray-200">
          <Text className="text-lg font-JakartaBold mb-4">
            🎯 Recommendations
          </Text>

          <View className="space-y-3">
            {performance.recommendations.map((recommendation, index) => (
              <View key={index} className="flex-row items-start">
                <Text className="text-primary-500 mr-3 mt-1">•</Text>
                <Text className="text-secondary-700 font-JakartaMedium flex-1">
                  {recommendation}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Breakdown */}
        <View className="p-5">
          <Text className="text-lg font-JakartaBold mb-4">
            📊 Weekly Breakdown
          </Text>

          <View className="space-y-3">
            {[
              { day: "Mon", earnings: 145.75, trips: 12, hours: 6.5 },
              { day: "Tue", earnings: 167.5, trips: 14, hours: 7.0 },
              { day: "Wed", earnings: 134.25, trips: 11, hours: 5.5 },
              { day: "Thu", earnings: 189.0, trips: 15, hours: 8.0 },
              { day: "Fri", earnings: 156.8, trips: 13, hours: 7.5 },
              { day: "Sat", earnings: 201.3, trips: 16, hours: 9.0 },
              { day: "Sun", earnings: 98.4, trips: 8, hours: 4.5 },
            ].map((dayData) => (
              <View
                key={dayData.day}
                className="flex-row items-center justify-between"
              >
                <View className="w-12">
                  <Text className="font-JakartaBold">{dayData.day}</Text>
                </View>

                <View className="flex-1 mx-4">
                  <View className="bg-gray-200 rounded-full h-2">
                    <View
                      className="bg-primary-500 h-2 rounded-full"
                      style={{
                        width: `${(dayData.earnings / 201.3) * 100}%`,
                      }}
                    />
                  </View>
                </View>

                <View className="items-end">
                  <Text className="font-JakartaBold">
                    {formatCurrency(dayData.earnings)}
                  </Text>
                  <Text className="text-sm text-secondary-600">
                    {dayData.trips} trips • {formatTime(dayData.hours)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PerformanceDashboard;
