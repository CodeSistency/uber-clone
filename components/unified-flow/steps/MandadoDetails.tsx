import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useMapFlow } from '@/hooks/useMapFlow';
import FlowHeader from '../FlowHeader';

const MandadoDetails: React.FC = () => {
  const { next, back } = useMapFlow();
  const [description, setDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [productType, setProductType] = useState('');

  const PRODUCT_TYPES = [
    { id: 'documents', label: 'Documentos', icon: '📄' },
    { id: 'medicine', label: 'Medicina', icon: '💊' },
    { id: 'food', label: 'Comida', icon: '🍽️' },
    { id: 'electronics', label: 'Electrónicos', icon: '📱' },
    { id: 'clothing', label: 'Ropa', icon: '👕' },
    { id: 'other', label: 'Otro', icon: '📦' }
  ];

  const isFormValid = description.trim() && pickupAddress.trim() && deliveryAddress.trim() && productType;

  return (
    <View className="flex-1">
      <FlowHeader
        title="Detalles del Mandado"
        onBack={back}
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Descripción del mandado */}
        <View className="mb-4">
          <Text className="font-JakartaBold text-sm text-gray-700 mb-2">
            Descripción del mandado *
          </Text>
          <TextInput
            placeholder="Ej: Comprar una medicina en la farmacia X"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            className="bg-gray-50 rounded-lg px-4 py-3 font-Jakarta min-h-[80px]"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
        </View>

        {/* Dirección de recogida */}
        <View className="mb-4">
          <Text className="font-JakartaBold text-sm text-gray-700 mb-2">
            Dirección de recogida *
          </Text>
          <TouchableOpacity className="bg-gray-50 rounded-lg px-4 py-3">
            <Text className="font-Jakarta text-gray-700">
              {pickupAddress || 'Seleccionar ubicación de recogida'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dirección de entrega */}
        <View className="mb-4">
          <Text className="font-JakartaBold text-sm text-gray-700 mb-2">
            Dirección de entrega *
          </Text>
          <TouchableOpacity className="bg-gray-50 rounded-lg px-4 py-3">
            <Text className="font-Jakarta text-gray-700">
              {deliveryAddress || 'Seleccionar ubicación de entrega'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tipo de producto */}
        <View className="mb-4">
          <Text className="font-JakartaBold text-sm text-gray-700 mb-3">
            Tipo de producto *
          </Text>
          <View className="flex-row flex-wrap">
            {PRODUCT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setProductType(type.id)}
                className={`flex-row items-center mr-2 mb-2 px-3 py-2 rounded-full border ${
                  productType === type.id
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text className="mr-2">{type.icon}</Text>
                <Text className={`font-JakartaMedium text-sm ${
                  productType === type.id ? 'text-white' : 'text-gray-700'
                }`}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Lista de artículos (opcional) */}
        <View className="mb-4">
          <Text className="font-JakartaBold text-sm text-gray-700 mb-2">
            Lista de artículos (opcional)
          </Text>
          <TouchableOpacity className="bg-gray-50 rounded-lg px-4 py-3 border-2 border-dashed border-gray-300">
            <Text className="font-Jakarta text-gray-500 text-center">
              + Agregar artículo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View className="bg-blue-50 rounded-lg p-4 mb-4">
          <Text className="font-JakartaBold text-sm text-blue-800 mb-2">
            💡 Información útil
          </Text>
          <Text className="font-Jakarta text-xs text-blue-700 leading-5">
            • Sé específico en la descripción para ayudar al conductor{'\n'}
            • Incluye referencias claras para las direcciones{'\n'}
            • El precio final puede variar según el costo de los productos
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => isFormValid && next()}
        disabled={!isFormValid}
        className={`rounded-lg p-4 mt-4 ${
          isFormValid ? 'bg-primary-500' : 'bg-gray-300'
        }`}
      >
        <Text className="text-white font-JakartaBold text-center">
          Continuar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MandadoDetails;
