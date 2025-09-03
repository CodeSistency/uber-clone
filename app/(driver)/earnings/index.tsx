import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy data for earnings
const DUMMY_EARNINGS = {
  today: {
    total: 45.75,
    trips: 3,
    hours: 6.5,
    tips: 8.5,
  },
  week: {
    total: 285.25,
    trips: 18,
    hours: 42.0,
    tips: 45.75,
  },
  month: {
    total: 1250.8,
    trips: 78,
    hours: 180.5,
    tips: 187.5,
  },
};

const DUMMY_TRIP_HISTORY = [
  {
    id: "TRIP_001",
    date: "2024-01-15",
    time: "14:30",
    fare: 18.5,
    tips: 3.0,
    distance: 3.2,
    rating: 4.9,
  },
  {
    id: "TRIP_002",
    date: "2024-01-15",
    time: "12:15",
    fare: 15.25,
    tips: 2.5,
    distance: 2.8,
    rating: 5.0,
  },
  {
    id: "TRIP_003",
    date: "2024-01-15",
    time: "09:45",
    fare: 12.0,
    tips: 3.0,
    distance: 1.9,
    rating: 4.7,
  },
];

const Earnings = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");

  const currentData = DUMMY_EARNINGS[selectedPeriod];
  const hourlyRate = currentData.total / currentData.hours;

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Earnings</Text>
        <Text className="text-secondary-600 mt-1">
          Track your income and performance
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Period Selector */}
        <View className="bg-white rounded-lg p-1 mb-4 flex-row">
          {[
            { key: "today", label: "Today" },
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              onPress={() => setSelectedPeriod(period.key as any)}
              className={`flex-1 py-2 px-4 rounded-md ${
                selectedPeriod === period.key
                  ? "bg-primary-500"
                  : "bg-transparent"
              }`}
            >
              <Text
                className={`text-center font-JakartaBold ${
                  selectedPeriod === period.key
                    ? "text-white"
                    : "text-secondary-600"
                }`}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Earnings Card */}
        <View className="bg-white rounded-lg p-6 mb-4">
          <Text className="text-lg font-JakartaBold mb-4">Total Earnings</Text>
          <Text className="text-4xl font-JakartaExtraBold text-primary-500 mb-6">
            ${currentData.total.toFixed(2)}
          </Text>

          <View className="flex-row justify-between mb-4">
            <View className="items-center">
              <Text className="text-2xl font-JakartaExtraBold text-success-500">
                {currentData.trips}
              </Text>
              <Text className="text-sm text-secondary-600">Trips</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-JakartaExtraBold text-primary-500">
                {currentData.hours.toFixed(1)}
              </Text>
              <Text className="text-sm text-secondary-600">Hours</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-JakartaExtraBold text-warning-500">
                ${hourlyRate.toFixed(2)}
              </Text>
              <Text className="text-sm text-secondary-600">/hour</Text>
            </View>
          </View>

          <View className="bg-general-500 rounded-lg p-3">
            <View className="flex-row justify-between">
              <Text className="font-JakartaMedium">Base Fare</Text>
              <Text className="font-JakartaBold">
                ${(currentData.total - currentData.tips).toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="font-JakartaMedium">Tips</Text>
              <Text className="font-JakartaBold text-success-500">
                +${currentData.tips.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Trip History */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Recent Trips</Text>

          {DUMMY_TRIP_HISTORY.map((trip) => (
            <View
              key={trip.id}
              className="border-b border-general-500 py-3 last:border-b-0"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-JakartaBold">
                  ${trip.fare.toFixed(2)}
                  {trip.tips > 0 && (
                    <Text className="text-success-500">
                      {" "}
                      +${trip.tips.toFixed(2)} tip
                    </Text>
                  )}
                </Text>
                <Text className="text-sm text-secondary-600">
                  {trip.date} • {trip.time}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Text className="text-sm text-secondary-600 mr-2">
                    {trip.distance} mi • ⭐ {trip.rating}
                  </Text>
                </View>
                <TouchableOpacity className="bg-primary-500 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-JakartaBold">
                    Details
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Weekly Goal Progress */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Weekly Goal</Text>
          <View className="bg-general-500 rounded-full h-3 mb-2">
            <View
              className="bg-success-500 h-3 rounded-full"
              style={{ width: "75%" }}
            />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-secondary-600">$285.25 earned</Text>
            <Text className="text-sm text-secondary-600">$350 goal</Text>
          </View>
          <Text className="text-sm text-success-500 mt-1">
            75% complete • $64.75 to go
          </Text>
        </View>

        {/* Payout Information */}
        <View className="bg-white rounded-lg p-4 mb-8">
          <Text className="text-lg font-JakartaBold mb-3">Next Payout</Text>
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="font-JakartaBold text-success-500">$285.25</Text>
              <Text className="text-sm text-secondary-600">
                Available to withdraw
              </Text>
            </View>
            <TouchableOpacity className="bg-primary-500 px-6 py-3 rounded-full">
              <Text className="text-white font-JakartaBold">Withdraw</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-secondary-600 mt-2">
            Payout processed every Monday • Bank account ending in ****1234
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Earnings;
