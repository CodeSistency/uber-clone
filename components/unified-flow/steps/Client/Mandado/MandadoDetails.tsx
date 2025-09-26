import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";

import { Button, TextField, Card } from "@/components/ui";
import { useMapFlow } from "@/hooks/useMapFlow";

import FlowHeader from "../../../FlowHeader";

const MandadoDetails: React.FC = () => {
  const { next, back } = useMapFlow();
  const [description, setDescription] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [productType, setProductType] = useState("");

  const PRODUCT_TYPES = [
    { id: "documents", label: "Documentos", icon: "📄" },
    { id: "medicine", label: "Medicina", icon: "💊" },
    { id: "food", label: "Comida", icon: "🍽️" },
    { id: "electronics", label: "Electrónicos", icon: "📱" },
    { id: "clothing", label: "Ropa", icon: "👕" },
    { id: "other", label: "Otro", icon: "📦" },
  ];

  const isFormValid =
    description.trim() &&
    pickupAddress.trim() &&
    deliveryAddress.trim() &&
    productType;

  return (
    <View className="flex-1">
      <FlowHeader title="Detalles del Mandado" onBack={back} />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Descripción del mandado */}
        <View className="mb-4">
          <TextField
            label="Descripción del mandado *"
            placeholder="Ej: Comprar una medicina en la farmacia X"
            value={description}
            onChangeText={setDescription}
            multiline
            className="min-h-[80px]"
          />
        </View>

        {/* Dirección de recogida */}
        <View className="mb-4">
          <Button
            variant="outline"
            title={pickupAddress || "Seleccionar ubicación de recogida"}
            className="bg-gray-50 rounded-lg px-4 py-3 justify-start"
          />
        </View>

        {/* Dirección de entrega */}
        <View className="mb-4">
          <Button
            variant="outline"
            title={deliveryAddress || "Seleccionar ubicación de entrega"}
            className="bg-gray-50 rounded-lg px-4 py-3 justify-start"
          />
        </View>

        {/* Tipo de producto */}
        <View className="mb-4">
          <Text className="font-JakartaBold text-sm text-gray-700 mb-3">
            Tipo de producto *
          </Text>
          <View className="flex-row flex-wrap">
            {PRODUCT_TYPES.map((type) => (
              <Button
                key={type.id}
                variant={productType === type.id ? "primary" : "outline"}
                title={`${type.icon} ${type.label}`}
                onPress={() => setProductType(type.id)}
                className="flex-row items-center mr-2 mb-2 px-3 py-2 rounded-full"
              />
            ))}
          </View>
        </View>

        {/* Lista de artículos (opcional) */}
        <View className="mb-4">
          <Text className="font-JakartaBold text-sm text-gray-700 mb-2">
            Lista de artículos (opcional)
          </Text>
          <Button
            variant="outline"
            title="+ Agregar artículo"
            className="bg-gray-50 rounded-lg px-4 py-3 border-2 border-dashed border-gray-300"
          />
        </View>

        {/* Información adicional */}
        <Card className="bg-blue-50 mb-4">
          <Text className="font-JakartaBold text-sm text-blue-800 mb-2">
            💡 Información útil
          </Text>
          <Text className="font-Jakarta text-xs text-blue-700 leading-5">
            • Sé específico en la descripción para ayudar al conductor{"\n"}•
            Incluye referencias claras para las direcciones{"\n"}• El precio
            final puede variar según el costo de los productos
          </Text>
        </Card>
      </ScrollView>

      <Button
        variant={isFormValid ? "primary" : "secondary"}
        title="Continuar"
        onPress={() => isFormValid && next()}
        disabled={!isFormValid}
        className="rounded-lg p-4 mt-4"
      />
    </View>
  );
};

export default MandadoDetails;
