import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy data for analytics
const DUMMY_ANALYTICS = {
  today: {
    revenue: 1250.75,
    orders: 47,
    avgOrderValue: 26.61,
    customers: 43,
  },
  week: {
    revenue: 8750.25,
    orders: 328,
    avgOrderValue: 26.68,
    customers: 289,
  },
  month: {
    revenue: 37500.8,
    orders: 1405,
    avgOrderValue: 26.69,
    customers: 1250,
  },
};

const DUMMY_POPULAR_ITEMS = [
  { name: "Margherita Pizza", sold: 145, revenue: 2465.55, trend: "+12%" },
  { name: "Pepperoni Pizza", sold: 128, revenue: 2430.72, trend: "+8%" },
  { name: "Vegetarian Pizza", sold: 98, revenue: 1663.02, trend: "+15%" },
  { name: "Spaghetti Carbonara", sold: 87, revenue: 1306.13, trend: "+5%" },
  { name: "Garlic Bread", sold: 76, revenue: 531.24, trend: "-3%" },
];

const DUMMY_HOURLY_DATA = [
  { hour: "11 AM", orders: 8 },
  { hour: "12 PM", orders: 15 },
  { hour: "1 PM", orders: 22 },
  { hour: "2 PM", orders: 18 },
  { hour: "3 PM", orders: 12 },
  { hour: "4 PM", orders: 10 },
  { hour: "5 PM", orders: 14 },
  { hour: "6 PM", orders: 28 },
  { hour: "7 PM", orders: 35 },
  { hour: "8 PM", orders: 25 },
  { hour: "9 PM", orders: 18 },
  { hour: "10 PM", orders: 12 },
];

const BusinessAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");

  const currentData = DUMMY_ANALYTICS[selectedPeriod];
  const maxHourlyOrders = Math.max(...DUMMY_HOURLY_DATA.map((h) => h.orders));

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Analytics & Insights</Text>
        <Text className="text-secondary-600 mt-1">
          Track your business performance
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

        {/* Key Metrics */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-4">Key Metrics</Text>

          <View className="grid grid-cols-2 gap-4 mb-4">
            <View className="items-center p-4 bg-primary-50 rounded-lg">
              <Text className="text-2xl font-JakartaExtraBold text-primary-500">
                ${currentData.revenue.toLocaleString()}
              </Text>
              <Text className="text-sm text-secondary-600">Revenue</Text>
            </View>

            <View className="items-center p-4 bg-success-50 rounded-lg">
              <Text className="text-2xl font-JakartaExtraBold text-success-500">
                {currentData.orders}
              </Text>
              <Text className="text-sm text-secondary-600">Orders</Text>
            </View>

            <View className="items-center p-4 bg-warning-50 rounded-lg">
              <Text className="text-2xl font-JakartaExtraBold text-warning-500">
                ${currentData.avgOrderValue}
              </Text>
              <Text className="text-sm text-secondary-600">Avg Order</Text>
            </View>

            <View className="items-center p-4 bg-secondary-100 rounded-lg">
              <Text className="text-2xl font-JakartaExtraBold text-secondary-700">
                {currentData.customers}
              </Text>
              <Text className="text-sm text-secondary-600">Customers</Text>
            </View>
          </View>

          {/* Growth Indicators */}
          <View className="bg-general-500 rounded-lg p-3">
            <Text className="text-sm font-JakartaBold mb-2">
              Performance vs Last Period
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-sm text-secondary-600">Revenue</Text>
              <Text className="text-sm font-JakartaBold text-success-500">
                +12.5%
              </Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-sm text-secondary-600">Orders</Text>
              <Text className="text-sm font-JakartaBold text-success-500">
                +8.3%
              </Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-sm text-secondary-600">Customers</Text>
              <Text className="text-sm font-JakartaBold text-success-500">
                +15.2%
              </Text>
            </View>
          </View>
        </View>

        {/* Hourly Order Distribution */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-4">
            Order Distribution by Hour
          </Text>

          <View className="space-y-2">
            {DUMMY_HOURLY_DATA.map((hourData) => (
              <View key={hourData.hour} className="flex-row items-center">
                <Text className="w-12 text-sm font-JakartaMedium">
                  {hourData.hour}
                </Text>
                <View className="flex-1 bg-general-500 rounded-full h-3 mx-3">
                  <View
                    className="bg-primary-500 h-3 rounded-full"
                    style={{
                      width: `${(hourData.orders / maxHourlyOrders) * 100}%`,
                    }}
                  />
                </View>
                <Text className="w-8 text-sm font-JakartaBold text-primary-500">
                  {hourData.orders}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Popular Items */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-4">Popular Items</Text>

          {DUMMY_POPULAR_ITEMS.map((item, index) => (
            <View
              key={item.name}
              className="flex-row items-center py-3 border-b border-general-500 last:border-b-0"
            >
              <Text className="w-6 text-sm text-secondary-600 font-JakartaBold">
                {index + 1}
              </Text>
              <View className="flex-1 ml-3">
                <Text className="font-JakartaBold">{item.name}</Text>
                <Text className="text-sm text-secondary-600">
                  {item.sold} sold • ${item.revenue.toFixed(2)} revenue
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className={`text-sm font-JakartaBold ${
                    item.trend.startsWith("+")
                      ? "text-success-500"
                      : "text-danger-500"
                  }`}
                >
                  {item.trend}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Customer Insights */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-4">
            Customer Insights
          </Text>

          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-JakartaBold">New Customers</Text>
                <Text className="text-sm text-secondary-600">This period</Text>
              </View>
              <Text className="text-xl font-JakartaExtraBold text-success-500">
                24
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-JakartaBold">Repeat Customers</Text>
                <Text className="text-sm text-secondary-600">
                  Returning visitors
                </Text>
              </View>
              <Text className="text-xl font-JakartaExtraBold text-primary-500">
                19
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-JakartaBold">Average Rating</Text>
                <Text className="text-sm text-secondary-600">
                  From customer reviews
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-xl font-JakartaExtraBold text-warning-500 mr-1">
                  4.7
                </Text>
                <Text className="text-warning-500">⭐</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Export Data */}
        <View className="bg-white rounded-lg p-4 mb-8">
          <Text className="text-lg font-JakartaBold mb-3">Export Data</Text>

          <View className="space-y-3">
            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">📊</Text>
              <Text className="font-JakartaMedium">Export Sales Report</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">📈</Text>
              <Text className="font-JakartaMedium">Export Analytics Data</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">📋</Text>
              <Text className="font-JakartaMedium">Export Order History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessAnalytics;
