import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface EarningsData {
  todayEarnings: number;
  todayTrips: number;
  currentTripEarnings: number;
  totalEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  rating: number;
  onlineHours: number;
}

interface EarningsTrackerProps {
  isVisible: boolean;
  earnings: EarningsData;
  currentRide?: {
    id: string;
    fare: number;
    distance: number;
    duration: number;
  } | null;
}

const EarningsTracker: React.FC<EarningsTrackerProps> = ({
  isVisible,
  earnings,
  currentRide,
}) => {
  const [animatedEarnings, setAnimatedEarnings] = useState(
    earnings.todayEarnings,
  );

  useEffect(() => {
    setAnimatedEarnings(earnings.todayEarnings);
  }, [earnings.todayEarnings]);

  if (!isVisible) return null;

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatTime = (hours: number) => `${hours.toFixed(1)}h`;

  return (
    <SafeAreaView className="bg-white border-t border-gray-200">
      <ScrollView className="max-h-80">
        {/* Today's Summary */}
        <View className="p-4 border-b border-gray-100">
          <Text className="text-lg font-JakartaBold mb-3">
            Today's Earnings
          </Text>
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center">
              <Text className="text-2xl mr-2">💰</Text>
              <View>
                <Text className="text-2xl font-JakartaExtraBold text-success-500">
                  {formatCurrency(animatedEarnings)}
                </Text>
                <Text className="text-sm text-secondary-600">
                  Total Earnings
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-lg font-JakartaBold">
                {earnings.todayTrips}
              </Text>
              <Text className="text-sm text-secondary-600">Trips</Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-2">
            <View className="items-center">
              <Text className="text-sm text-secondary-600">Rating</Text>
              <View className="flex-row items-center">
                <Text className="text-yellow-500 mr-1">⭐</Text>
                <Text className="font-JakartaBold">{earnings.rating}</Text>
              </View>
            </View>
            <View className="items-center">
              <Text className="text-sm text-secondary-600">Online</Text>
              <Text className="font-JakartaBold">
                {formatTime(earnings.onlineHours)}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-sm text-secondary-600">Avg/Trip</Text>
              <Text className="font-JakartaBold">
                {earnings.todayTrips > 0
                  ? formatCurrency(earnings.todayEarnings / earnings.todayTrips)
                  : "$0.00"}
              </Text>
            </View>
          </View>
        </View>

        {/* Current Trip Earnings */}
        {currentRide && (
          <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-JakartaBold mb-3">Current Trip</Text>
            <View className="bg-primary-500/10 rounded-lg p-3">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-JakartaBold">
                  Trip #{currentRide.id.slice(-4)}
                </Text>
                <Text className="text-lg font-JakartaExtraBold text-primary-500">
                  {formatCurrency(currentRide.fare)}
                </Text>
              </View>
              <View className="flex-row justify-between text-sm">
                <Text className="text-secondary-600">
                  {currentRide.distance} mi • {currentRide.duration} min
                </Text>
                <Text className="text-secondary-600">
                  +{formatCurrency(currentRide.fare)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Weekly Summary */}
        <View className="p-4">
          <Text className="text-lg font-JakartaBold mb-3">This Week</Text>

          {/* Weekly Stats */}
          <View className="flex-row justify-between mb-3">
            <View className="items-center">
              <Text className="text-2xl font-JakartaExtraBold text-primary-500">
                {formatCurrency(earnings.weeklyEarnings)}
              </Text>
              <Text className="text-sm text-secondary-600">Weekly Total</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-JakartaExtraBold text-success-500">
                {Math.round(earnings.weeklyEarnings / 7)}
              </Text>
              <Text className="text-sm text-secondary-600">Daily Avg</Text>
            </View>
          </View>

          {/* Daily Breakdown */}
          <View className="space-y-2">
            <Text className="font-JakartaBold mb-2">Daily Breakdown</Text>
            {[
              { day: "Mon", earnings: 145.75, trips: 12 },
              { day: "Tue", earnings: 167.5, trips: 14 },
              { day: "Wed", earnings: 134.25, trips: 11 },
              { day: "Thu", earnings: 189.0, trips: 15 },
              { day: "Fri", earnings: 156.8, trips: 13 },
              { day: "Sat", earnings: 201.3, trips: 16 },
              { day: "Sun", earnings: 98.4, trips: 8 },
            ].map((dayData) => (
              <View
                key={dayData.day}
                className="flex-row justify-between items-center"
              >
                <Text className="font-JakartaMedium w-12">{dayData.day}</Text>
                <View className="flex-1 mx-2">
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
                    {dayData.trips} trips
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

export default EarningsTracker;
