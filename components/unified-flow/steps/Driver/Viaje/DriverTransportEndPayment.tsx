import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";

import { driverTransportService } from "@/app/services/driverTransportService";
import CustomButton from "@/components/CustomButton";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";

interface PaymentInfo {
  totalAmount: number;
  paymentMethod: "cash" | "card" | "mixed" | null;
  cashRequired: number;
  cardPaid: number;
  fullyPaid: boolean;
  currency: "USD" | "VES";
  exchangeRate?: number;
}

const DriverTransportEndPayment: React.FC = () => {
  const { startWithDriverStep } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [cashConfirmed, setCashConfirmed] = useState<boolean>(false);
  const [loadingPaymentInfo, setLoadingPaymentInfo] = useState(true);
  const [finishing, setFinishing] = useState(false);

  const activeRide = useRealtimeStore.getState().activeRide as any;
  const rideId = activeRide?.ride_id || 0;

  // Load payment information
  useEffect(() => {
    const loadPaymentInfo = async () => {
      if (!rideId) return;

      try {
        setLoadingPaymentInfo(true);
        // In a real implementation, this would come from the backend
        // For now, we'll simulate based on ride data
        const mockPaymentInfo: PaymentInfo = {
          totalAmount: activeRide?.fare_price || 8.20,
          paymentMethod: activeRide?.payment_method || "cash", // This should come from backend
          cashRequired: activeRide?.cash_required || (activeRide?.fare_price || 8.20),
          cardPaid: activeRide?.card_paid || 0,
          fullyPaid: activeRide?.fully_paid || false,
          currency: "USD", // Could be dynamic
          exchangeRate: 35.5, // Bs per USD
        };

        setPaymentInfo(mockPaymentInfo);
      } catch (error) {
        console.error("[DriverTransportEndPayment] Error loading payment info:", error);
        showError("Error", "No se pudo cargar la información de pago");
      } finally {
        setLoadingPaymentInfo(false);
      }
    };

    loadPaymentInfo();
  }, [rideId]);

  const handleConfirmCash = () => {
    setCashConfirmed(true);
    showSuccess("Cobro confirmado", "Pago en efectivo registrado");
  };

  const convertToBs = (usdAmount: number): string => {
    if (!paymentInfo?.exchangeRate) return "";
    return (usdAmount * paymentInfo.exchangeRate).toFixed(2);
  };

  const handleFinish = async () => {
    if (finishing) return;

    // Check if cash payment is required and not confirmed
    if (paymentInfo?.cashRequired && paymentInfo.cashRequired > 0 && !cashConfirmed) {
      showError("Confirmar cobro", "Debes confirmar el cobro en efectivo antes de finalizar");
      return;
    }

    setFinishing(true);
    try {
      await driverTransportService.complete(
        rideId,
        paymentInfo?.totalAmount || 0,
        generateIdempotencyKey(),
      );

      showSuccess("¡Viaje completado!", "Pago registrado correctamente");

      // Go to transport-specific rating step
      goTo(FLOW_STEPS.DRIVER_FINALIZACION_RATING as any);
    } catch (error) {
      console.error("[DriverTransportEndPayment] Error completing ride:", error);
      showError("Error", "No se pudo completar el viaje");
    } finally {
      setFinishing(false);
    }
  };

  if (loadingPaymentInfo) {
    return (
      <View className="flex-1">
        <FlowHeader title="Cargando información de pago..." />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="font-JakartaMedium text-lg text-gray-600">
            Verificando estado de pagos...
          </Text>
        </View>
      </View>
    );
  }

  if (!paymentInfo) {
    return (
      <View className="flex-1">
        <FlowHeader title="Error de pago" />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="font-JakartaMedium text-lg text-gray-600 mb-4">
            No se pudo cargar la información de pago
          </Text>
          <CustomButton
            title="Reintentar"
            onPress={() => window.location.reload()}
            className="w-full"
          />
        </View>
      </View>
    );
  }

  const renderPaymentSummary = () => {
    return (
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="font-JakartaBold text-lg mb-3">Resumen de pago</Text>

        {/* Total amount */}
        <View className="flex-row justify-between items-center mb-3 p-3 bg-gray-50 rounded-lg">
          <Text className="font-JakartaMedium text-gray-700">Total del viaje</Text>
          <View className="items-end">
            <Text className="font-JakartaBold text-xl text-green-600">
              ${paymentInfo.totalAmount.toFixed(2)}
            </Text>
            {paymentInfo.currency === "USD" && paymentInfo.exchangeRate && (
              <Text className="font-Jakarta text-sm text-gray-500">
                ≈ Bs. {convertToBs(paymentInfo.totalAmount)}
              </Text>
            )}
          </View>
        </View>

        {/* Payment breakdown */}
        {paymentInfo.paymentMethod === "mixed" && (
          <View className="mb-3">
            {paymentInfo.cardPaid > 0 && (
              <View className="flex-row justify-between mb-1">
                <Text className="font-Jakarta text-sm text-gray-600">💳 Pagado por tarjeta</Text>
                <Text className="font-Jakarta text-sm">${paymentInfo.cardPaid.toFixed(2)}</Text>
              </View>
            )}
            {paymentInfo.cashRequired > 0 && (
              <View className="flex-row justify-between">
                <Text className="font-Jakarta text-sm text-gray-600">💵 Pendiente en efectivo</Text>
                <Text className="font-Jakarta text-sm text-orange-600">
                  ${paymentInfo.cashRequired.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Payment method indicator */}
        <View className="flex-row items-center">
          <Text className="font-Jakarta text-sm text-gray-500 mr-2">Método:</Text>
          <Text className="font-JakartaMedium">
            {paymentInfo.paymentMethod === "cash" && "💵 Solo efectivo"}
            {paymentInfo.paymentMethod === "card" && "💳 Solo tarjeta"}
            {paymentInfo.paymentMethod === "mixed" && "🔄 Mixto (tarjeta + efectivo)"}
            {!paymentInfo.paymentMethod && "❓ Por determinar"}
          </Text>
        </View>
      </View>
    );
  };

  const renderPaymentActions = () => {
    // If fully paid (no cash required), just show finalize button
    if (paymentInfo.fullyPaid || paymentInfo.cashRequired === 0) {
      return (
        <View className="space-y-3">
          <View className="bg-green-50 p-4 rounded-lg border border-green-200">
            <Text className="font-JakartaMedium text-green-800 text-center">
              ✅ Pago completado
            </Text>
            <Text className="font-Jakarta text-sm text-green-700 text-center mt-1">
              El cliente ya realizó el pago completo
            </Text>
          </View>

          <CustomButton
            title={finishing ? "Finalizando..." : "🏁 Finalizar servicio"}
            loading={finishing}
            bgVariant="success"
            onPress={handleFinish}
            className="w-full"
          />
        </View>
      );
    }

    // If cash is required, show cash confirmation
    if (paymentInfo.cashRequired > 0) {
      return (
        <View className="space-y-3">
          <View className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <Text className="font-JakartaMedium text-orange-800 mb-2">
              💵 Cobro pendiente en efectivo
            </Text>
            <Text className="font-Jakarta text-sm text-orange-700">
              Debes confirmar que recibiste el pago de ${paymentInfo.cashRequired.toFixed(2)}
              antes de finalizar el servicio.
            </Text>
          </View>

          {!cashConfirmed ? (
            <CustomButton
              title="✅ Confirmar cobro en efectivo"
              bgVariant="warning"
              onPress={handleConfirmCash}
              className="w-full"
            />
          ) : (
            <View className="bg-green-50 p-4 rounded-lg border border-green-200">
              <Text className="font-JakartaMedium text-green-800 text-center">
                ✅ Cobro confirmado
              </Text>
            </View>
          )}

          <CustomButton
            title={finishing ? "Finalizando..." : "🏁 Finalizar servicio"}
            loading={finishing}
            bgVariant={cashConfirmed ? "success" : "outline"}
            onPress={handleFinish}
            disabled={!cashConfirmed}
            className="w-full"
          />
        </View>
      );
    }

    // Fallback for other cases
    return (
      <CustomButton
        title={finishing ? "Finalizando..." : "🏁 Finalizar servicio"}
        loading={finishing}
        bgVariant="success"
        onPress={handleFinish}
        className="w-full"
      />
    );
  };

  return (
    <View className="flex-1">
      <FlowHeader title="Completar viaje" />

      <ScrollView className="flex-1 p-6">
        {/* Trip summary */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="font-JakartaBold text-lg mb-2">Resumen del viaje</Text>
          <View className="flex-row justify-between mb-1">
            <Text className="font-Jakarta text-gray-600">Cliente</Text>
            <Text className="font-JakartaMedium">{activeRide?.passenger?.name || "Cliente"}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-Jakarta text-gray-600">Destino</Text>
            <Text className="font-JakartaMedium text-right flex-1 ml-2" numberOfLines={2}>
              {activeRide?.destination_address || "Destino"}
            </Text>
          </View>
        </View>

        {/* Payment information */}
        {renderPaymentSummary()}

        {/* Payment actions */}
        {renderPaymentActions()}

        {/* Information note */}
        <View className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Text className="font-JakartaMedium text-sm text-blue-800 mb-1">
            💡 Información importante
          </Text>
          <Text className="font-Jakarta text-xs text-blue-700">
            Una vez que finalices el servicio, podrás calificar al cliente y
            volver a estar disponible para nuevos viajes.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DriverTransportEndPayment;
