import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";

import { driverTransportService } from "@/app/services/driverTransportService";
import { Button, Card } from "@/components/ui";
import { useUI } from "@/components/UIWrapper";
import FlowHeader from "@/components/unified-flow/FlowHeader";
import { useMapFlow } from "@/hooks/useMapFlow";
import { generateIdempotencyKey } from "@/lib/utils";
import { useRealtimeStore } from "@/store";
import { FLOW_STEPS } from "@/lib/unified-flow/constants";

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
  const { goTo } = useMapFlow();
  const { showSuccess, showError } = useUI();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [cashConfirmed, setCashConfirmed] = useState<boolean>(false);
  const [loadingPaymentInfo, setLoadingPaymentInfo] = useState(true);
  const [finishing, setFinishing] = useState(false);

  const activeRide = useRealtimeStore.getState().activeRide as any;
  const rideId = activeRide?.ride_id || 0;

  // ✅ Load payment information from ride details
  useEffect(() => {
    const loadPaymentInfo = async () => {
      if (!rideId) return;

      try {
        setLoadingPaymentInfo(true);
        
        
        
        // ✅ Obtener detalles completos del ride desde el endpoint
        const [rideDetails, exchangeRateData] = await Promise.all([
          driverTransportService.getRideDetails(rideId),
          driverTransportService.getExchangeRate(), // ✅ Obtener tasa de cambio dinámicamente
        ]);
        
        
        

        // ✅ Usar datos reales del endpoint
        const paymentInfoFromRide: PaymentInfo = {
          totalAmount: rideDetails.pricing.fare,
          paymentMethod: (activeRide?.payment_method as any) || "cash", // TODO: Agregar payment_method al endpoint
          cashRequired: (activeRide?.cash_required as number) || rideDetails.pricing.fare,
          cardPaid: (activeRide?.card_paid as number) || 0,
          fullyPaid: (activeRide?.fully_paid as boolean) || false,
          currency: "USD", // TODO: Agregar currency al endpoint
          exchangeRate: exchangeRateData.rate, // ✅ Dinámico
        };

        

        setPaymentInfo(paymentInfoFromRide);
      } catch (error) {
        
        showError("Error", "No se pudo cargar la información de pago");
        
        // ✅ Fallback: usar datos del activeRide si falla el endpoint
        const exchangeRateFallback = await driverTransportService.getExchangeRate();
        
        const fallbackPaymentInfo: PaymentInfo = {
          totalAmount: activeRide?.fare_price || 0,
          paymentMethod: (activeRide?.payment_method as any) || "cash",
          cashRequired: (activeRide?.cash_required as number) || activeRide?.fare_price || 0,
          cardPaid: (activeRide?.card_paid as number) || 0,
          fullyPaid: (activeRide?.fully_paid as boolean) || false,
          currency: "USD",
          exchangeRate: exchangeRateFallback.rate, // ✅ Dinámico incluso en fallback
        };
        
        setPaymentInfo(fallbackPaymentInfo);
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
    if (
      paymentInfo?.cashRequired &&
      paymentInfo.cashRequired > 0 &&
      !cashConfirmed
    ) {
      showError(
        "Confirmar cobro",
        "Debes confirmar el cobro en efectivo antes de finalizar",
      );
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
      goTo(FLOW_STEPS.DRIVER_FINALIZACION_RATING);
    } catch (error) {
      
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
          <Button
            variant="primary"
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
          <Text className="font-JakartaMedium text-gray-700">
            Total del viaje
          </Text>
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
                <Text className="font-Jakarta text-sm text-gray-600">
                  💳 Pagado por tarjeta
                </Text>
                <Text className="font-Jakarta text-sm">
                  ${paymentInfo.cardPaid.toFixed(2)}
                </Text>
              </View>
            )}
            {paymentInfo.cashRequired > 0 && (
              <View className="flex-row justify-between">
                <Text className="font-Jakarta text-sm text-gray-600">
                  💵 Pendiente en efectivo
                </Text>
                <Text className="font-Jakarta text-sm text-orange-600">
                  ${paymentInfo.cashRequired.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Payment method indicator */}
        <View className="flex-row items-center">
          <Text className="font-Jakarta text-sm text-gray-500 mr-2">
            Método:
          </Text>
          <Text className="font-JakartaMedium">
            {paymentInfo.paymentMethod === "cash" && "💵 Solo efectivo"}
            {paymentInfo.paymentMethod === "card" && "💳 Solo tarjeta"}
            {paymentInfo.paymentMethod === "mixed" &&
              "🔄 Mixto (tarjeta + efectivo)"}
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

          <Button
            variant="success"
            title={finishing ? "Finalizando..." : "🏁 Finalizar servicio"}
            loading={finishing}
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
              Debes confirmar que recibiste el pago de $
              {paymentInfo.cashRequired.toFixed(2)}
              antes de finalizar el servicio.
            </Text>
          </View>

          {!cashConfirmed ? (
            <Button
              variant="danger"
              title="✅ Confirmar cobro en efectivo"
              onPress={handleConfirmCash}
              className="w-full"
            />
          ) : (
            <Card className="bg-green-50 border-green-200">
              <Text className="font-JakartaMedium text-green-800 text-center">
                ✅ Cobro confirmado
              </Text>
            </Card>
          )}

          <Button
            variant={cashConfirmed ? "success" : "secondary"}
            title={finishing ? "Finalizando..." : "🏁 Finalizar servicio"}
            loading={finishing}
            onPress={handleFinish}
            disabled={!cashConfirmed}
            className="w-full"
          />
        </View>
      );
    }

    // Fallback for other cases
    return (
      <Button
        variant="success"
        title={finishing ? "Finalizando..." : "🏁 Finalizar servicio"}
        loading={finishing}
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
          <Text className="font-JakartaBold text-lg mb-2">
            Resumen del viaje
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="font-Jakarta text-gray-600">Cliente</Text>
            <Text className="font-JakartaMedium">
              {activeRide?.passenger?.name || "Cliente"}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-Jakarta text-gray-600">Destino</Text>
            <Text
              className="font-JakartaMedium text-right flex-1 ml-2"
              numberOfLines={2}
            >
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
