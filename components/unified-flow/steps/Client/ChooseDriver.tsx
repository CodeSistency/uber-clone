import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";

import { transportClient } from "@/app/services/flowClientService";
import DriverCard from "@/components/DriverCard";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import { useDriverStore, usePaymentStore } from "@/store";
import { FLOW_STEPS } from "@/store/mapFlow/mapFlow";
import { mapPaymentMethodToAPI, validatePaymentMethod, SplitPayment, createSplitPayment } from "@/lib/paymentValidation";

import FlowHeader from "../../FlowHeader";

const ChooseDriver: React.FC = () => {
  const { back, goTo, rideId } = useMapFlow() as any;
  const { withUI, showSuccess, showError } = useUI();
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  const paymentStore = usePaymentStore();

  // Estados de pago
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>(null);
  const [multiplePayments, setMultiplePayments] = React.useState<SplitPayment[]>([]);
  const [paymentMode, setPaymentMode] = React.useState<"single" | "multiple">("single");
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);

  // Monto estimado del viaje (en una app real vendría del backend)
  const estimatedFare = 25.50;

  // Validaciones
  const paymentValidation = validatePaymentMethod(paymentMethod || "");
  const canContinue =
    selectedDriver !== null &&
    !isProcessingPayment &&
    (paymentMode === "single" ? paymentValidation.isValid : multiplePayments.length > 0);

  // Verificar si ya existe un grupo de pagos activo para este servicio
  const existingGroup = paymentStore.getActiveGroup(rideId || 101, "ride");

  React.useEffect(() => {
    if (existingGroup) {
      console.log("[ChooseDriver] Found existing payment group:", existingGroup.groupId);
      // Podríamos mostrar información del grupo existente aquí
    }
  }, [existingGroup]);

  // Función para manejar cambio de modo de pago
  const handlePaymentModeChange = (newMode: "single" | "multiple") => {
    setPaymentMode(newMode);

    // Resetear estados cuando cambie el modo
    if (newMode === "single") {
      setMultiplePayments([]);
    } else {
      setPaymentMethod(null);
    }

    console.log("[ChooseDriver] Payment mode changed to:", newMode);
  };

  // Función para manejar la confirmación de pagos
  const handlePaymentConfirmation = async () => {
    if (!canContinue) return;

    const id = rideId || 101;
    setIsProcessingPayment(true);

    try {
      // Paso 1: Solicitar conductor
      await withUI(() => transportClient.requestDriver(id), {
        loadingMessage: "Buscando conductor...",
      });

      // Paso 2: Confirmar pago según el modo seleccionado
      if (paymentMode === "single") {
        // Pago único tradicional
        const paymentData = mapPaymentMethodToAPI(paymentMethod!);
        await withUI(
          () => transportClient.confirmPayment(id, paymentData),
          { loadingMessage: "Confirmando pago..." }
        );

        showSuccess("¡Pago confirmado!", "Tu conductor está en camino");
      } else {
        // Pago múltiple nuevo
        if (multiplePayments.length === 0) {
          throw new Error("No se han configurado pagos múltiples");
        }

        console.log("[ChooseDriver] Processing multiple payments:", multiplePayments);

        // Convertir SplitPayment a PaymentMethod para la API
        const paymentMethods = multiplePayments.map(payment => ({
          method: payment.method,
          amount: payment.amount,
          bankCode: payment.bankCode,
          description: payment.description,
        }));

        // Crear grupo de pagos múltiples
        const paymentGroup = await paymentStore.createPaymentGroup({
          serviceType: "ride",
          serviceId: id,
          totalAmount: estimatedFare,
          payments: paymentMethods,
        });

        if (paymentGroup.success) {
          showSuccess(
            "¡Pagos configurados!",
            `Grupo ${paymentGroup.groupId} creado con ${multiplePayments.length} métodos`
          );

          console.log("[ChooseDriver] Payment group created:", paymentGroup.groupId);
        } else {
          throw new Error("Error al crear grupo de pagos");
        }
      }

      // Paso 3: Continuar con el flujo
      goTo(FLOW_STEPS.CUSTOMER_TRANSPORT.GESTION_CONFIRMACION);

    } catch (error: any) {
      console.error("[ChooseDriver] Payment confirmation error:", error);
      const errorMessage = error?.message || "Error al procesar el pago";
      showError("Error de pago", errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <View className="flex-1">
      <FlowHeader
        title="Elige conductor"
        subtitle="Selecciona un conductor y tu método de pago"
        onBack={back}
      />

      <PaymentMethodSelector
        selectedMethodId={paymentMethod}
        onSelectMethod={setPaymentMethod}
        className="mt-1"
        enableMultiplePayments={true}
        totalAmount={estimatedFare}
        serviceType="ride"
        serviceId={rideId || 101}
        onMultiplePaymentSelect={setMultiplePayments}
        paymentMode={paymentMode}
        onPaymentModeChange={handlePaymentModeChange}
      />

      <Text className="font-JakartaBold text-base text-gray-700 px-5 mb-2">
        Conductores disponibles
      </Text>
      <FlatList
        data={drivers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <DriverCard
            item={item}
            selected={selectedDriver as any}
            setSelected={() => setSelectedDriver(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-10">
            <Text className="text-gray-500 font-Jakarta">
              Cargando conductores cerca...
            </Text>
          </View>
        )}
      />

      <View className="px-5 pb-4">
        {/* Mostrar información del grupo de pagos existente si existe */}
        {existingGroup && (
          <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
            <Text className="text-sm font-JakartaMedium text-blue-700 dark:text-blue-300">
              💰 Grupo de pagos activo encontrado
            </Text>
            <Text className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Progreso: {existingGroup.progress}% completado
            </Text>
          </View>
        )}

        {/* Indicador de procesamiento */}
        {isProcessingPayment && (
          <View className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-3">
            <Text className="text-sm font-JakartaMedium text-orange-700 dark:text-orange-300">
              🔄 Procesando pago...
            </Text>
          </View>
        )}

        {/* Error de pago */}
        {paymentStore.error && (
          <View className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-3">
            <Text className="text-sm font-JakartaMedium text-red-700 dark:text-red-300">
              ❌ Error: {paymentStore.error}
            </Text>
          </View>
        )}

        <TouchableOpacity
          disabled={!canContinue}
          onPress={handlePaymentConfirmation}
          className={`rounded-xl p-4 ${canContinue ? "bg-primary-500" : "bg-gray-300"}`}
          activeOpacity={0.8}
        >
          <Text className="text-white font-JakartaBold text-center">
            {paymentMode === "multiple" ? "Confirmar pagos múltiples" : "Confirmar y continuar"}
          </Text>
          {paymentMode === "multiple" && multiplePayments.length > 0 && (
            <Text className="text-white/80 font-JakartaMedium text-sm text-center mt-1">
              {multiplePayments.length} método{multiplePayments.length !== 1 ? 's' : ''} • ${estimatedFare.toFixed(2)}
            </Text>
          )}
          {isProcessingPayment && (
            <Text className="text-white/60 font-JakartaMedium text-xs text-center mt-1">
              Procesando...
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChooseDriver;
