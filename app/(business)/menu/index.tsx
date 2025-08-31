import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

// Dummy data for menu items
const DUMMY_MENU_CATEGORIES = [
  { id: 'pizzas', name: 'Pizzas', count: 8 },
  { id: 'pastas', name: 'Pastas', count: 5 },
  { id: 'sides', name: 'Sides', count: 4 },
  { id: 'drinks', name: 'Drinks', count: 6 }
];

const DUMMY_MENU_ITEMS = [
  {
    id: 'ITEM_001',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, basil',
    price: 16.99,
    category: 'pizzas',
    isAvailable: true,
    image: '🍕'
  },
  {
    id: 'ITEM_002',
    name: 'Pepperoni Pizza',
    description: 'Pepperoni, mozzarella, tomato sauce',
    price: 18.99,
    category: 'pizzas',
    isAvailable: true,
    image: '🌶️'
  },
  {
    id: 'ITEM_003',
    name: 'Spaghetti Carbonara',
    description: 'Creamy sauce with pancetta and parmesan',
    price: 14.99,
    category: 'pastas',
    isAvailable: true,
    image: '🍝'
  },
  {
    id: 'ITEM_004',
    name: 'Garlic Bread',
    description: 'Toasted bread with garlic butter',
    price: 6.99,
    category: 'sides',
    isAvailable: false,
    image: '🍞'
  },
  {
    id: 'ITEM_005',
    name: 'Coca Cola',
    description: 'Classic cola drink',
    price: 2.99,
    category: 'drinks',
    isAvailable: true,
    image: '🥤'
  }
];

const MenuManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState('pizzas');
  const [menuItems] = useState(DUMMY_MENU_ITEMS);

  const filteredItems = menuItems.filter(item => item.category === selectedCategory);

  const handleToggleAvailability = (itemId: string) => {
    Alert.alert('Item Status', 'Availability toggled successfully!');
  };

  const handleEditItem = (itemId: string) => {
    Alert.alert('Edit Item', 'Edit item functionality would open edit form');
  };

  const handleAddItem = () => {
    Alert.alert('Add Item', 'Add new item functionality would open item form');
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Menu Management</Text>
        <Text className="text-secondary-600 mt-1">
          Add, edit, and organize your menu items
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Add New Item Button */}
        <TouchableOpacity
          onPress={handleAddItem}
          className="bg-primary-500 rounded-lg p-4 mb-4 items-center"
        >
          <Text className="text-white font-JakartaBold text-lg">+ Add New Item</Text>
        </TouchableOpacity>

        {/* Category Tabs */}
        <View className="bg-white rounded-lg p-2 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {DUMMY_MENU_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 mx-1 rounded-lg ${
                    selectedCategory === category.id
                      ? 'bg-primary-500'
                      : 'bg-general-500'
                  }`}
                >
                  <Text className={`font-JakartaBold ${
                    selectedCategory === category.id
                      ? 'text-white'
                      : 'text-secondary-700'
                  }`}>
                    {category.name} ({category.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-JakartaBold mb-3">
            {DUMMY_MENU_CATEGORIES.find(cat => cat.id === selectedCategory)?.name} Items
          </Text>

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
                <Text className="text-white font-JakartaBold">Add First Item</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredItems.map((item) => (
              <View key={item.id} className="border-b border-general-500 py-4 last:border-b-0">
                <View className="flex-row items-center">
                  <Text className="text-3xl mr-3">{item.image}</Text>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="font-JakartaBold flex-1 mr-2">{item.name}</Text>
                      <Text className="font-JakartaExtraBold text-primary-500">
                        ${item.price}
                      </Text>
                    </View>

                    <Text className="text-secondary-600 text-sm mb-2" numberOfLines={2}>
                      {item.description}
                    </Text>

                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <Text className={`text-sm font-JakartaBold mr-3 ${
                          item.isAvailable ? 'text-success-500' : 'text-danger-500'
                        }`}>
                          {item.isAvailable ? '✓ Available' : '✗ Unavailable'}
                        </Text>
                      </View>

                      <View className="flex-row">
                        <TouchableOpacity
                          onPress={() => handleToggleAvailability(item.id)}
                          className={`px-3 py-1 rounded-full mr-2 ${
                            item.isAvailable ? 'bg-danger-500' : 'bg-success-500'
                          }`}
                        >
                          <Text className="text-white text-xs font-JakartaBold">
                            {item.isAvailable ? 'Hide' : 'Show'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleEditItem(item.id)}
                          className="px-3 py-1 rounded-full bg-primary-500"
                        >
                          <Text className="text-white text-xs font-JakartaBold">Edit</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Bulk Actions */}
        <View className="bg-white rounded-lg p-4 mb-8">
          <Text className="text-lg font-JakartaBold mb-3">Bulk Actions</Text>

          <View className="space-y-3">
            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">📋</Text>
              <Text className="font-JakartaMedium">Import from CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">📊</Text>
              <Text className="font-JakartaMedium">Export Menu</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-3 bg-general-500 rounded-lg">
              <Text className="text-lg mr-3">🗂️</Text>
              <Text className="font-JakartaMedium">Manage Categories</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MenuManagement;
