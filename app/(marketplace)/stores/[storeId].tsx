import { router } from "expo-router";
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy data for store details
const DUMMY_STORE = {
  id: "STORE_001",
  name: "Mario's Pizza",
  category: "Italian",
  rating: 4.7,
  reviewCount: 284,
  deliveryTime: "25-35 min",
  deliveryFee: 2.99,
  image: "🍕",
  isOpen: true,
  description:
    "Authentic Italian pizza made with fresh ingredients and traditional recipes. Family-owned and operated for over 20 years.",
  address: "123 Main St, Downtown",
};

const DUMMY_MENU_CATEGORIES = [
  { id: "pizzas", name: "Pizzas", count: 8 },
  { id: "pastas", name: "Pastas", count: 5 },
  { id: "sides", name: "Sides", count: 4 },
  { id: "drinks", name: "Drinks", count: 6 },
];

const DUMMY_MENU_ITEMS = [
  {
    id: "ITEM_001",
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomato sauce, basil leaves",
    price: 16.99,
    image: "🍕",
    category: "pizzas",
    isPopular: true,
  },
  {
    id: "ITEM_002",
    name: "Pepperoni Pizza",
    description: "Pepperoni, mozzarella, tomato sauce",
    price: 18.99,
    image: "🌶️",
    category: "pizzas",
    isPopular: true,
  },
  {
    id: "ITEM_003",
    name: "Spaghetti Carbonara",
    description: "Creamy sauce with pancetta and parmesan",
    price: 14.99,
    image: "🍝",
    category: "pastas",
    isPopular: false,
  },
  {
    id: "ITEM_004",
    name: "Caesar Salad",
    description: "Romaine lettuce, croutons, parmesan, caesar dressing",
    price: 8.99,
    image: "🥗",
    category: "sides",
    isPopular: false,
  },
  {
    id: "ITEM_005",
    name: "Coca Cola",
    description: "Classic cola drink",
    price: 2.99,
    image: "🥤",
    category: "drinks",
    isPopular: false,
  },
];

const StoreDetails = () => {
  const [selectedCategory, setSelectedCategory] = useState("pizzas");
  const [cart, setCart] = useState<{ item: any; quantity: number }[]>([]);

  const filteredItems = DUMMY_MENU_ITEMS.filter(
    (item) => item.category === selectedCategory,
  );
  const cartTotal = cart.reduce(
    (total, item) => total + item.item.price * item.quantity,
    0,
  );
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleAddToCart = (menuItem: any) => {
    const existingItem = cart.find(
      (cartItem) => cartItem.item.id === menuItem.id,
    );

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.item.id === menuItem.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        ),
      );
    } else {
      setCart([...cart, { item: menuItem, quantity: 1 }]);
    }

    Alert.alert(
      "Added to Cart",
      `${menuItem.name} has been added to your cart.`,
    );
  };

  const handleViewCart = () => {
    router.push("/marketplace/checkout" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Store Header */}
      <View className="bg-white p-5">
        <View className="flex-row items-center mb-3">
          <Text className="text-4xl mr-3">{DUMMY_STORE.image}</Text>
          <View className="flex-1">
            <Text className="text-xl font-JakartaBold">{DUMMY_STORE.name}</Text>
            <Text className="text-secondary-600">{DUMMY_STORE.category}</Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full ${
              DUMMY_STORE.isOpen ? "bg-success-500" : "bg-danger-500"
            }`}
          >
            <Text className="text-white text-sm font-JakartaBold">
              {DUMMY_STORE.isOpen ? "Open" : "Closed"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-warning-500 mr-1">⭐</Text>
            <Text className="font-JakartaBold mr-1">{DUMMY_STORE.rating}</Text>
            <Text className="text-secondary-600">
              ({DUMMY_STORE.reviewCount})
            </Text>
          </View>
          <Text className="text-secondary-600">{DUMMY_STORE.deliveryTime}</Text>
          <Text className="text-secondary-600">
            ${DUMMY_STORE.deliveryFee} delivery
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Store Info */}
        <View className="bg-white mx-5 mt-4 p-4 rounded-lg mb-4">
          <Text className="font-JakartaBold mb-2">About</Text>
          <Text className="text-secondary-600 mb-3">
            {DUMMY_STORE.description}
          </Text>
          <Text className="text-secondary-600">📍 {DUMMY_STORE.address}</Text>
        </View>

        {/* Menu Categories */}
        <View className="bg-white mx-5 mb-4 p-4 rounded-lg">
          <Text className="text-lg font-JakartaBold mb-3">Menu</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {DUMMY_MENU_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === category.id
                      ? "bg-primary-500"
                      : "bg-general-500"
                  }`}
                >
                  <Text
                    className={`font-JakartaBold ${
                      selectedCategory === category.id
                        ? "text-white"
                        : "text-secondary-700"
                    }`}
                  >
                    {category.name} ({category.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View className="mx-5 mb-20">
          {filteredItems.map((item) => (
            <View key={item.id} className="bg-white rounded-lg p-4 mb-3">
              <View className="flex-row items-start">
                <Text className="text-3xl mr-3">{item.image}</Text>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <View className="flex-1 mr-2">
                      <Text className="font-JakartaBold text-lg">
                        {item.name}
                      </Text>
                      {item.isPopular && (
                        <View className="bg-warning-500 px-2 py-1 rounded-full self-start mt-1">
                          <Text className="text-white text-xs font-JakartaBold">
                            Popular
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="font-JakartaExtraBold text-primary-500 text-lg">
                      ${item.price}
                    </Text>
                  </View>

                  <Text className="text-secondary-600 mb-3" numberOfLines={2}>
                    {item.description}
                  </Text>

                  <TouchableOpacity
                    onPress={() => handleAddToCart(item)}
                    className="bg-primary-500 rounded-full py-2 px-4 self-start"
                  >
                    <Text className="text-white font-JakartaBold">
                      Add to Cart
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <TouchableOpacity
          onPress={handleViewCart}
          className="absolute bottom-5 right-5 bg-primary-500 rounded-full px-6 py-3 shadow-lg"
        >
          <Text className="text-white font-JakartaBold">
            🛒 View Cart (${cartTotal.toFixed(2)})
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default StoreDetails;
