import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";

import CustomButton from "@/components/CustomButton";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

interface EarningsSummary {
  tripFare: number;
  tips: number;
  totalEarnings: number;
  currency: "USD" | "VES";
  exchangeRate?: number;
  convertedAmount?: number;
  tripCount: number;
  todayEarnings: number;
}

const DriverTransportEarnings: React.FC = () => {
  const { startWithDriverStep } = useMapFlow();
  const { showSuccess } = useUI();
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const activeRide = useRealtimeStore.getState().activeRide as any;

  useEffect(() => {
    const calculateEarnings = async () => {
      try {
        setLoading(true);

        // Calculate trip earnings
        const tripFare = activeRide?.fare_price || 0;
        const tips = activeRide?.tip_amount || 0;
        const totalEarnings = tripFare + tips;

        // Mock additional data (in real app, this would come from backend)
        const summary: EarningsSummary = {
          tripFare,
          tips,
          totalEarnings,
          currency: "USD",
          exchangeRate: 35.5, // Bs per USD
          convertedAmount: totalEarnings * 35.5,
          tripCount: 1, // This trip
          todayEarnings: totalEarnings, // Assuming this is today's total
        };

        setEarnings(summary);

        // Clear active ride
        useRealtimeStore.getState().setActiveRide(null);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    calculateEarnings();
  }, []);

  const handleContinue = () => {
    showSuccess("¡Listo para nuevos viajes!", "Volviendo a estar disponible");
    startWithDriverStep(FLOW_STEPS.DRIVER_DISPONIBILIDAD);
  };

  const convertToBs = (usdAmount: number): string => {
    if (!earnings?.exchangeRate) return "";
    return (usdAmount * earnings.exchangeRate).toFixed(2);
  };

  if (loading) {
    return (
      <View className="flex-1">
        <FlowHeader title="Calculando ganancias..." />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="font-JakartaMedium text-lg text-gray-600">
            Procesando información del viaje...
          </Text>
        </View>
      </View>
    );
  }

  if (!earnings) {
    return (
      <View className="flex-1">
        <FlowHeader title="Error" />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="font-JakartaMedium text-lg text-gray-600 mb-4">
            No se pudieron calcular las ganancias
          </Text>
          <CustomButton
            title="Continuar"
            onPress={handleContinue}
            className="w-full"
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlowHeader title="Resumen de ganancias" />

      <ScrollView className="flex-1 p-6">
        {/* Success message */}
        <View className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
          <Text className="font-JakartaBold text-green-800 text-center mb-1">
            ✅ Viaje completado exitosamente
          </Text>
          <Text className="font-Jakarta text-sm text-green-700 text-center">
            Gracias por proporcionar un excelente servicio
          </Text>
        </View>

        {/* Earnings breakdown */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="font-JakartaBold text-lg mb-3">
            Ganancias del viaje
          </Text>

          {/* Trip fare */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-Jakarta text-gray-600">Tarifa del viaje</Text>
            <Text className="font-JakartaMedium">
              ${earnings.tripFare.toFixed(2)}
            </Text>
          </View>

          {/* Tips */}
          {earnings.tips > 0 && (
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-Jakarta text-gray-600">💝 Propina</Text>
              <Text className="font-JakartaMedium text-green-600">
                +${earnings.tips.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Total */}
          <View className="border-t border-gray-200 pt-2 mt-2">
            <View className="flex-row justify-between items-center">
              <Text className="font-JakartaBold text-gray-800">
                Total ganado
              </Text>
              <View className="items-end">
                <Text className="font-JakartaBold text-xl text-green-600">
                  ${earnings.totalEarnings.toFixed(2)}
                </Text>
                {earnings.currency === "USD" && earnings.exchangeRate && (
                  <Text className="font-Jakarta text-sm text-gray-500">
                    ≈ Bs. {convertToBs(earnings.totalEarnings)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Today's summary */}
        <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <Text className="font-JakartaBold text-blue-800 mb-2">
            📊 Resumen del día
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="font-Jakarta text-sm text-blue-700">
              Viajes completados
            </Text>
            <Text className="font-JakartaMedium text-sm text-blue-800">
              {earnings.tripCount}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-Jakarta text-sm text-blue-700">
              Ganancias totales
            </Text>
            <Text className="font-JakartaBold text-blue-800">
              ${earnings.todayEarnings.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Performance tips */}
        <View className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
          <Text className="font-JakartaMedium text-yellow-800 mb-2">
            💡 Consejos para ganar más
          </Text>
          <Text className="font-Jakarta text-xs text-yellow-700">
            • Mantén altas calificaciones para recibir mejores viajes{"\n"}•
            Acepta viajes durante horas pico{"\n"}• Ofrece un servicio excelente
            para recibir propinas
          </Text>
        </View>

        {/* Continue button */}
        <CustomButton
          title="🚗 Buscar nuevos viajes"
          bgVariant="primary"
          onPress={handleContinue}
          className="w-full mb-4"
        />

        {/* Additional info */}
        <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <Text className="font-JakartaMedium text-gray-800 mb-1">
            📝 Información importante
          </Text>
          <Text className="font-Jakarta text-xs text-gray-600">
            Los fondos estarán disponibles en tu cuenta dentro de las próximas
            24-48 horas. Puedes ver el detalle completo en tu panel de
            ganancias.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DriverTransportEarnings;
