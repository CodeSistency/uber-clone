import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Enhanced dummy data for menu management
const DUMMY_MENU_CATEGORIES = [
  {
    id: "pizzas",
    name: "Pizzas",
    count: 8,
    icon: "🍕",
    color: "bg-red-50 border-red-200",
  },
  {
    id: "pastas",
    name: "Pastas",
    count: 5,
    icon: "🍝",
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    id: "sides",
    name: "Sides",
    count: 4,
    icon: "🥗",
    color: "bg-green-50 border-green-200",
  },
  {
    id: "drinks",
    name: "Drinks",
    count: 6,
    icon: "🥤",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: "desserts",
    name: "Desserts",
    count: 3,
    icon: "🍰",
    color: "bg-pink-50 border-pink-200",
  },
];

const DUMMY_MENU_ITEMS = [
  {
    id: "ITEM_001",
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomato sauce, basil",
    price: 16.99,
    category: "pizzas",
    isAvailable: true,
    image: "🍕",
    allergens: ["Dairy", "Gluten"],
    prepTime: 15,
    popularity: 95,
    soldToday: 23,
    revenue: 390.77,
    rating: 4.8,
    tags: ["Vegetarian", "Classic"],
  },
  {
    id: "ITEM_002",
    name: "Pepperoni Pizza",
    description: "Pepperoni, mozzarella, tomato sauce",
    price: 18.99,
    category: "pizzas",
    isAvailable: true,
    image: "🌶️",
    allergens: ["Dairy", "Gluten"],
    prepTime: 18,
    popularity: 88,
    soldToday: 18,
    revenue: 341.82,
    rating: 4.7,
    tags: ["Spicy", "Popular"],
  },
  {
    id: "ITEM_003",
    name: "Spaghetti Carbonara",
    description: "Creamy sauce with pancetta and parmesan",
    price: 14.99,
    category: "pastas",
    isAvailable: true,
    image: "🍝",
    allergens: ["Dairy", "Gluten", "Eggs"],
    prepTime: 12,
    popularity: 82,
    soldToday: 15,
    revenue: 224.85,
    rating: 4.6,
    tags: ["Creamy", "Italian"],
  },
  {
    id: "ITEM_004",
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter",
    price: 6.99,
    category: "sides",
    isAvailable: false,
    image: "🍞",
    allergens: ["Dairy", "Gluten"],
    prepTime: 8,
    popularity: 75,
    soldToday: 12,
    revenue: 83.88,
    rating: 4.5,
    tags: ["Side", "Garlic"],
  },
  {
    id: "ITEM_005",
    name: "Coca Cola",
    description: "Classic cola drink",
    price: 2.99,
    category: "drinks",
    isAvailable: true,
    image: "🥤",
    allergens: [],
    prepTime: 1,
    popularity: 90,
    soldToday: 28,
    revenue: 83.72,
    rating: 4.9,
    tags: ["Drink", "Soda"],
  },
  {
    id: "ITEM_006",
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee and mascarpone",
    price: 8.99,
    category: "desserts",
    isAvailable: true,
    image: "🍰",
    allergens: ["Dairy", "Gluten", "Eggs"],
    prepTime: 5,
    popularity: 78,
    soldToday: 8,
    revenue: 71.92,
    rating: 4.7,
    tags: ["Dessert", "Italian"],
  },
];

const MenuManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState("pizzas");
  const [menuItems] = useState(DUMMY_MENU_ITEMS);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredItems = menuItems.filter(
    (item) => item.category === selectedCategory,
  );

  const handleToggleAvailability = (itemId: string) => {
    Alert.alert("Item Status", "Availability toggled successfully!");
  };

  const handleEditItem = (itemId: string) => {
    Alert.alert("Edit Item", "Edit item functionality would open edit form");
  };

  const handleAddItem = () => {
    Alert.alert("Add Item", "Add new item functionality would open item form");
  };

  const handleAddPhoto = (itemId: string) => {
    Alert.alert(
      "Add Photo",
      "Photo upload functionality would open camera/gallery",
    );
  };

  // Calculate category performance
  const categoryStats = DUMMY_MENU_CATEGORIES.map((category) => {
    const categoryItems = menuItems.filter(
      (item) => item.category === category.id,
    );
    const totalSold = categoryItems.reduce(
      (sum, item) => sum + item.soldToday,
      0,
    );
    const totalRevenue = categoryItems.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );
    const avgRating =
      categoryItems.reduce((sum, item) => sum + item.rating, 0) /
      categoryItems.length;

    return {
      ...category,
      totalSold,
      totalRevenue,
      avgRating: avgRating.toFixed(1),
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Enhanced Header */}
      <View className="bg-white p-5">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xl font-JakartaBold">Menu Management</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 bg-general-500 rounded-full"
            >
              <Text className="text-lg">
                {viewMode === "grid" ? "📋" : "⊞"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text className="text-secondary-600">
          Visual menu management with analytics
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Add New Item Button */}
        <TouchableOpacity
          onPress={handleAddItem}
          className="bg-primary-500 rounded-lg p-4 mb-4 items-center"
        >
          <Text className="text-white font-JakartaBold text-lg">
            + Add New Item
          </Text>
        </TouchableOpacity>

        {/* Enhanced Category Tabs */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">Categories</Text>
          <View className="grid grid-cols-2 gap-3">
            {categoryStats.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border-2 ${
                  selectedCategory === category.id
                    ? "border-primary-500 bg-primary-50"
                    : `border-general-500 ${category.color}`
                }`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-2xl">{category.icon}</Text>
                  <Text className="font-JakartaBold text-primary-500">
                    {category.count}
                  </Text>
                </View>
                <Text className="font-JakartaBold mb-1">{category.name}</Text>
                <View className="flex-row justify-between text-xs">
                  <Text className="text-secondary-600">
                    {category.totalSold} sold
                  </Text>
                  <Text className="text-secondary-600">
                    ⭐ {category.avgRating}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Performance Summary */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">
            {
              DUMMY_MENU_CATEGORIES.find((cat) => cat.id === selectedCategory)
                ?.name
            }{" "}
            Performance
          </Text>
          {(() => {
            const stats = categoryStats.find(
              (cat) => cat.id === selectedCategory,
            );
            return stats ? (
              <View className="grid grid-cols-3 gap-4">
                <View className="items-center">
                  <Text className="text-2xl font-JakartaExtraBold text-primary-500">
                    {stats.totalSold}
                  </Text>
                  <Text className="text-sm text-secondary-600">Sold Today</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-JakartaExtraBold text-success-500">
                    ${stats.totalRevenue.toFixed(0)}
                  </Text>
                  <Text className="text-sm text-secondary-600">Revenue</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-JakartaExtraBold text-warning-500">
                    {stats.avgRating}
                  </Text>
                  <Text className="text-sm text-secondary-600">Rating</Text>
                </View>
              </View>
            ) : null;
          })()}
        </View>

        {/* Menu Items */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-JakartaBold">
              {
                DUMMY_MENU_CATEGORIES.find((cat) => cat.id === selectedCategory)
                  ?.name
              }{" "}
              Items
            </Text>
            <Text className="text-secondary-600">
              {filteredItems.length} items
            </Text>
          </View>

          {filteredItems.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-4xl mb-3">🍽️</Text>
              <Text className="text-secondary-600 text-center">
                No items in this category yet
              </Text>
              <TouchableOpacity
                onPress={handleAddItem}
                className="mt-3 bg-primary-500 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-JakartaBold">
                  Add First Item
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className={viewMode === "grid" ? "space-y-4" : "space-y-3"}>
              {filteredItems.map((item) => (
                <View
                  key={item.id}
                  className={`border border-general-500 rounded-lg p-4 ${
                    item.isAvailable ? "bg-white" : "bg-general-500 opacity-60"
                  }`}
                >
                  <View className="flex-row items-start">
                    {/* Item Image */}
                    <TouchableOpacity
                      onPress={() => handleAddPhoto(item.id)}
                      className="w-16 h-16 bg-general-500 rounded-lg items-center justify-center mr-4"
                    >
                      <Text className="text-2xl">{item.image}</Text>
                    </TouchableOpacity>

                    <View className="flex-1">
                      {/* Item Header */}
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 mr-2">
                          <Text className="font-JakartaBold text-lg">
                            {item.name}
                          </Text>
                          <Text
                            className="text-secondary-600 text-sm"
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                        </View>
                        <Text className="font-JakartaExtraBold text-primary-500 text-lg">
                          ${item.price}
                        </Text>
                      </View>

                      {/* Item Details */}
                      <View className="flex-row flex-wrap mb-3">
                        {item.tags.map((tag, index) => (
                          <View
                            key={index}
                            className="bg-general-500 px-2 py-1 rounded-full mr-2 mb-1"
                          >
                            <Text className="text-xs text-secondary-700">
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Allergens */}
                      {item.allergens.length > 0 && (
                        <View className="mb-3">
                          <Text className="text-xs text-secondary-600 mb-1">
                            ⚠️ Allergens: {item.allergens.join(", ")}
                          </Text>
                        </View>
                      )}

                      {/* Performance Metrics */}
                      <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-row items-center">
                          <Text className="text-sm text-secondary-600 mr-2">
                            ⭐ {item.rating}
                          </Text>
                          <Text className="text-sm text-secondary-600 mr-2">
                            ⏱️ {item.prepTime}min
                          </Text>
                          <Text className="text-sm text-success-500 font-JakartaBold">
                            {item.soldToday} sold
                          </Text>
                        </View>
                        <Text className="text-sm text-primary-500 font-JakartaBold">
                          ${item.revenue.toFixed(2)}
                        </Text>
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                          <Text
                            className={`text-sm font-JakartaBold mr-3 ${
                              item.isAvailable
                                ? "text-success-500"
                                : "text-danger-500"
                            }`}
                          >
                            {item.isAvailable ? "✓ Available" : "✗ Unavailable"}
                          </Text>
                        </View>

                        <View className="flex-row">
                          <TouchableOpacity
                            onPress={() => handleToggleAvailability(item.id)}
                            className={`px-3 py-1 rounded-full mr-2 ${
                              item.isAvailable
                                ? "bg-danger-500"
                                : "bg-success-500"
                            }`}
                          >
                            <Text className="text-white text-xs font-JakartaBold">
                              {item.isAvailable ? "Hide" : "Show"}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleEditItem(item.id)}
                            className="px-3 py-1 rounded-full bg-primary-500"
                          >
                            <Text className="text-white text-xs font-JakartaBold">
                              Edit
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Enhanced Bulk Actions */}
        <View className="bg-white rounded-lg p-4 mb-8">
          <Text className="text-lg font-JakartaBold mb-3">Menu Tools</Text>

          <View className="grid grid-cols-2 gap-3">
            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">📷</Text>
              <Text className="font-JakartaMedium">Bulk Photos</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">📋</Text>
              <Text className="font-JakartaMedium">Import CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">📊</Text>
              <Text className="font-JakartaMedium">Export Menu</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">🗂️</Text>
              <Text className="font-JakartaMedium">Categories</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MenuManagement;
