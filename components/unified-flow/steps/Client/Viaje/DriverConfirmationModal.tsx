import { Star } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
} from "react-native";

import { Button, TextField, Card } from "@/components/ui";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";

interface DriverData {
  id: number;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  car_model: string;
  license_plate: string;
  car_seats: number;
  rating: number;
  time: number;
  price: string;
  distance: string;
}

interface DriverConfirmationModalProps {
  visible: boolean;
  driver: DriverData | null;
  onConfirm: () => void;
  onFindAnother: () => void;
  onClose: () => void;
  isConfirming?: boolean;
}

const DriverConfirmationModal: React.FC<DriverConfirmationModalProps> = ({
  visible,
  driver,
  onConfirm,
  onFindAnother,
  onClose,
  isConfirming = false,
}) => {
  const { showError, showSuccess } = useUI();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!driver || isProcessing) return;

    setIsProcessing(true);
    try {
      
      await onConfirm();
      showSuccess("¡Conductor confirmado!", "Esperando aceptación...");
    } catch (error: any) {
      
      showError("Error", error.message || "No se pudo confirmar el conductor");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFindAnother = async () => {
    if (isProcessing) return;

    try {
      
      await onFindAnother();
    } catch (error: any) {
      
      showError("Error", "No se pudo buscar otro conductor");
    }
  };

  if (!driver) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[85%]">
          {/* Header con drag handle */}
          <View className="items-center py-3">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Driver Card */}
            <View className="px-6 pb-6">
              <View className="bg-gray-50 rounded-2xl p-6 mb-6">
                {/* Header */}
                <View className="flex-row items-center mb-4">
                  <View className="w-16 h-16 bg-gray-300 rounded-full mr-4 overflow-hidden">
                    <Image
                      source={{ uri: driver.profile_image_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-JakartaBold text-xl text-gray-800">
                      {driver.first_name} {driver.last_name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Star size={16} color="#F59E0B" fill="#F59E0B" />
                      <Text className="font-JakartaMedium text-gray-700 ml-1">
                        {driver.rating.toFixed(1)}
                      </Text>
                      <Text className="font-Jakarta text-gray-500 ml-1">
                        ({Math.floor(Math.random() * 500) + 100} viajes)
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Car Info */}
                <View className="bg-white rounded-xl p-4 mb-4">
                  <Text className="font-JakartaBold text-gray-800 mb-2">
                    Vehículo
                  </Text>
                  <View className="flex-row justify-between">
                    <View>
                      <Text className="font-JakartaMedium text-gray-700">
                        🚗 {driver.car_model}
                      </Text>
                      <Text className="font-Jakarta text-gray-600 text-sm mt-1">
                        📋 {driver.license_plate}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-JakartaMedium text-gray-700">
                        👥 {driver.car_seats} asientos
                      </Text>
                      <Text className="font-Jakarta text-gray-600 text-sm mt-1">
                        📍 {driver.distance} de distancia
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Trip Info */}
                <View className="bg-white rounded-xl p-4">
                  <Text className="font-JakartaBold text-gray-800 mb-3">
                    Detalles del viaje
                  </Text>
                  <View className="space-y-3">
                    <View className="flex-row justify-between">
                      <Text className="font-Jakarta text-gray-600">
                        Tiempo de llegada
                      </Text>
                      <Text className="font-JakartaBold text-primary-600">
                        {driver.time} min
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="font-Jakarta text-gray-600">
                        Tarifa estimada
                      </Text>
                      <Text className="font-JakartaBold text-green-600">
                        {driver.price}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="font-Jakarta text-gray-600">
                        Método de pago
                      </Text>
                      <Text className="font-JakartaMedium text-gray-700">
                        Ya configurado ✓
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Safety Notice */}
              <View className="bg-blue-50 rounded-xl p-4 mb-6">
                <Text className="font-JakartaBold text-blue-800 mb-2">
                  🛡️ Viaje Seguro
                </Text>
                <Text className="font-Jakarta text-blue-700 text-sm">
                  • Compartiremos tu ubicación en tiempo real{"\n"}• Información
                  de contacto verificada{"\n"}• Puedes cancelar en cualquier
                  momento
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="space-y-3">
                <Button
                  variant={
                    isProcessing || isConfirming ? "secondary" : "primary"
                  }
                  title={
                    isProcessing || isConfirming
                      ? "Confirmando..."
                      : "✅ Confirmar conductor"
                  }
                  onPress={handleConfirm}
                  disabled={isProcessing || isConfirming}
                  className="rounded-xl p-4"
                />

                <Button
                  variant="outline"
                  title="🔄 Buscar otro conductor"
                  onPress={handleFindAnother}
                  disabled={isProcessing || isConfirming}
                  className="rounded-xl p-4"
                />

                <Button
                  variant="ghost"
                  title="Más tarde"
                  onPress={onClose}
                  className="rounded-xl p-3"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default DriverConfirmationModal;
