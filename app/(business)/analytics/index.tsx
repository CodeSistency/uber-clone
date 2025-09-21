import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Enhanced dummy data for advanced analytics
const DUMMY_ANALYTICS = {
  today: {
    revenue: 1250.75,
    orders: 47,
    avgOrderValue: 26.61,
    customers: 43,
    deliveryTime: "28 min",
    satisfaction: "94%",
    newCustomers: 12,
    repeatCustomers: 31,
    avgRating: 4.7,
  },
  week: {
    revenue: 8750.25,
    orders: 328,
    avgOrderValue: 26.68,
    customers: 289,
    deliveryTime: "26 min",
    satisfaction: "95%",
    newCustomers: 89,
    repeatCustomers: 200,
    avgRating: 4.6,
  },
  month: {
    revenue: 37500.8,
    orders: 1405,
    avgOrderValue: 26.69,
    customers: 1250,
    deliveryTime: "25 min",
    satisfaction: "93%",
    newCustomers: 423,
    repeatCustomers: 827,
    avgRating: 4.5,
  },
};

const DUMMY_POPULAR_ITEMS = [
  {
    name: "Margherita Pizza",
    sold: 145,
    revenue: 2465.55,
    trend: "+12%",
    rating: 4.8,
    profit: 1846.55,
  },
  {
    name: "Pepperoni Pizza",
    sold: 128,
    revenue: 2430.72,
    trend: "+8%",
    rating: 4.7,
    profit: 1791.72,
  },
  {
    name: "Vegetarian Pizza",
    sold: 98,
    revenue: 1663.02,
    trend: "+15%",
    rating: 4.6,
    profit: 1273.02,
  },
  {
    name: "Spaghetti Carbonara",
    sold: 87,
    revenue: 1306.13,
    trend: "+5%",
    rating: 4.5,
    profit: 986.13,
  },
  {
    name: "Garlic Bread",
    sold: 76,
    revenue: 531.24,
    trend: "-3%",
    rating: 4.4,
    profit: 411.24,
  },
];

const DUMMY_HOURLY_DATA = [
  { hour: "11 AM", orders: 8, revenue: 212.64 },
  { hour: "12 PM", orders: 15, revenue: 399.15 },
  { hour: "1 PM", orders: 22, revenue: 585.42 },
  { hour: "2 PM", orders: 18, revenue: 478.98 },
  { hour: "3 PM", orders: 12, revenue: 319.32 },
  { hour: "4 PM", orders: 10, revenue: 266.1 },
  { hour: "5 PM", orders: 14, revenue: 372.54 },
  { hour: "6 PM", orders: 28, revenue: 745.08 },
  { hour: "7 PM", orders: 35, revenue: 931.35 },
  { hour: "8 PM", orders: 25, revenue: 665.25 },
  { hour: "9 PM", orders: 18, revenue: 478.98 },
  { hour: "10 PM", orders: 12, revenue: 319.32 },
];

const DUMMY_CUSTOMER_REVIEWS = [
  {
    id: "REV_001",
    customerName: "Sarah Johnson",
    rating: 5,
    review:
      "Amazing pizza! The delivery was super fast and the food was hot and fresh.",
    date: "2024-01-15",
    orderItems: ["Margherita Pizza", "Garlic Bread"],
  },
  {
    id: "REV_002",
    customerName: "Mike Chen",
    rating: 4,
    review:
      "Good food but delivery took longer than expected. Still tasty though!",
    date: "2024-01-14",
    orderItems: ["Pepperoni Pizza", "Coca Cola"],
  },
  {
    id: "REV_003",
    customerName: "Emma Wilson",
    rating: 5,
    review: "Best Italian food in the area! Will definitely order again.",
    date: "2024-01-13",
    orderItems: ["Spaghetti Carbonara", "Tiramisu"],
  },
  {
    id: "REV_004",
    customerName: "James Brown",
    rating: 3,
    review: "Food was okay but the pizza crust was a bit soggy.",
    date: "2024-01-12",
    orderItems: ["Vegetarian Pizza"],
  },
];

