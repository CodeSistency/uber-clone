import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy data for stores
const DUMMY_STORES = [
  {
    id: "STORE_001",
    name: "Mario's Pizza",
    category: "Italian",
    rating: 4.7,
    reviewCount: 284,
    deliveryTime: "25-35 min",
    deliveryFee: 2.99,
    image: "🍕",
    isOpen: true,
  },
  {
    id: "STORE_002",
    name: "Burger Palace",
    category: "American",
    rating: 4.5,
    reviewCount: 156,
    deliveryTime: "20-30 min",
    deliveryFee: 1.99,
    image: "🍔",
    isOpen: true,
  },
  {
    id: "STORE_003",
    name: "Sushi Express",
    category: "Japanese",
    rating: 4.8,
    reviewCount: 203,
    deliveryTime: "30-40 min",
    deliveryFee: 3.49,
    image: "🍱",
    isOpen: true,
  },
  {
    id: "STORE_004",
    name: "Taco Fiesta",
    category: "Mexican",
    rating: 4.6,
    reviewCount: 189,
    deliveryTime: "15-25 min",
    deliveryFee: 2.49,
    image: "🌮",
    isOpen: false,
  },
  {
    id: "STORE_005",
    name: "Green Pharmacy",
    category: "Health",
    rating: 4.4,
    reviewCount: 97,
    deliveryTime: "20-35 min",
    deliveryFee: 0.99,
    image: "💊",
    isOpen: true,
  },
  {
    id: "STORE_006",
    name: "Fresh Market",
    category: "Groceries",
    rating: 4.3,
    reviewCount: 312,
    deliveryTime: "25-40 min",
    deliveryFee: 1.49,
    image: "🛒",
    isOpen: true,
  },
];

const DUMMY_CATEGORIES = [
  { id: "all", name: "All", icon: "🍽️" },
  { id: "italian", name: "Italian", icon: "🍝" },
  { id: "american", name: "American", icon: "🍔" },
  { id: "japanese", name: "Japanese", icon: "🍱" },
  { id: "mexican", name: "Mexican", icon: "🌮" },
  { id: "health", name: "Health", icon: "💊" },
  { id: "groceries", name: "Groceries", icon: "🛒" },
];

const MarketplaceHome = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = DUMMY_STORES.filter((store) => {
    const matchesCategory =
      selectedCategory === "all" ||
      store.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStorePress = (storeId: string) => {
    router.push(`/stores/${storeId}` as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-primary dark:bg-brand-primaryDark">
      {/* Header */}
      <View className="bg-white dark:bg-brand-primary p-5">
        <Text className="text-xl font-JakartaBold text-black dark:text-white">
          Delivery
        </Text>
        <Text className="text-secondary-600 dark:text-gray-300 mt-1">
          Order from your favorite restaurants
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Search Bar */}
        <View className="bg-white dark:bg-brand-primary rounded-full p-1 mb-4 flex-row items-center">
          <Text className="text-lg ml-3">🔍</Text>
          <TextInput
            placeholder="Search restaurants, cuisines..."
            className="flex-1 p-3 font-JakartaMedium text-black dark:text-white"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <View className="mb-4">
          <Text className="text-lg font-JakartaBold mb-3 text-black dark:text-white">
            Categories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {DUMMY_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`items-center p-3 rounded-lg ${
                    selectedCategory === category.id
                      ? "bg-brand-secondary"
                      : "bg-white dark:bg-brand-primary"
                  }`}
                >
                  <Text className="text-2xl mb-2">{category.icon}</Text>
                  <Text
                    className={`font-JakartaBold ${
                      selectedCategory === category.id
                        ? "text-black"
                        : "text-secondary-700 dark:text-gray-200"
                    }`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Stores List */}
        <View className="mb-4">
          <Text className="text-lg font-JakartaBold mb-3 text-black dark:text-white">
            {selectedCategory === "all"
              ? "All Restaurants"
              : `${selectedCategory} Restaurants`}
          </Text>

          {filteredStores.length === 0 ? (
            <View className="bg-white dark:bg-brand-primary rounded-lg p-8 items-center">
              <Text className="text-4xl mb-3">🔍</Text>
              <Text className="text-xl font-JakartaBold mb-2 text-black dark:text-white">
                No results found
              </Text>
              <Text className="text-secondary-600 dark:text-gray-300 text-center">
                Try adjusting your search or category filter
              </Text>
            </View>
          ) : (
            filteredStores.map((store) => (
              <TouchableOpacity
                key={store.id}
                onPress={() => handleStorePress(store.id)}
                className="bg-white dark:bg-brand-primary rounded-lg p-4 mb-3"
              >
                <View className="flex-row items-center">
                  <Text className="text-4xl mr-4">{store.image}</Text>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="font-JakartaBold text-lg flex-1 mr-2 text-black dark:text-white">
                        {store.name}
                      </Text>
                      <View
                        className={`px-2 py-1 rounded-full ${
                          store.isOpen ? "bg-success-500" : "bg-danger-500"
                        }`}
                      >
                        <Text className="text-white text-xs font-JakartaBold">
                          {store.isOpen ? "Open" : "Closed"}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-secondary-600 dark:text-gray-300 mb-2">
                      {store.category}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text className="text-warning-500 mr-1">⭐</Text>
                        <Text className="font-JakartaBold mr-1 text-black dark:text-white">
                          {store.rating}
                        </Text>
                        <Text className="text-secondary-600 dark:text-gray-300">
                          ({store.reviewCount} reviews)
                        </Text>
                      </View>

                      <View className="items-end">
                        <Text className="text-secondary-600 dark:text-gray-300 text-sm">
                          {store.deliveryTime}
                        </Text>
                        <Text className="text-secondary-600 dark:text-gray-300 text-sm">
                          ${store.deliveryFee} delivery
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MarketplaceHome;
