import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useMapFlow } from '@/hooks/useMapFlow';

const BUSINESSES = [
  {
    id: '1',
    name: 'Pizza Palace',
    category: 'Italiana',
    rating: 4.5,
    deliveryTime: '25-35 min',
    image: '🍕',
    distance: '1.2 km'
  },
  {
    id: '2',
    name: 'Burger King',
    category: 'Americana',
    rating: 4.2,
    deliveryTime: '20-30 min',
    image: '🍔',
    distance: '0.8 km'
  },
  {
    id: '3',
    name: 'Sushi Express',
    category: 'Japonesa',
    rating: 4.7,
    deliveryTime: '30-40 min',
    image: '🍱',
    distance: '2.1 km'
  }
];

const CATEGORIES = ['Todo', 'Italiana', 'Americana', 'Japonesa', 'Mexicana', 'China'];

const DeliveryBusinessSearch: React.FC = () => {
  const { next } = useMapFlow();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todo');

  const filteredBusinesses = BUSINESSES.filter(business =>
    business.name.toLowerCase().includes(searchText.toLowerCase()) &&
    (selectedCategory === 'Todo' || business.category === selectedCategory)
  );

  return (
    <View className="flex-1">
      <Text className="font-JakartaBold text-xl mb-4 text-center">
        Buscar Restaurante
      </Text>

      {/* Barra de búsqueda */}
      <View className="mb-4">
        <TextInput
          placeholder="Buscar restaurante..."
          value={searchText}
          onChangeText={setSearchText}
          className="bg-gray-50 rounded-lg px-4 py-3 font-Jakarta"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Categorías */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row space-x-2">
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-primary-500'
                  : 'bg-gray-100'
              }`}
            >
              <Text className={`font-JakartaMedium ${
                selectedCategory === category ? 'text-white' : 'text-gray-700'
              }`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Lista de negocios */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="space-y-3">
          {filteredBusinesses.map((business) => (
            <TouchableOpacity
              key={business.id}
              onPress={() => next()}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-3xl mr-3">{business.image}</Text>
                <View className="flex-1">
                  <Text className="font-JakartaBold text-lg text-gray-800">
                    {business.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="font-Jakarta text-sm text-gray-600 mr-2">
                      {business.category}
                    </Text>
                    <Text className="text-yellow-500 mr-1">⭐</Text>
                    <Text className="font-Jakarta text-sm text-gray-600 mr-2">
                      {business.rating}
                    </Text>
                    <Text className="font-Jakarta text-sm text-gray-600">
                      • {business.distance}
                    </Text>
                  </View>
                  <Text className="font-Jakarta text-sm text-gray-500 mt-1">
                    {business.deliveryTime}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredBusinesses.length === 0 && (
          <View className="items-center py-8">
            <Text className="text-4xl mb-4">🔍</Text>
            <Text className="font-JakartaBold text-lg text-gray-600 mb-2">
              No se encontraron resultados
            </Text>
            <Text className="font-Jakarta text-sm text-gray-500 text-center">
              Intenta con otra búsqueda o categoría
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DeliveryBusinessSearch;