const DUMMY_INSIGHTS = [
  {
    type: "positive",
    title: "Peak Performance",
    message: "Your lunch hours (12-2 PM) generate 45% of daily revenue",
    action: "Consider adding lunch specials",
    icon: "📈",
  },
  {
    type: "warning",
    title: "Popular Item Declining",
    message: "Garlic Bread sales dropped 3% this week",
    action: "Review pricing or consider seasonal promotion",
    icon: "⚠️",
  },
  {
    type: "opportunity",
    title: "Customer Retention",
    message: "Repeat customers spend 23% more per order",
    action: "Launch loyalty program",
    icon: "🎯",
  },
  {
    type: "trend",
    title: "Delivery Optimization",
    message: "Average delivery time improved by 12% this month",
    action: "Great job! Keep monitoring driver performance",
    icon: "🚀",
  },
];

const BusinessAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "insights" | "reviews"
  >("overview");

  const currentData = DUMMY_ANALYTICS[selectedPeriod];
  const maxHourlyOrders = Math.max(...DUMMY_HOURLY_DATA.map((h) => h.orders));

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          className={i <= rating ? "text-warning-500" : "text-secondary-300"}
        >
          ⭐
        </Text>,
      );
    }
    return stars;
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-success-50 border-success-200";
      case "warning":
        return "bg-warning-50 border-warning-200";
      case "opportunity":
        return "bg-primary-50 border-primary-200";
      case "trend":
        return "bg-secondary-50 border-secondary-200";
      default:
        return "bg-general-500 border-general-300";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Enhanced Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Analytics & Insights</Text>
        <Text className="text-secondary-600">
          Advanced analytics with AI-powered recommendations
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Tab Selector */}
        <View className="bg-white rounded-lg p-1 mb-4 flex-row">
          {[
            { key: "overview", label: "Overview", icon: "📊" },
            { key: "insights", label: "Insights", icon: "💡" },
            { key: "reviews", label: "Reviews", icon: "⭐" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setSelectedTab(tab.key as any)}
              className={`flex-1 py-3 px-4 rounded-md flex-row items-center justify-center ${
                selectedTab === tab.key ? "bg-primary-500" : "bg-transparent"
              }`}
            >
              <Text className="mr-2">{tab.icon}</Text>
              <Text
                className={`text-center font-JakartaBold ${
                  selectedTab === tab.key ? "text-white" : "text-secondary-600"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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

        {/* Overview Tab */}
        {selectedTab === "overview" && (
          <>
            {/* Enhanced Key Metrics */}
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-lg font-JakartaBold mb-4">
                Key Performance Metrics
              </Text>

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

              {/* Performance Indicators */}
              <View className="grid grid-cols-2 gap-4">
                <View className="items-center p-3 bg-blue-50 rounded-lg">
                  <Text className="text-lg font-JakartaExtraBold text-blue-500">
                    {currentData.deliveryTime}
                  </Text>
                  <Text className="text-xs text-secondary-600">
                    Avg Delivery
                  </Text>
                </View>

                <View className="items-center p-3 bg-green-50 rounded-lg">
                  <Text className="text-lg font-JakartaExtraBold text-green-500">
                    {currentData.satisfaction}
                  </Text>
                  <Text className="text-xs text-secondary-600">
                    Satisfaction
                  </Text>
                </View>
              </View>
            </View>

            {/* Customer Analytics */}
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-lg font-JakartaBold mb-4">
                Customer Analytics
              </Text>

              <View className="space-y-4">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">👥</Text>
                    <View>
                      <Text className="font-JakartaBold">New Customers</Text>
                      <Text className="text-sm text-secondary-600">
                        First-time buyers
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xl font-JakartaExtraBold text-success-500">
                    {currentData.newCustomers}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">🔄</Text>
                    <View>
                      <Text className="font-JakartaBold">Repeat Customers</Text>
                      <Text className="text-sm text-secondary-600">
                        Returning buyers
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xl font-JakartaExtraBold text-primary-500">
                    {currentData.repeatCustomers}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">⭐</Text>
                    <View>
                      <Text className="font-JakartaBold">Average Rating</Text>
                      <Text className="text-sm text-secondary-600">
                        From all reviews
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-xl font-JakartaExtraBold text-warning-500 mr-1">
                      {currentData.avgRating}
                    </Text>
                    <Text className="text-warning-500">⭐</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Enhanced Popular Items */}
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-lg font-JakartaBold mb-4">
                Top Performing Items
              </Text>

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
                    <View className="flex-row items-center justify-between mt-1">
                      <Text className="text-sm text-secondary-600">
                        {item.sold} sold • ⭐ {item.rating}
                      </Text>
                      <Text className="text-sm text-primary-500 font-JakartaBold">
                        ${item.profit.toFixed(2)} profit
                      </Text>
                    </View>
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

            {/* Hourly Distribution */}
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-lg font-JakartaBold mb-4">
                Revenue by Hour
              </Text>

              <View className="space-y-3">
                {DUMMY_HOURLY_DATA.map((hourData) => (
                  <View key={hourData.hour} className="flex-row items-center">
                    <Text className="w-12 text-sm font-JakartaMedium">
                      {hourData.hour}
                    </Text>
                    <View className="flex-1 bg-general-500 rounded-full h-4 mx-3">
                      <View
                        className="bg-primary-500 h-4 rounded-full"
                        style={{
                          width: `${(hourData.orders / maxHourlyOrders) * 100}%`,
                        }}
                      />
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-JakartaBold text-primary-500">
                        ${hourData.revenue.toFixed(0)}
                      </Text>
                      <Text className="text-xs text-secondary-600">
                        {hourData.orders} orders
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Insights Tab */}
        {selectedTab === "insights" && (
          <View className="space-y-4 mb-8">
            {DUMMY_INSIGHTS.map((insight, index) => (
              <View
                key={index}
                className={`p-4 rounded-lg border-2 ${getInsightColor(insight.type)}`}
              >
                <View className="flex-row items-start">
                  <Text className="text-2xl mr-3">{insight.icon}</Text>
                  <View className="flex-1">
                    <Text className="font-JakartaBold mb-2">
                      {insight.title}
                    </Text>
                    <Text className="text-secondary-700 mb-3">
                      {insight.message}
                    </Text>
                    <View className="bg-white px-3 py-2 rounded-full">
                      <Text className="text-sm font-JakartaBold text-primary-500">
                        💡 {insight.action}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Reviews Tab */}
        {selectedTab === "reviews" && (
          <View className="space-y-4 mb-8">
            {/* Rating Summary */}
            <View className="bg-white rounded-lg p-4">
              <Text className="text-lg font-JakartaBold mb-4">
                Rating Summary
              </Text>
              <View className="flex-row items-center justify-center mb-4">
                <Text className="text-4xl font-JakartaExtraBold text-warning-500 mr-2">
                  {currentData.avgRating}
                </Text>
                <View className="flex-row">
                  {renderStars(Math.floor(currentData.avgRating))}
                </View>
              </View>
              <Text className="text-center text-secondary-600">
                Based on {DUMMY_CUSTOMER_REVIEWS.length} reviews
              </Text>
            </View>

            {/* Individual Reviews */}
            {DUMMY_CUSTOMER_REVIEWS.map((review) => (
              <View key={review.id} className="bg-white rounded-lg p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="font-JakartaBold">
                      {review.customerName}
                    </Text>
                    <Text className="text-sm text-secondary-600">
                      {review.date}
                    </Text>
                  </View>
                  <View className="flex-row">{renderStars(review.rating)}</View>
                </View>

                <Text className="text-secondary-700 mb-3">{review.review}</Text>

                <View className="flex-row flex-wrap">
                  {review.orderItems.map((item, index) => (
                    <View
                      key={index}
                      className="bg-general-500 px-2 py-1 rounded-full mr-2 mb-1"
                    >
                      <Text className="text-xs text-secondary-700">{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Export Actions */}
        <View className="bg-white rounded-lg p-4 mb-8">
          <Text className="text-lg font-JakartaBold mb-3">
            Export & Reports
          </Text>

          <View className="grid grid-cols-2 gap-3">
            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">📊</Text>
              <Text className="font-JakartaMedium">Sales Report</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">📈</Text>
              <Text className="font-JakartaMedium">Analytics Data</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">⭐</Text>
              <Text className="font-JakartaMedium">Review Report</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">📋</Text>
              <Text className="font-JakartaMedium">Full Export</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessAnalytics;
