import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";

import { transportClient } from "@/app/services/flowClientService";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { useUI } from "@/components/UIWrapper";
import { useMapFlow } from "@/hooks/useMapFlow";
import {
  mapPaymentMethodToAPI,
  validatePaymentMethod,
  SplitPayment,
  createSplitPayment,
} from "@/lib/paymentValidation";
import { usePaymentStore } from "@/store";

import FlowHeader from "../../../FlowHeader";

const PaymentMethodology: React.FC = () => {
  const { next, back, rideId } = useMapFlow() as any;
  const { withUI, showSuccess, showError } = useUI();
  const paymentStore = usePaymentStore();

  // Estados de pago
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [multiplePayments, setMultiplePayments] = useState<SplitPayment[]>([]);
  const [paymentMode, setPaymentMode] = useState<"single" | "multiple">(
    "single",
  );
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Monto estimado del viaje (debería venir de la selección de vehículo)
  const estimatedFare = 25.5;

  // Validaciones
  const paymentValidation = validatePaymentMethod(paymentMethod || "");
  const canContinue =
    !isProcessingPayment &&
    (paymentMode === "single"
      ? paymentValidation.isValid
      : multiplePayments.length > 0);

  // Función para manejar cambio de modo de pago
  const handlePaymentModeChange = (newMode: "single" | "multiple") => {
    setPaymentMode(newMode);

    // Resetear estados cuando cambie el modo
    if (newMode === "single") {
      setMultiplePayments([]);
    } else {
      setPaymentMethod(null);
    }

    console.log("[PaymentMethodology] Payment mode changed to:", newMode);
  };

  // Función para manejar la confirmación de pagos
  const handlePaymentConfirmation = async () => {
    if (!canContinue) return;

    const id = rideId || 101;
    setIsProcessingPayment(true);

    try {
      // Confirmar pago según el modo seleccionado
      if (paymentMode === "single") {
        // 🆕 Pago único usando nuevos endpoints
        const paymentData = mapPaymentMethodToAPI(paymentMethod!);

        // Convertir a formato de nuevos endpoints
        const singlePaymentData = {
          totalAmount: estimatedFare,
          payments: [
            {
              method: paymentData.method as
                | "transfer"
                | "pago_movil"
                | "zelle"
                | "bitcoin"
                | "cash",
              amount: estimatedFare,
              bankCode: paymentData.method === "card" ? "0102" : undefined, // Default bank
            },
          ],
        };

        const result = await paymentStore.payRideWithMultipleMethods(
          id,
          singlePaymentData,
        );

        if (result.data.status === "complete") {
          showSuccess(
            "¡Pago completado!",
            "Ahora buscaremos un conductor para ti",
          );
        } else {
          // Pago electrónico - mostrar referencias si existen
          showSuccess(
            "¡Pago configurado!",
            "Completa el pago electrónico para continuar",
          );
        }
      } else {
        // 🆕 Pago múltiple usando nuevos endpoints
        if (multiplePayments.length === 0) {
          throw new Error("No se han configurado pagos múltiples");
        }

        console.log(
          "[PaymentMethodology] Processing multiple payments:",
          multiplePayments,
        );

        // Convertir SplitPayment a formato de nuevos endpoints
        const paymentMethods = multiplePayments.map((payment) => ({
          method: payment.method as
            | "transfer"
            | "pago_movil"
            | "zelle"
            | "bitcoin"
            | "cash",
          amount: payment.amount,
          bankCode: payment.bankCode,
        }));

        const result = await paymentStore.payRideWithMultipleMethods(id, {
          totalAmount: estimatedFare,
          payments: paymentMethods,
        });

        if (result.data.status === "complete") {
          showSuccess(
            "¡Pago completado!",
            "Ahora buscaremos un conductor para ti",
          );
        } else {
          // Mostrar referencias bancarias
          showSuccess(
            "¡Pagos configurados!",
            `Generadas ${result.data.references?.length || 0} referencias bancarias`,
          );
        }
      }

      // Continuar con el flujo de matching
      next();
    } catch (error: any) {
      console.error("[PaymentMethodology] Payment confirmation error:", error);
      const errorMessage = error?.message || "Error al procesar el pago";
      showError("Error de pago", errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Componente Modal para agregar/editar métodos de pago
  const AddPaymentModal = () => {
    const [selectedMethod, setSelectedMethod] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    React.useEffect(() => {
      setSelectedMethod("");
      setAmount("");
      setDescription("");
    }, []);

    const handleSave = () => {
      if (!selectedMethod || !amount) return;

      const paymentAmount = parseFloat(amount);
      const newPayment: SplitPayment = {
        id: `payment_${Date.now()}`,
        method: selectedMethod as "cash" | "card" | "wallet",
        amount: paymentAmount,
        percentage: (paymentAmount / estimatedFare) * 100,
        bankCode: selectedMethod === "bank_transfer" ? "001" : undefined,
        description: description || `Pago con ${selectedMethod}`,
        status: "pending" as const,
      };

      setMultiplePayments((prev) => [...prev, newPayment]);
      setShowAddModal(false);
      setSelectedMethod("");
      setAmount("");
      setDescription("");
    };

    return (
      <Modal visible={showAddModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-xl p-6">
            <Text className="font-JakartaBold text-lg mb-4">
              Agregar método de pago
            </Text>

            <Text className="font-JakartaMedium mb-2">Método:</Text>
            <View className="flex-row flex-wrap mb-4">
              {[
                "Credit Card",
                "Debit Card",
                "Cash",
                "Bank Transfer",
                "Digital Wallet",
              ].map((method) => (
                <TouchableOpacity
                  key={method}
                  onPress={() => setSelectedMethod(method)}
                  className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                    selectedMethod === method
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-300"
                  }`}
                >
                  <Text
                    className={
                      selectedMethod === method
                        ? "text-primary-600"
                        : "text-gray-600"
                    }
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="font-JakartaMedium mb-2">Monto:</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              className="bg-gray-50 rounded-lg px-4 py-3 mb-4 font-Jakarta"
              placeholderTextColor="#9CA3AF"
            />

            <Text className="font-JakartaMedium mb-2">
              Descripción (opcional):
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción del pago"
              className="bg-gray-50 rounded-lg px-4 py-3 mb-6 font-Jakarta"
              placeholderTextColor="#9CA3AF"
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false);
                  setSelectedMethod("");
                  setAmount("");
                  setDescription("");
                }}
                className="flex-1 bg-gray-300 rounded-lg py-3"
              >
                <Text className="text-center font-JakartaMedium">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 bg-primary-500 rounded-lg py-3"
              >
                <Text className="text-center font-JakartaMedium text-white">
                  Agregar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View className="flex-1">
      <FlowHeader
        title="Método de Pago"
        subtitle="Selecciona cómo deseas pagar tu viaje"
        onBack={back}
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-5">
          {/* Resumen del viaje */}
          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <Text className="font-JakartaBold text-lg text-gray-800 mb-2">
              Resumen del viaje
            </Text>
            <View className="flex-row justify-between items-center">
              <Text className="font-Jakarta text-gray-600">
                Distancia estimada
              </Text>
              <Text className="font-JakartaMedium text-gray-800">15.2 km</Text>
            </View>
            <View className="flex-row justify-between items-center mt-1">
              <Text className="font-Jakarta text-gray-600">
                Tiempo estimado
              </Text>
              <Text className="font-JakartaMedium text-gray-800">25 min</Text>
            </View>
            <View className="border-t border-gray-200 mt-3 pt-3">
              <View className="flex-row justify-between items-center">
                <Text className="font-JakartaBold text-lg text-gray-800">
                  Total
                </Text>
                <Text className="font-JakartaBold text-xl text-primary-600">
                  ${estimatedFare.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Tabs */}
          <View className="flex-row mb-4 bg-gray-100 rounded-lg p-1">
            <TouchableOpacity
              onPress={() => handlePaymentModeChange("single")}
              className={`flex-1 py-2 px-4 rounded-md ${
                paymentMode === "single" ? "bg-white shadow-sm" : ""
              }`}
            >
              <Text
                className={`text-center font-JakartaMedium ${
                  paymentMode === "single" ? "text-gray-800" : "text-gray-600"
                }`}
              >
                Pago único
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handlePaymentModeChange("multiple")}
              className={`flex-1 py-2 px-4 rounded-md ${
                paymentMode === "multiple" ? "bg-white shadow-sm" : ""
              }`}
            >
              <Text
                className={`text-center font-JakartaMedium ${
                  paymentMode === "multiple" ? "text-gray-800" : "text-gray-600"
                }`}
              >
                Pago múltiple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Payment Content */}
          {paymentMode === "single" ? (
            <View className="mb-6">
              <Text className="font-JakartaMedium text-gray-700 mb-3">
                Selecciona tu método de pago preferido
              </Text>
              <PaymentMethodSelector
                selectedMethodId={paymentMethod}
                onSelectMethod={setPaymentMethod}
                className="mb-4"
              />
            </View>
          ) : (
            <View className="mb-6">
              <Text className="font-JakartaMedium text-gray-700 mb-3">
                Configura múltiples métodos de pago
              </Text>

              {multiplePayments.map((payment, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between bg-gray-50 rounded-lg p-3 mb-2"
                >
                  <View className="flex-1">
                    <Text className="font-JakartaMedium">{payment.method}</Text>
                    <Text className="font-Jakarta text-sm text-gray-600">
                      ${payment.amount.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setMultiplePayments((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    className="p-1"
                  >
                    <Text className="text-red-500 text-lg font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                className="flex-row items-center justify-center bg-gray-100 rounded-lg p-3 border-2 border-dashed border-gray-300"
              >
                <Text className="text-gray-600 mr-2">+</Text>
                <Text className="text-gray-600 font-JakartaMedium">
                  Agregar método de pago
                </Text>
              </TouchableOpacity>

              {multiplePayments.length > 0 && (
                <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <Text className="font-JakartaMedium text-blue-800">
                    Total configurado: $
                    {multiplePayments
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Información importante */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <Text className="font-JakartaBold text-blue-800 mb-2">
              💳 Pago seguro
            </Text>
            <Text className="font-Jakarta text-blue-700 text-sm">
              Tu pago será procesado de forma segura. Solo se cargará cuando
              confirmes al conductor encontrado.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View className="px-5 pb-4">
        <TouchableOpacity
          disabled={!canContinue}
          onPress={handlePaymentConfirmation}
          className={`rounded-xl p-4 ${canContinue ? "bg-primary-500" : "bg-gray-300"}`}
          activeOpacity={0.8}
        >
          <Text className="text-white font-JakartaBold text-center">
            {isProcessingPayment
              ? "Procesando..."
              : paymentMode === "single"
                ? "Pagar y buscar conductor"
                : "Configurar pagos y buscar conductor"}
          </Text>
          <Text className="text-white/80 font-JakartaMedium text-sm text-center mt-1">
            💳 ${estimatedFare.toFixed(2)} • 🔍 Matching automático
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AddPaymentModal />
    </View>
  );
};

export default PaymentMethodology;
